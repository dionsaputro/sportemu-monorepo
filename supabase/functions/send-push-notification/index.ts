import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface NotificationPayload {
  record: {
    id: string
    user_id: string
    type: string
    title: string
    body: string | null
    data: Record<string, unknown> | null
  }
}

serve(async (req) => {
  try {
    const payload: NotificationPayload = await req.json()
    const { record } = payload

    // Create admin client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Get user's FCM token
    const { data: profile } = await supabase
      .from('profiles')
      .select('fcm_token')
      .eq('id', record.user_id)
      .single()

    // Only send if FCM token exists (user has Flutter app installed)
    if (!profile?.fcm_token) {
      return new Response(
        JSON.stringify({ message: 'No FCM token, skipping push notification' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get Firebase service account
    const serviceAccountJson = Deno.env.get('FIREBASE_SERVICE_ACCOUNT_JSON')
    if (!serviceAccountJson) {
      return new Response(
        JSON.stringify({ error: 'FIREBASE_SERVICE_ACCOUNT_JSON not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const serviceAccount = JSON.parse(serviceAccountJson)

    // Get OAuth2 access token for FCM v1 API
    const accessToken = await getAccessToken(serviceAccount)

    // Send FCM notification
    const fcmResponse = await fetch(
      `https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: {
            token: profile.fcm_token,
            notification: {
              title: record.title,
              body: record.body || '',
            },
            data: {
              type: record.type,
              notification_id: record.id,
              ...(record.data ? Object.fromEntries(
                Object.entries(record.data).map(([k, v]) => [k, String(v)])
              ) : {}),
            },
            android: {
              priority: 'high',
              notification: {
                channel_id: 'sportemu_default',
              },
            },
            apns: {
              payload: {
                aps: {
                  sound: 'default',
                  badge: 1,
                },
              },
            },
          },
        }),
      }
    )

    if (!fcmResponse.ok) {
      const errorText = await fcmResponse.text()
      console.error('FCM error:', errorText)

      // If token is invalid, clear it
      if (fcmResponse.status === 404 || errorText.includes('UNREGISTERED')) {
        await supabase
          .from('profiles')
          .update({ fcm_token: null })
          .eq('id', record.user_id)
      }

      return new Response(
        JSON.stringify({ error: 'FCM send failed', details: errorText }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ message: 'Push notification sent' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

/**
 * Get OAuth2 access token from service account for FCM v1 API
 */
async function getAccessToken(serviceAccount: {
  client_email: string
  private_key: string
  token_uri: string
}): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const header = { alg: 'RS256', typ: 'JWT' }
  const payload = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: serviceAccount.token_uri,
    iat: now,
    exp: now + 3600,
  }

  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  const signInput = `${encodedHeader}.${encodedPayload}`

  // Import private key and sign
  const pemContent = serviceAccount.private_key
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\n/g, '')

  const binaryKey = Uint8Array.from(atob(pemContent), (c) => c.charCodeAt(0))

  const key = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(signInput)
  )

  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')

  const jwt = `${signInput}.${encodedSignature}`

  // Exchange JWT for access token
  const tokenResponse = await fetch(serviceAccount.token_uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  })

  const tokenData = await tokenResponse.json()
  return tokenData.access_token
}

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sportemu — Platform untuk Pelatih Olahraga',
  description: 'Kelola bisnis pelatihan kamu lebih mudah. Klien, jadwal, invoice, check-in dalam satu platform.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}

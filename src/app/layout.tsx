import type { Metadata } from 'next'
// import localFont from 'next/font/local'
import './globals.css'
import { AppProviders } from './providers'

// const geistSans = localFont({
//   src: './fonts/GeistVF.woff',
//   variable: '--font-geist-sans',
//   weight: '100 900',
// })
// const geistMono = localFont({
//   src: './fonts/GeistMonoVF.woff',
//   variable: '--font-geist-mono',
//   weight: '100 900',
// })

export const metadata: Metadata = {
  title: 'NovaLibros',
  description: 'Tienda Novalibros',
}

import { AuthProvider } from '@/context/auth.context'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}

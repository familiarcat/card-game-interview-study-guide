import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Card Game Interview Study Guide',
  description: 'Master in 24 Hours, Execute in 10 Minutes',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/vsc-dark-plus.css" />
      </head>
      <body className={inter.className}>
        <div className="app-container">
          {children}
        </div>
      </body>
    </html>
  )
}

import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ejendomsgalleriet — Erhvervsejendomme til leje og salg',
  description: 'Find erhvervsejendomme til leje, salg og investering i hele Danmark. Kontor, butik, lager og mere.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="da">
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}

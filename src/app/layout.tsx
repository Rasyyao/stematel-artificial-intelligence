import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LKS Nasional AI Tracker',
  description: 'Track your journey to LKS Nasional AI competition',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-[#0a0a0a] text-white antialiased`}>
        {children}
        <Toaster position="top-right" theme="dark" richColors />
      </body>
    </html>
  )
}

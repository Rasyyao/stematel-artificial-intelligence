'use client'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

export default function Navbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-xl shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image src="/lks-dikmen.png" alt="LKS" width={32} height={32} />
          <span className="font-bold text-[#333333]">LKS AI Tracker</span>
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm text-gray-500">
          <Link href="/datasets" className="hover:text-[#BF2026] transition-colors font-medium">Datasets</Link>
          <Link href="/#submissions" className="hover:text-[#BF2026] transition-colors font-medium">Submission</Link>
          <Link href="/submit" className="hover:text-[#BF2026] transition-colors font-medium">Submit</Link>
        </div>
        <Link href="/submit">
          <Button size="sm" className="bg-[#BF2026] hover:bg-[#ED2224] text-white">Submit Notebook</Button>
        </Link>
      </div>
    </motion.nav>
  )
}

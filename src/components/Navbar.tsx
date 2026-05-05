'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Navbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/8 bg-black/60 backdrop-blur-xl"
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center group-hover:bg-violet-500 transition-colors">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-white">LKS AI Tracker</span>
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm text-white/60">
          <Link href="/#datasets" className="hover:text-white transition-colors">Datasets</Link>
          <Link href="/#submissions" className="hover:text-white transition-colors">Submissions</Link>
          <Link href="/submit" className="hover:text-white transition-colors">Submit Work</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/submit">
            <Button size="sm">Submit Notebook</Button>
          </Link>
        </div>
      </div>
    </motion.nav>
  )
}

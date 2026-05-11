'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const TARGET_DATE = new Date('2026-07-26T00:00:00+07:00')

function getTimeLeft() {
  const now = new Date()
  const diff = TARGET_DATE.getTime() - now.getTime()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / 1000 / 60) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-2xl border-2 border-[#BF2026]/25 bg-white flex items-center justify-center overflow-hidden shadow-md">
        <div className="absolute inset-0 bg-gradient-to-b from-[#BF2026]/5 to-transparent" />
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="text-3xl md:text-5xl font-bold font-mono text-[#BF2026] relative z-10"
          >
            {String(value).padStart(2, '0')}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="mt-3 text-xs md:text-sm font-semibold text-gray-500 uppercase tracking-widest">{label}</span>
    </div>
  )
}

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft())

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="py-20 px-4 bg-white border-y border-gray-100">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-4">
          <span className="text-[#ED2224] text-sm font-bold uppercase tracking-widest">Hitung Mundur Kompetisi</span>
        </motion.div>
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
          className="text-3xl md:text-4xl font-bold mb-3 text-[#333333]">
          LKS Nasional 2026
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
          className="text-gray-500 mb-12">
          26 Juli 2026 · Tetap fokus, terus berlatih
        </motion.p>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-4 md:gap-8">
          <TimeUnit value={timeLeft.days} label="Hari" />
          <span className="text-3xl md:text-5xl font-bold text-[#BF2026]/30 mb-8">:</span>
          <TimeUnit value={timeLeft.hours} label="Jam" />
          <span className="text-3xl md:text-5xl font-bold text-[#BF2026]/30 mb-8">:</span>
          <TimeUnit value={timeLeft.minutes} label="Menit" />
          <span className="text-3xl md:text-5xl font-bold text-[#BF2026]/30 mb-8">:</span>
          <TimeUnit value={timeLeft.seconds} label="Detik" />
        </motion.div>
      </div>
    </section>
  )
}

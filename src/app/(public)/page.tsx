'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import DatasetCard from '@/components/DatasetCard'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { formatRelativeTime } from '@/lib/utils'
import { Upload, Users, Database, FileText, Bell, ChevronDown } from 'lucide-react'
import type { Dataset, Submission, Announcement } from '@/lib/types'

const TARGET_DATE = new Date('2026-07-26T00:00:00+07:00')

function getTimeLeft() {
  const diff = TARGET_DATE.getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl border-2 border-[#BF2026]/25 bg-white flex items-center justify-center overflow-hidden shadow-md">
        <div className="absolute inset-0 bg-gradient-to-b from-[#BF2026]/5 to-transparent" />
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="text-xl sm:text-2xl md:text-3xl font-bold font-mono text-[#BF2026] relative z-10"
          >
            {String(value).padStart(2, '0')}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="mt-2 text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-widest">{label}</span>
    </div>
  )
}

const statusStyles: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  reviewed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  good: 'bg-green-500/10 text-green-400 border-green-500/20',
  needs_improvement: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
}
const statusLabel: Record<string, string> = {
  pending: 'Pending', reviewed: 'Reviewed', good: 'Good', needs_improvement: 'Perlu Perbaikan',
}

export default function HomePage() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft())
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [stats, setStats] = useState({ submissions: 0, students: 0, datasets: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    async function load() {
      const [d, s, a, sc, dc] = await Promise.all([
        supabase.from('datasets').select('*').order('created_at', { ascending: false }).limit(6),
        supabase.from('submissions').select('*, dataset:datasets(title)').order('created_at', { ascending: false }).limit(8),
        supabase.from('announcements').select('*').order('pinned', { ascending: false }).order('created_at', { ascending: false }).limit(3),
        supabase.from('submissions').select('id, student_name'),
        supabase.from('datasets').select('id', { count: 'exact', head: true }),
      ])
      setDatasets(d.data ?? [])
      setSubmissions((s.data ?? []) as Submission[])
      setAnnouncements(a.data ?? [])
      setStats({
        submissions: sc.data?.length ?? 0,
        students: new Set(sc.data?.map(x => x.student_name)).size,
        datasets: dc.count ?? 0,
      })
      setLoading(false)
    }
    load()
  }, [])

  function handleDownload(dataset: Dataset) {
    window.open(`/api/download/dataset/${dataset.id}`, '_blank')
  }

  const leaderboard = submissions.reduce<Record<string, number>>((acc, s) => {
    acc[s.student_name] = (acc[s.student_name] || 0) + 1
    return acc
  }, {})
  const topStudents = Object.entries(leaderboard).sort((a, b) => b[1] - a[1]).slice(0, 5)

  return (
    <div className="bg-[#F5F5F5] text-[#333333]">

      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4 pt-4">
        <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-[#BF2026]/6 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-blue-600/6 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <Image
              src="/smk-telkom-logo.png"
              alt="SMK Telkom Purwokerto"
              width={200}
              height={64}
              className="mx-auto drop-shadow-sm"
              priority
            />
          </motion.div>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#BF2026]/20 bg-[#BF2026]/8 text-[#BF2026] text-xs font-semibold uppercase tracking-widest mb-5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#ED2224] animate-pulse" />
            Jawa Tengah · 26 Juli 2026
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-3"
          >
            Persiapan LKS
            <br />
            <span className="gradient-text">Eksibisi AI Nasional</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-500 text-sm sm:text-base mb-10"
          >
            Latih dirimu, upload notebook, dan pantau progresmu menuju kompetisi nasional.
          </motion.p>

          {/* Countdown */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.45 }}
            className="flex items-center justify-center gap-3 sm:gap-4 md:gap-6 mb-10"
          >
            <TimeUnit value={timeLeft.days} label="Hari" />
            <span className="text-2xl md:text-3xl font-bold text-[#BF2026]/30 mb-6">:</span>
            <TimeUnit value={timeLeft.hours} label="Jam" />
            <span className="text-2xl md:text-3xl font-bold text-[#BF2026]/30 mb-6">:</span>
            <TimeUnit value={timeLeft.minutes} label="Menit" />
            <span className="text-2xl md:text-3xl font-bold text-[#BF2026]/30 mb-6">:</span>
            <TimeUnit value={timeLeft.seconds} label="Detik" />
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="flex flex-col sm:flex-row items-center gap-3"
          >
            <Link href="/submit">
              <Button size="lg" className="gap-2 shadow-lg shadow-[#BF2026]/15 px-8 h-11">
                <Upload className="w-4 h-4" />
                Submit Notebook
              </Button>
            </Link>
            <a href="#datasets">
              <Button size="lg" variant="outline" className="gap-2 px-7 h-11 text-black">
                <Database className="w-4 h-4" />
                Lihat Dataset
              </Button>
            </a>
            <a href="#submissions">
              <Button size="lg" variant="outline" className="gap-2 px-7 h-11 text-black">
                <FileText className="w-4 h-4" />
                Lihat Submission
              </Button>
            </a>
          </motion.div>

          {/* Stats row */}
          {!loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex items-center gap-6 mt-10 text-gray-400 text-sm"
            >
              <span>{stats.submissions} submission</span>
              <span>·</span>
              <span>{stats.students} peserta</span>
              <span>·</span>
              <span>{stats.datasets} dataset</span>
            </motion.div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-gray-300"
        >
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </motion.div>
      </section>

      {/* ANNOUNCEMENTS */}
      {announcements.length > 0 && (
        <section className="px-4 py-8 border-t border-gray-100">
          <div className="max-w-4xl mx-auto space-y-3">
            {announcements.map((ann, i) => (
              <motion.div
                key={ann.id}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`flex items-start gap-3 p-4 rounded-xl border ${ann.pinned ? 'border-[#BF2026]/25 bg-[#BF2026]/5' : 'border-gray-200 bg-white'}`}
              >
                <Bell className={`w-4 h-4 mt-0.5 flex-shrink-0 ${ann.pinned ? 'text-[#ED2224]' : 'text-gray-400'}`} />
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-sm">{ann.title}</span>
                    {ann.pinned && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-[#ED2224] font-semibold tracking-wider">PINNED</span>}
                  </div>
                  <p className="text-sm text-gray-500">{ann.content}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* STATS */}
      <section className="px-4 py-12 border-t border-gray-100">
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Submission', value: stats.submissions, icon: FileText, color: 'text-[#ED2224]', bg: 'bg-[#BF2026]/8' },
              { label: 'Peserta', value: stats.students, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { label: 'Dataset', value: stats.datasets, icon: Database, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            ].map((s, i) => {
              const Icon = s.icon
              return (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass rounded-2xl p-5 text-center border border-gray-100"
                >
                  <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mx-auto mb-3`}>
                    <Icon className={`w-5 h-5 ${s.color}`} />
                  </div>
                  <div className="text-3xl font-bold">{loading ? '—' : s.value}</div>
                  <div className="text-xs text-gray-400 mt-1 font-medium uppercase tracking-wider">{s.label}</div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* DATASETS */}
      <section id="datasets" className="px-4 py-16 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10"
          >
            <span className="text-[#ED2224] text-xs font-semibold uppercase tracking-widest">Dataset</span>
            <h2 className="text-3xl font-bold mt-2 mb-2">Dataset Latihan</h2>
            <p className="text-gray-500">Download dataset untuk sesi latihan kamu</p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => <div key={i} className="h-44 rounded-2xl bg-gray-50 animate-pulse" />)}
            </div>
          ) : datasets.length === 0 ? (
            <div className="text-center py-20 text-gray-400 border border-gray-200 rounded-2xl">
              <Database className="w-12 h-12 mx-auto mb-4 opacity-40" />
              <p>Belum ada dataset. Cek lagi nanti.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {datasets.map((d, i) => (
                <motion.div
                  key={d.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                >
                  <DatasetCard dataset={d} onDownload={handleDownload} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* SUBMISSIONS + LEADERBOARD */}
      <section id="submissions" className="px-4 py-16 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-8"
              >
                <span className="text-[#ED2224] text-xs font-semibold uppercase tracking-widest">Aktivitas</span>
                <h2 className="text-3xl font-bold mt-2 mb-2">Submission Terbaru</h2>
                <p className="text-gray-500">Notebook terbaru yang diupload tim</p>
              </motion.div>

              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-gray-50 animate-pulse" />)}
                </div>
              ) : submissions.length === 0 ? (
                <div className="text-center py-14 border border-gray-200 rounded-2xl text-gray-400">
                  <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p>Belum ada submission — jadilah yang pertama!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {submissions.map((sub, i) => (
                    <motion.div
                      key={sub.id}
                      initial={{ opacity: 0, x: -16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 bg-white hover:border-[#BF2026]/20 transition-all group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-[#BF2026]/8 border border-[#BF2026]/15 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-[#ED2224]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate group-hover:text-[#BF2026] transition-colors">{sub.title}</div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {sub.student_name} · {formatRelativeTime(sub.created_at)}
                        </div>
                      </div>
                      <span className={`text-[11px] px-2 py-1 rounded-md border font-medium flex-shrink-0 ${statusStyles[sub.status]}`}>
                        {statusLabel[sub.status]}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}

              <div className="mt-8">
                <Link href="/submit">
                  <Button variant="outline" className="gap-2 w-full sm:w-auto">
                    <Upload className="w-4 h-4" />
                    Submit Notebook Kamu
                  </Button>
                </Link>
              </div>
            </div>

            {/* Leaderboard */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-8"
              >
                <span className="text-[#ED2224] text-xs font-semibold uppercase tracking-widest">Ranking</span>
                <h2 className="text-3xl font-bold mt-2 mb-2">Leaderboard</h2>
                <p className="text-gray-500">Berdasarkan jumlah submission</p>
              </motion.div>

              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => <div key={i} className="h-14 rounded-xl bg-gray-50 animate-pulse" />)}
                </div>
              ) : topStudents.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-sm">Belum ada data</div>
              ) : (
                <div className="space-y-2">
                  {topStudents.map(([name, count], i) => (
                    <motion.div
                      key={name}
                      initial={{ opacity: 0, x: 16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-200 bg-white"
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                        i === 0 ? 'bg-yellow-500/15 text-yellow-400' :
                        i === 1 ? 'bg-slate-400/15 text-slate-300' :
                        i === 2 ? 'bg-orange-700/15 text-orange-400' :
                        'bg-gray-50 text-gray-400'
                      }`}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{name}</div>
                      </div>
                      <div className="text-sm font-semibold text-[#ED2224] flex-shrink-0">
                        {count}<span className="text-gray-400 font-normal text-xs ml-0.5"> sub</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-200 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-400 text-sm">
          <div className="flex items-center gap-3">
            <Image src="/smk-telkom-logo.png" alt="SMK Telkom Purwokerto" width={120} height={38} className="opacity-50" />
          </div>
          <span className="text-xs text-center">Persiapan LKS Eksibisi AI Nasional · SMK Telkom Purwokerto 2026</span>
          <Link href="/admin/login" className="hover:text-gray-500 transition-colors text-xs">
            Admin
          </Link>
        </div>
      </footer>
    </div>
  )
}

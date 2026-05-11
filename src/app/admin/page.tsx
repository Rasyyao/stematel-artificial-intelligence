'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { supabase } from '@/lib/supabase'
import { formatRelativeTime } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { FileText, Database, Users, Clock, CheckCircle, TrendingUp, Trophy, AlertCircle, Sprout, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Submission } from '@/lib/types'

function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })
}

const statusBadge: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  reviewed: 'bg-blue-50 text-blue-700 border border-blue-200',
  good: 'bg-green-50 text-green-700 border border-green-200',
  needs_improvement: 'bg-orange-50 text-orange-700 border border-orange-200',
}
const statusLabel: Record<string, string> = {
  pending: 'Pending',
  reviewed: 'Reviewed',
  good: 'Good',
  needs_improvement: 'Needs Work',
}

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [datasetCount, setDatasetCount] = useState(0)
  const [seeding, setSeeding] = useState(false)

  async function handleSeed() {
    if (!confirm('Seed database dengan data awal? (announcements contoh akan ditambahkan)')) return
    setSeeding(true)
    const res = await fetch('/api/seed', { method: 'POST' })
    if (res.ok) {
      toast.success('Database berhasil di-seed!')
    } else {
      const { error } = await res.json()
      toast.error(error || 'Seed gagal')
    }
    setSeeding(false)
  }

  useEffect(() => {
    async function load() {
      const [subRes, dsRes] = await Promise.all([
        supabase.from('submissions').select('*').order('created_at', { ascending: false }),
        supabase.from('datasets').select('id', { count: 'exact', head: true }),
      ])
      setSubmissions((subRes.data ?? []) as Submission[])
      setDatasetCount(dsRes.count ?? 0)
      setLoading(false)
    }
    load()
  }, [])

  const pending = submissions.filter(s => s.status === 'pending').length
  const good = submissions.filter(s => s.status === 'good').length
  const students = new Set(submissions.map(s => s.student_name)).size

  // Chart data
  const days = getLast7Days()
  const chartData = days.map(day => ({
    day: new Intl.DateTimeFormat('id-ID', { weekday: 'short' }).format(new Date(day)),
    count: submissions.filter(s => s.created_at.startsWith(day)).length,
  }))

  // Leaderboard
  const leaderboard = submissions.reduce<Record<string, number>>((acc, s) => {
    acc[s.student_name] = (acc[s.student_name] || 0) + 1
    return acc
  }, {})
  const topStudents = Object.entries(leaderboard).sort((a, b) => b[1] - a[1]).slice(0, 5)

  const statCards = [
    { label: 'Total Submissions', value: submissions.length, icon: FileText, color: 'text-[#BF2026]', bg: 'bg-[#BF2026]/8', border: 'border-[#BF2026]/20' },
    { label: 'Pending Review', value: pending, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
    { label: 'Approved', value: good, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
    { label: 'Active Students', value: students, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    { label: 'Datasets', value: datasetCount, icon: Database, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  ]

  return (
    <div className="p-8 max-w-7xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">LKS Nasional AI Training Overview</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleSeed} disabled={seeding} className="gap-2 text-xs">
          {seeding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sprout className="w-3.5 h-3.5" />}
          Seed Database
        </Button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {statCards.map((s, i) => {
          const Icon = s.icon
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`rounded-xl border ${s.border} ${s.bg} p-4`}
            >
              <Icon className={`w-5 h-5 ${s.color} mb-3`} />
              <div className="text-2xl font-bold">{loading ? '—' : s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-4 h-4 text-[#BF2026]" />
            <h2 className="font-semibold text-sm text-[#333333]">Submissions — Last 7 Days</h2>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, color: '#333333', fontSize: 13 }}
                cursor={{ fill: 'rgba(191,32,38,0.06)' }}
              />
              <Bar dataKey="count" fill="#BF2026" radius={[4, 4, 0, 0]} name="Submissions" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-xl border border-gray-200 bg-white p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <Trophy className="w-4 h-4 text-yellow-600" />
            <h2 className="font-semibold text-sm text-[#333333]">Leaderboard</h2>
          </div>
          {topStudents.length === 0 ? (
            <div className="text-center text-gray-400 text-sm py-8">No submissions yet</div>
          ) : (
            <div className="space-y-2">
              {topStudents.map(([name, count], i) => (
                <div key={name} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    i === 0 ? 'bg-yellow-100 text-yellow-700' :
                    i === 1 ? 'bg-slate-100 text-slate-500' :
                    i === 2 ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {i + 1}
                  </div>
                  <span className="flex-1 text-sm truncate text-[#333333]">{name}</span>
                  <span className="text-xs font-semibold text-[#BF2026]">{count}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-xl border border-gray-200 bg-white p-6"
      >
        <div className="flex items-center gap-2 mb-5">
          <AlertCircle className="w-4 h-4 text-[#BF2026]" />
          <h2 className="font-semibold text-sm text-[#333333]">Recent Submissions</h2>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-12 rounded-lg bg-gray-50 animate-pulse" />)}
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center text-gray-400 py-8 text-sm">No submissions yet</div>
        ) : (
          <div className="space-y-2">
            {submissions.slice(0, 8).map(sub => (
              <a
                key={sub.id}
                href={`/admin/submissions/${sub.id}`}
                className="flex items-center gap-4 p-3.5 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-[#BF2026]/8 border border-[#BF2026]/15 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-3.5 h-3.5 text-[#BF2026]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate group-hover:text-[#BF2026] transition-colors">{sub.title}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{sub.student_name} · {formatRelativeTime(sub.created_at)}</div>
                </div>
                <span className={`text-[11px] px-2 py-1 rounded-md flex-shrink-0 font-medium ${statusBadge[sub.status]}`}>
                  {statusLabel[sub.status]}
                </span>
              </a>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}

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
  pending: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  reviewed: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  good: 'bg-green-500/10 text-green-400 border border-green-500/20',
  needs_improvement: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
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
    { label: 'Total Submissions', value: submissions.length, icon: FileText, color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
    { label: 'Pending Review', value: pending, icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
    { label: 'Approved', value: good, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
    { label: 'Active Students', value: students, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { label: 'Datasets', value: datasetCount, icon: Database, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  ]

  return (
    <div className="p-8 max-w-7xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-white/40 text-sm mt-1">LKS Nasional AI Training Overview</p>
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
              <div className="text-xs text-white/40 mt-1">{s.label}</div>
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
          className="lg:col-span-2 rounded-xl border border-white/8 bg-white/[0.02] p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-4 h-4 text-violet-400" />
            <h2 className="font-semibold text-sm">Submissions — Last 7 Days</h2>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', fontSize: 13 }}
                cursor={{ fill: 'rgba(139,92,246,0.08)' }}
              />
              <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Submissions" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-xl border border-white/8 bg-white/[0.02] p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <h2 className="font-semibold text-sm">Leaderboard</h2>
          </div>
          {topStudents.length === 0 ? (
            <div className="text-center text-white/25 text-sm py-8">No submissions yet</div>
          ) : (
            <div className="space-y-2">
              {topStudents.map(([name, count], i) => (
                <div key={name} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    i === 0 ? 'bg-yellow-500/15 text-yellow-400' :
                    i === 1 ? 'bg-slate-400/15 text-slate-300' :
                    i === 2 ? 'bg-orange-700/15 text-orange-400' : 'bg-white/5 text-white/25'
                  }`}>
                    {i + 1}
                  </div>
                  <span className="flex-1 text-sm truncate">{name}</span>
                  <span className="text-xs font-semibold text-violet-400">{count}</span>
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
        className="rounded-xl border border-white/8 bg-white/[0.02] p-6"
      >
        <div className="flex items-center gap-2 mb-5">
          <AlertCircle className="w-4 h-4 text-violet-400" />
          <h2 className="font-semibold text-sm">Recent Submissions</h2>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-12 rounded-lg bg-white/[0.03] animate-pulse" />)}
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center text-white/25 py-8 text-sm">No submissions yet</div>
        ) : (
          <div className="space-y-2">
            {submissions.slice(0, 8).map(sub => (
              <a
                key={sub.id}
                href={`/admin/submissions/${sub.id}`}
                className="flex items-center gap-4 p-3.5 rounded-lg hover:bg-white/[0.03] transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/15 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-3.5 h-3.5 text-violet-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate group-hover:text-violet-300 transition-colors">{sub.title}</div>
                  <div className="text-xs text-white/35 mt-0.5">{sub.student_name} · {formatRelativeTime(sub.created_at)}</div>
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

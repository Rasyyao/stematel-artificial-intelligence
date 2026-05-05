'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { formatRelativeTime, formatBytes } from '@/lib/utils'
import { FileText, Search, Filter, ChevronRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import type { Submission } from '@/lib/types'

const statusBadge: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  reviewed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  good: 'bg-green-500/10 text-green-400 border-green-500/20',
  needs_improvement: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
}
const statusLabel: Record<string, string> = {
  pending: 'Pending',
  reviewed: 'Reviewed',
  good: 'Good',
  needs_improvement: 'Needs Work',
}

const FILTERS = ['all', 'pending', 'reviewed', 'good', 'needs_improvement'] as const

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<typeof FILTERS[number]>('all')

  useEffect(() => {
    supabase
      .from('submissions')
      .select('*, dataset:datasets(title)')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setSubmissions((data ?? []) as Submission[])
        setLoading(false)
      })
  }, [])

  const filtered = submissions.filter(s => {
    const matchesFilter = filter === 'all' || s.status === filter
    const q = search.toLowerCase()
    const matchesSearch = !q || s.title.toLowerCase().includes(q) || s.student_name.toLowerCase().includes(q)
    return matchesFilter && matchesSearch
  })

  return (
    <div className="p-8 max-w-6xl">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold">Submissions</h1>
        <p className="text-white/40 text-sm mt-1">{submissions.length} total submissions</p>
      </motion.div>

      {/* Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-3 mb-6"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
          <Input
            placeholder="Search by student name or title..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
          <Filter className="w-4 h-4 text-white/30 flex-shrink-0" />
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                filter === f
                  ? 'bg-violet-600 text-white'
                  : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10'
              }`}
            >
              {f === 'all' ? 'All' : statusLabel[f]}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-xl border border-white/8 overflow-hidden"
      >
        {loading ? (
          <div className="p-8 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-14 rounded-lg bg-white/[0.03] animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-white/25">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>{search || filter !== 'all' ? 'No submissions match your filters' : 'No submissions yet'}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8 bg-white/[0.02]">
                <th className="text-left p-4 text-xs font-medium text-white/40 uppercase tracking-wider">Student</th>
                <th className="text-left p-4 text-xs font-medium text-white/40 uppercase tracking-wider">Title</th>
                <th className="text-left p-4 text-xs font-medium text-white/40 uppercase tracking-wider hidden md:table-cell">Dataset</th>
                <th className="text-left p-4 text-xs font-medium text-white/40 uppercase tracking-wider hidden lg:table-cell">Size</th>
                <th className="text-left p-4 text-xs font-medium text-white/40 uppercase tracking-wider hidden sm:table-cell">Date</th>
                <th className="text-left p-4 text-xs font-medium text-white/40 uppercase tracking-wider">Status</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((sub, i) => (
                <motion.tr
                  key={sub.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/15 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-violet-400">{sub.student_name[0]?.toUpperCase()}</span>
                      </div>
                      <span className="font-medium truncate max-w-[100px]">{sub.student_name}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-medium truncate max-w-[200px] block group-hover:text-violet-300 transition-colors">{sub.title}</span>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <span className="text-white/40 text-xs">{(sub.dataset as {title?: string})?.title ?? '—'}</span>
                  </td>
                  <td className="p-4 hidden lg:table-cell">
                    <span className="text-white/40 text-xs">{formatBytes(sub.file_size)}</span>
                  </td>
                  <td className="p-4 hidden sm:table-cell">
                    <span className="text-white/40 text-xs">{formatRelativeTime(sub.created_at)}</span>
                  </td>
                  <td className="p-4">
                    <span className={`text-[11px] px-2 py-1 rounded-md border font-medium ${statusBadge[sub.status]}`}>
                      {statusLabel[sub.status]}
                    </span>
                  </td>
                  <td className="p-4">
                    <Link href={`/admin/submissions/${sub.id}`} className="p-1.5 rounded-lg hover:bg-white/10 text-white/25 hover:text-white transition-colors inline-flex">
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>
    </div>
  )
}

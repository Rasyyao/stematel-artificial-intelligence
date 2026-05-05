'use client'

import { useState, useEffect, use } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { formatRelativeTime, formatBytes } from '@/lib/utils'
import NotebookViewer from '@/components/NotebookViewer'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Download, FileText, User, Calendar, Database, MessageSquare, CheckCircle, Loader2 } from 'lucide-react'
import type { Submission, Review } from '@/lib/types'

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'text-yellow-400' },
  { value: 'reviewed', label: 'Reviewed', color: 'text-blue-400' },
  { value: 'good', label: 'Good ✓', color: 'text-green-400' },
  { value: 'needs_improvement', label: 'Needs Improvement', color: 'text-orange-400' },
]

const statusBadge: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  reviewed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  good: 'bg-green-500/10 text-green-400 border-green-500/20',
  needs_improvement: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
}

type PageParams = { params: Promise<{ id: string }> }

export default function SubmissionDetailPage({ params }: PageParams) {
  const { id } = use(params)
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [notebookContent, setNotebookContent] = useState<string | null>(null)
  const [notebookLoading, setNotebookLoading] = useState(true)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'notebook' | 'review'>('notebook')
  const [reviewForm, setReviewForm] = useState({ comment: '', status: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function load() {
      const [subRes, revRes] = await Promise.all([
        supabase.from('submissions').select('*, dataset:datasets(*)').eq('id', id).single(),
        supabase.from('reviews').select('*').eq('submission_id', id).order('created_at', { ascending: false }),
      ])
      if (subRes.data) {
        setSubmission(subRes.data as Submission)
        setReviewForm(f => ({ ...f, status: subRes.data.status }))
      }
      setReviews((revRes.data ?? []) as Review[])
      setLoading(false)
    }

    async function loadNotebook() {
      const res = await fetch(`/api/notebooks/${id}`)
      if (res.ok) {
        setNotebookContent(await res.text())
      }
      setNotebookLoading(false)
    }

    load()
    loadNotebook()
  }, [id])

  async function handleReview(e: React.FormEvent) {
    e.preventDefault()
    if (!reviewForm.comment.trim()) return toast.error('Add a comment')
    if (!reviewForm.status) return toast.error('Select a status')

    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submission_id: id,
          comment: reviewForm.comment.trim(),
          status: reviewForm.status,
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error)

      const newReview = await res.json()
      setReviews(prev => [newReview, ...prev])
      setSubmission(prev => prev ? { ...prev, status: reviewForm.status as Submission['status'] } : prev)
      setReviewForm(f => ({ ...f, comment: '' }))
      toast.success('Review submitted!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  function handleDownload() {
    if (!submission) return
    window.open(`/api/notebooks/${submission.id}`, '_blank')
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-6 h-6 animate-spin text-white/30" />
      </div>
    )
  }

  if (!submission) {
    return (
      <div className="p-8 text-center text-white/40">
        <p>Submission not found.</p>
        <Link href="/admin/submissions"><Button variant="outline" className="mt-4">Back to list</Button></Link>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <Link href="/admin/submissions" className="inline-flex items-center gap-2 text-white/35 hover:text-white/60 text-sm transition-colors mb-4 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          All Submissions
        </Link>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold">{submission.title}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-white/40 flex-wrap">
              <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />{submission.student_name}</span>
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{formatRelativeTime(submission.created_at)}</span>
              <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" />{formatBytes(submission.file_size)}</span>
              {(submission.dataset as {title?: string})?.title && (
                <span className="flex items-center gap-1.5"><Database className="w-3.5 h-3.5" />{(submission.dataset as {title?: string}).title}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm px-3 py-1.5 rounded-lg border font-medium ${statusBadge[submission.status]}`}>
              {STATUS_OPTIONS.find(s => s.value === submission.status)?.label}
            </span>
            <Button size="sm" variant="outline" onClick={handleDownload} className="gap-2 text-xs h-8">
              <Download className="w-3.5 h-3.5" /> Download
            </Button>
          </div>
        </div>

        {submission.notes && (
          <div className="mt-4 p-4 rounded-xl border border-white/8 bg-white/[0.02] text-sm text-white/60 max-w-2xl">
            <span className="text-white/30 text-xs uppercase font-medium tracking-wider block mb-1">Notes from student</span>
            {submission.notes}
          </div>
        )}
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-lg bg-white/[0.04] border border-white/8 w-fit mb-6">
        {[
          { key: 'notebook', label: 'Notebook', icon: FileText },
          { key: 'review', label: `Reviews ${reviews.length > 0 ? `(${reviews.length})` : ''}`, icon: MessageSquare },
        ].map(t => {
          const Icon = t.icon
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key as typeof tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                tab === t.key ? 'bg-violet-600 text-white shadow-sm' : 'text-white/50 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'notebook' ? (
          <motion.div key="notebook" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {notebookLoading ? (
              <div className="flex flex-col items-center justify-center py-24 text-white/30">
                <Loader2 className="w-8 h-8 animate-spin mb-4" />
                <p className="text-sm">Loading notebook...</p>
              </div>
            ) : notebookContent ? (
              <div className="rounded-xl border border-white/8 overflow-hidden bg-[#0d0d0d] p-6">
                <NotebookViewer content={notebookContent} />
              </div>
            ) : (
              <div className="text-center py-16 text-white/30 border border-white/8 rounded-xl">
                <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p>Could not load notebook content.</p>
                <Button variant="outline" className="mt-4 gap-2" onClick={handleDownload}>
                  <Download className="w-4 h-4" /> Download to View
                </Button>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="review" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Review Form */}
              <div>
                <h2 className="font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-violet-400" />
                  Add Review
                </h2>
                <form onSubmit={handleReview} className="space-y-4 rounded-xl border border-white/8 bg-white/[0.02] p-5">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={reviewForm.status} onValueChange={v => setReviewForm(f => ({ ...f, status: v }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status..." />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map(s => (
                          <SelectItem key={s.value} value={s.value}>
                            <span className={s.color}>{s.label}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Comment *</Label>
                    <Textarea
                      placeholder="Write your feedback for the student..."
                      value={reviewForm.comment}
                      onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                      className="min-h-[140px]"
                    />
                  </div>

                  <Button type="submit" disabled={submitting} className="w-full gap-2">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </form>
              </div>

              {/* Review History */}
              <div>
                <h2 className="font-semibold mb-4 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-violet-400" />
                  Review History
                </h2>
                {reviews.length === 0 ? (
                  <div className="text-center py-12 text-white/25 border border-white/8 rounded-xl text-sm">
                    No reviews yet
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reviews.map((review, i) => (
                      <motion.div
                        key={review.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="p-4 rounded-xl border border-white/8 bg-white/[0.02]"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-[11px] px-2 py-1 rounded-md border font-medium ${statusBadge[review.status]}`}>
                            {STATUS_OPTIONS.find(s => s.value === review.status)?.label}
                          </span>
                          <span className="text-xs text-white/25">{formatRelativeTime(review.created_at)}</span>
                        </div>
                        <p className="text-sm text-white/65 leading-relaxed">{review.comment}</p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

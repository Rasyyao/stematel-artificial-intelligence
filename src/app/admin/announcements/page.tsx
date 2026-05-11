'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Megaphone, Plus, X, Trash2, Pin } from 'lucide-react'
import type { Announcement } from '@/lib/types'

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', pinned: false })

  useEffect(() => { loadAnnouncements() }, [])

  async function loadAnnouncements() {
    const { data } = await supabase
      .from('announcements')
      .select('*')
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false })
    setAnnouncements((data ?? []) as Announcement[])
    setLoading(false)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return toast.error('Enter a title')
    if (!form.content.trim()) return toast.error('Enter content')

    setSaving(true)
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast.success('Announcement posted!')
      setForm({ title: '', content: '', pinned: false })
      setShowForm(false)
      await loadAnnouncements()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to post')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this announcement?')) return
    const res = await fetch(`/api/admin/announcements/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Deleted')
      setAnnouncements(prev => prev.filter(a => a.id !== id))
    } else {
      toast.error('Failed to delete')
    }
  }

  return (
    <div className="p-8 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Announcements</h1>
          <p className="text-gray-500 text-sm mt-1">{announcements.length} announcements</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'New Announcement'}
        </Button>
      </motion.div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-8"
          >
            <form onSubmit={handleCreate} className="rounded-xl border border-[#BF2026]/20 bg-[#BF2026]/5 p-6 space-y-4">
              <h2 className="font-semibold text-[#BF2026] flex items-center gap-2">
                <Megaphone className="w-4 h-4" /> Post Announcement
              </h2>

              <div className="space-y-2">
                <Label>Title *</Label>
                <Input placeholder="e.g. Training session this Saturday" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>

              <div className="space-y-2">
                <Label>Content *</Label>
                <Textarea placeholder="Write the full announcement..." value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} className="min-h-[100px]" />
              </div>

              <label className="flex items-center gap-3 cursor-pointer group">
                <div
                  onClick={() => setForm(f => ({ ...f, pinned: !f.pinned }))}
                  className={`w-10 h-6 rounded-full transition-colors ${form.pinned ? 'bg-red-600' : 'bg-gray-100'} relative`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${form.pinned ? 'left-5' : 'left-1'}`} />
                </div>
                <span className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors flex items-center gap-1.5">
                  <Pin className="w-3.5 h-3.5" /> Pin to top of landing page
                </span>
              </label>

              <Button type="submit" disabled={saving} className="gap-2">
                {saving ? 'Posting...' : 'Post Announcement'}
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-gray-50 animate-pulse" />)}
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-20 text-gray-400 border border-gray-200 rounded-xl">
          <Megaphone className="w-12 h-12 mx-auto mb-4 opacity-40" />
          <p>No announcements yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((ann, i) => (
            <motion.div
              key={ann.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`flex items-start gap-4 p-5 rounded-xl border transition-all group ${ann.pinned ? 'border-red-500/30 bg-red-500/5' : 'border-gray-200 bg-white hover:border-gray-200'}`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${ann.pinned ? 'bg-red-500/15 border border-red-500/20' : 'bg-gray-50 border border-gray-200'}`}>
                {ann.pinned ? <Pin className="w-4 h-4 text-red-400" /> : <Megaphone className="w-4 h-4 text-gray-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{ann.title}</span>
                  {ann.pinned && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-semibold tracking-wider">PINNED</span>}
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">{ann.content}</p>
                <span className="text-xs text-gray-400 mt-2 block">{formatDate(ann.created_at)}</span>
              </div>
              <button
                onClick={() => handleDelete(ann.id)}
                className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

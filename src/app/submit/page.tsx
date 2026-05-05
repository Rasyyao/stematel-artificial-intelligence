'use client'

import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { toast } from 'sonner'
import Navbar from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { supabase } from '@/lib/supabase'
import { formatBytes } from '@/lib/utils'
import { Upload, FileText, Check, X, ArrowLeft, Loader2 } from 'lucide-react'
import type { Dataset } from '@/lib/types'

export default function SubmitPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({ student_name: '', title: '', dataset_id: '', notes: '' })

  useEffect(() => {
    supabase.from('datasets').select('id, title, category').order('created_at', { ascending: false })
      .then(({ data }) => setDatasets((data ?? []) as Dataset[]))
  }, [])

  const onDrop = useCallback((accepted: File[]) => {
    const f = accepted[0]
    if (f?.name.endsWith('.ipynb')) {
      setFile(f)
    } else {
      toast.error('Only .ipynb files are accepted')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/json': ['.ipynb'] },
    maxFiles: 1,
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.student_name.trim()) return toast.error('Please enter your name')
    if (!form.title.trim()) return toast.error('Please enter a submission title')
    if (!file) return toast.error('Please upload a .ipynb notebook file')

    setUploading(true)
    setUploadProgress(15)

    try {
      setUploadProgress(35)
      const fd = new FormData()
      fd.append('file', file)
      fd.append('type', 'notebooks')
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd })
      if (!uploadRes.ok) {
        const err = await uploadRes.json()
        throw new Error(err.error || 'Upload failed')
      }
      const { file_path } = await uploadRes.json()
      setUploadProgress(75)

      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_name: form.student_name.trim(),
          title: form.title.trim(),
          dataset_id: form.dataset_id || null,
          notes: form.notes.trim() || null,
          file_path,
          file_name: file.name,
          file_size: file.size,
        }),
      })

      if (!res.ok) {
        const { error } = await res.json()
        throw new Error(error || 'Failed to save submission')
      }

      setUploadProgress(100)
      setSuccess(true)
      toast.success('Notebook submitted!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  function reset() {
    setSuccess(false)
    setFile(null)
    setForm({ student_name: '', title: '', dataset_id: '', notes: '' })
    setUploadProgress(0)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm"
        >
          <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-2xl font-bold mb-3">Submitted!</h1>
          <p className="text-white/50 mb-8 leading-relaxed">
            Your notebook has been uploaded. The admin team will review it soon.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/" className="flex-1">
              <Button variant="outline" className="gap-2 w-full">
                <ArrowLeft className="w-4 h-4" /> Back to Home
              </Button>
            </Link>
            <Button onClick={reset} className="flex-1">Submit Another</Button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-violet-600/6 rounded-full blur-[120px]" />
      </div>

      <div className="relative pt-24 pb-20 px-4">
        <div className="max-w-lg mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-white/35 hover:text-white/60 text-sm transition-colors mb-6 group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Back to Home
            </Link>
            <h1 className="text-3xl font-bold mb-2">Submit Notebook</h1>
            <p className="text-white/45">Upload your .ipynb file for review</p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div className="glass rounded-2xl p-6 space-y-5 border border-white/6">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. Ahmad Fauzi"
                  value={form.student_name}
                  onChange={e => setForm(f => ({ ...f, student_name: e.target.value }))}
                  disabled={uploading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Submission Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g. Image Classification with ResNet50"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  disabled={uploading}
                />
              </div>

              <div className="space-y-2">
                <Label>Dataset Used <span className="text-white/30 font-normal">(optional)</span></Label>
                <Select value={form.dataset_id} onValueChange={v => setForm(f => ({ ...f, dataset_id: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a dataset" />
                  </SelectTrigger>
                  <SelectContent>
                    {datasets.map(d => (
                      <SelectItem key={d.id} value={d.id}>{d.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes <span className="text-white/30 font-normal">(optional)</span></Label>
                <Textarea
                  id="notes"
                  placeholder="What approach did you try? Any questions or notes for the reviewer?"
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  disabled={uploading}
                />
              </div>
            </div>

            {/* Dropzone */}
            <div className="space-y-2">
              <Label>Notebook File (.ipynb) *</Label>
              <div
                {...getRootProps()}
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
                  isDragActive
                    ? 'border-violet-500 bg-violet-500/5'
                    : file
                    ? 'border-green-500/40 bg-green-500/[0.03]'
                    : 'border-white/10 hover:border-violet-500/30 hover:bg-white/[0.01]'
                }`}
              >
                <input {...getInputProps()} />
                <AnimatePresence mode="wait">
                  {file ? (
                    <motion.div
                      key="file"
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="flex items-center gap-3 justify-center"
                    >
                      <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-green-400" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-sm text-green-400 max-w-[200px] truncate">{file.name}</div>
                        <div className="text-xs text-white/35">{formatBytes(file.size)}</div>
                      </div>
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); setFile(null) }}
                        className="ml-1 p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-white transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <Upload className={`w-8 h-8 mx-auto mb-3 ${isDragActive ? 'text-violet-400' : 'text-white/20'}`} />
                      <p className="text-sm text-white/45 font-medium">
                        {isDragActive ? 'Drop your notebook here' : 'Drag & drop .ipynb file'}
                      </p>
                      <p className="text-xs text-white/25 mt-1">or click to browse</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {uploading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                <div className="flex justify-between text-xs text-white/40">
                  <span>Uploading notebook...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-1.5" />
              </motion.div>
            )}

            <Button type="submit" disabled={uploading} className="w-full h-12 gap-2 text-base">
              {uploading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
              ) : (
                <><Upload className="w-4 h-4" /> Submit Notebook</>
              )}
            </Button>
          </motion.form>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { formatBytes, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Upload, Database, Trash2, Plus, X, Loader2, Download } from 'lucide-react'
import type { Dataset } from '@/lib/types'

const CATEGORIES = ['General', 'Image Classification', 'Object Detection', 'NLP', 'Regression', 'Time Series', 'Other']

export default function AdminDatasetsPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [file, setFile] = useState<File | null>(null)
  const [form, setForm] = useState({ title: '', category: 'General', description: '' })

  useEffect(() => {
    loadDatasets()
  }, [])

  async function loadDatasets() {
    const res = await fetch('/api/datasets')
    const data = res.ok ? await res.json() : []
    setDatasets(data as Dataset[])
    setLoading(false)
  }

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) setFile(accepted[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, maxFiles: 1 })

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return toast.error('Enter a dataset title')
    if (!file) return toast.error('Select a file to upload')

    setUploading(true)
    setUploadProgress(10)

    try {
      // Upload file to local storage
      const fd = new FormData()
      fd.append('file', file)
      fd.append('type', 'datasets')
      setUploadProgress(30)

      const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd })
      if (!uploadRes.ok) {
        const err = await uploadRes.json()
        throw new Error(err.error || 'Upload failed')
      }
      const { file_path } = await uploadRes.json()
      setUploadProgress(75)

      // Save metadata
      const saveRes = await fetch('/api/admin/datasets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          category: form.category,
          description: form.description.trim(),
          file_path,
          file_name: file.name,
          file_size: file.size,
        }),
      })

      if (!saveRes.ok) {
        const err = await saveRes.json()
        throw new Error(err.error || 'Failed to save dataset')
      }

      setUploadProgress(100)
      toast.success('Dataset uploaded!')
      setForm({ title: '', category: 'General', description: '' })
      setFile(null)
      setShowForm(false)
      await loadDatasets()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  async function handleDelete(dataset: Dataset) {
    if (!confirm(`Delete "${dataset.title}"? This cannot be undone.`)) return
    const res = await fetch(`/api/admin/datasets/${dataset.id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Dataset deleted')
      setDatasets(prev => prev.filter(d => d.id !== dataset.id))
    } else {
      toast.error('Failed to delete dataset')
    }
  }

  function handleDownload(dataset: Dataset) {
    window.open(`/api/download/dataset/${dataset.id}`, '_blank')
  }

  return (
    <div className="p-8 max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Datasets</h1>
          <p className="text-gray-500 text-sm mt-1">{datasets.length} datasets uploaded</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'Upload Dataset'}
        </Button>
      </motion.div>

      {/* Upload Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-8"
          >
            <form onSubmit={handleUpload} className="rounded-xl border border-[#BF2026]/20 bg-[#BF2026]/5 p-6 space-y-5">
              <h2 className="font-semibold text-[#BF2026] flex items-center gap-2">
                <Upload className="w-4 h-4" /> Upload New Dataset
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input placeholder="e.g. CIFAR-10 Dataset" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <select
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#BF2026]/30"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <Label>Description</Label>
                  <Textarea placeholder="Describe the dataset contents, use cases, etc." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
              </div>

              {/* File drop */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  isDragActive ? 'border-[#BF2026] bg-[#BF2026]/5' : file ? 'border-green-500/40 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input {...getInputProps()} />
                {file ? (
                  <div className="flex items-center gap-3 justify-center">
                    <Database className="w-5 h-5 text-green-400" />
                    <div className="text-left">
                      <div className="text-sm font-medium text-green-400 max-w-xs truncate">{file.name}</div>
                      <div className="text-xs text-gray-400">{formatBytes(file.size)}</div>
                    </div>
                    <button type="button" onClick={e => { e.stopPropagation(); setFile(null) }} className="p-1 hover:bg-gray-100 rounded text-gray-500">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-7 h-7 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm text-gray-500">Drop file here or click to browse</p>
                    <p className="text-xs text-gray-400 mt-1">Supports any file format, up to 100MB+</p>
                  </div>
                )}
              </div>

              {uploading && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Uploading...</span><span>{uploadProgress}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-50 rounded-full overflow-hidden">
                    <div className="h-full bg-red-600 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}

              <Button type="submit" disabled={uploading} className="gap-2">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploading ? 'Uploading...' : 'Upload Dataset'}
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dataset List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-gray-50 animate-pulse" />)}
        </div>
      ) : datasets.length === 0 ? (
        <div className="text-center py-20 text-gray-400 border border-gray-200 rounded-xl">
          <Database className="w-12 h-12 mx-auto mb-4 opacity-40" />
          <p>No datasets yet. Upload your first one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {datasets.map((d, i) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 bg-white hover:border-gray-200 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/15 flex items-center justify-center flex-shrink-0">
                <Database className="w-5 h-5 text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{d.title}</div>
                <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-gray-50 text-gray-500">{d.category}</span>
                  <span>·</span>
                  <span>{formatBytes(d.file_size)}</span>
                  <span>·</span>
                  <span>{formatDate(d.created_at)}</span>
                </div>
                {d.description && <div className="text-xs text-gray-400 mt-1 truncate">{d.description}</div>}
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="sm" variant="outline" onClick={() => handleDownload(d)} className="gap-1.5 text-xs h-8">
                  <Download className="w-3.5 h-3.5" /> Download
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(d)} className="h-8 w-8 p-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

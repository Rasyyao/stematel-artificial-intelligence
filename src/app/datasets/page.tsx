'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Download } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Dataset } from '@/lib/types'
import { formatBytes, formatDate } from '@/lib/utils'

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  
  useEffect(() => {
    fetch('/api/datasets').then(res => res.json()).then(data => {
      setDatasets(data)
      setLoading(false)
    })
  }, [])

  const filtered = useMemo(() => {
    return datasets.filter(d => {
      if (categoryFilter !== 'All' && d.category !== categoryFilter) return false
      if (search && !d.title.toLowerCase().includes(search.toLowerCase()) && !d.description.toLowerCase().includes(search.toLowerCase())) return false
      if (d.visibility === 'private') return false
      return true
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [datasets, search, categoryFilter])

  const categories = ['All', ...Array.from(new Set(datasets.map(d => d.category)))]

  if (loading) return <div className="p-12 text-center text-gray-500">Loading datasets...</div>

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl mt-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">Datasets</h1>
        <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">Browse and discover datasets available for your machine learning models.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-12">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input 
            placeholder="Search datasets..." 
            className="pl-10 h-12 text-base rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          <Filter className="w-5 h-5 text-gray-400 shrink-0 mr-2" />
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${categoryFilter === cat ? 'bg-[#BF2026] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(dataset => (
          <motion.div 
            key={dataset.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group flex flex-col bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-4">
              <Badge variant="secondary" className="bg-[#BF2026]/10 text-[#BF2026] hover:bg-[#BF2026]/20">
                {dataset.category}
              </Badge>
              <span className="text-xs text-gray-400 font-medium">{formatDate(dataset.created_at)}</span>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight group-hover:text-[#BF2026] transition-colors">{dataset.title}</h3>
            <p className="text-gray-600 text-sm mb-6 flex-1 line-clamp-3">{dataset.description || 'No description provided.'}</p>
            
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 mb-1">File Size</span>
                <span className="text-sm font-semibold text-gray-700">{formatBytes(dataset.file_size)}</span>
              </div>
              <Button onClick={() => window.open(`/api/download/dataset/${dataset.id}`, '_blank')} size="sm" className="bg-gray-900 hover:bg-gray-800 rounded-lg">
                <Download className="w-4 h-4 mr-2" /> Download
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
      
      {filtered.length === 0 && (
        <div className="text-center py-24 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No datasets found</h3>
          <p className="text-gray-500">Try adjusting your search or filters to find what you're looking for.</p>
        </div>
      )}
    </div>
  )
}

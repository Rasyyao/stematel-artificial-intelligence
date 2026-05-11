'use client'
import { motion } from 'framer-motion'
import { Download, Database, Calendar, FileText } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatBytes, formatDate } from '@/lib/utils'
import type { Dataset } from '@/lib/types'

interface DatasetCardProps {
  dataset: Dataset
  onDownload?: (dataset: Dataset) => void
}

export default function DatasetCard({ dataset, onDownload }: DatasetCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
    >
      <Card className="group hover:border-[#BF2026]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[#BF2026]/8 bg-white border-gray-200">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-[#BF2026]/10 text-[#BF2026] border-[#BF2026]/20 hover:bg-[#BF2026]/15">{dataset.category}</Badge>
              </div>
              <h3 className="font-semibold text-[#333333] truncate group-hover:text-[#BF2026] transition-colors">
                {dataset.title}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#BF2026]/8 border border-[#BF2026]/15 flex items-center justify-center shrink-0">
              <Database className="w-5 h-5 text-[#BF2026]" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-4 line-clamp-2">{dataset.description}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                {formatBytes(dataset.file_size)}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(dataset.created_at)}
              </span>
            </div>
            <Button size="sm" variant="outline" onClick={() => onDownload?.(dataset)}
              className="gap-2 text-xs border-[#BF2026]/30 text-[#BF2026] hover:bg-[#BF2026] hover:text-white hover:border-[#BF2026]">
              <Download className="w-3.5 h-3.5" />
              Download
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import type { Submission } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

export default function SubmissionsLogPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/admin/submissions')
      .then(r => r.json())
      .then(setSubmissions)
  }, [])

  const filtered = submissions.filter(s => 
    s.student_name.toLowerCase().includes(search.toLowerCase()) || 
    s.title.toLowerCase().includes(search.toLowerCase())
  ).sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Submission Log</h1>
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        <Input 
          placeholder="Search by student or title..." 
          className="pl-10" 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
        />
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 font-medium text-gray-600">Student</th>
              <th className="px-6 py-4 font-medium text-gray-600">Title</th>
              <th className="px-6 py-4 font-medium text-gray-600">Date</th>
              <th className="px-6 py-4 font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(s => (
              <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium">{s.student_name}</td>
                <td className="px-6 py-4">{s.title}</td>
                <td className="px-6 py-4 text-gray-500">{formatDate(s.created_at)}</td>
                <td className="px-6 py-4">
                  <Badge variant="outline" className={
                    s.status === 'pending' ? 'bg-yellow-50 text-yellow-700' :
                    s.status === 'reviewed' ? 'bg-blue-50 text-blue-700' :
                    s.status === 'good' ? 'bg-green-50 text-green-700' :
                    'bg-red-50 text-red-700'
                  }>{s.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export type Dataset = {
  id: string
  title: string
  category: string
  description: string
  file_path: string
  file_size: number
  file_name: string
  tags?: string[]
  visibility?: 'public' | 'private'
  downloads?: number
  created_at: string
  updated_at: string
}

export type Submission = {
  id: string
  student_name: string
  title: string
  dataset_id: string | null
  notes: string | null
  file_path: string
  file_name: string
  file_size: number
  status: 'pending' | 'reviewed' | 'good' | 'needs_improvement'
  created_at: string
  updated_at: string
  dataset?: Dataset
}

export type Review = {
  id: string
  submission_id: string
  comment: string
  status: 'pending' | 'reviewed' | 'good' | 'needs_improvement'
  created_at: string
}

export type Announcement = {
  id: string
  title: string
  content: string
  pinned: boolean
  created_at: string
}

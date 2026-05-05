'use client'
import React from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

type NotebookCell = {
  cell_type: 'markdown' | 'code' | 'raw'
  source: string | string[]
  outputs?: NotebookOutput[]
  metadata?: Record<string, unknown>
  execution_count?: number | null
}

type NotebookOutput = {
  output_type: string
  text?: string | string[]
  data?: { 'text/plain'?: string | string[]; 'text/html'?: string | string[]; 'image/png'?: string }
  traceback?: string[]
  ename?: string
  evalue?: string
}

type NotebookData = {
  nbformat: number
  nbformat_minor: number
  metadata?: { kernelspec?: { display_name?: string; language?: string } }
  cells: NotebookCell[]
}

function normalizeSource(source: string | string[]): string {
  return Array.isArray(source) ? source.join('') : source
}

function normalizeOutput(text?: string | string[]): string {
  if (!text) return ''
  return Array.isArray(text) ? text.join('') : text
}

function CodeCell({ cell }: { cell: NotebookCell; index: number }) {
  const source = normalizeSource(cell.source)
  return (
    <div className="rounded-xl overflow-hidden border border-white/8 mb-4">
      <div className="flex items-center gap-2 px-4 py-2 bg-white/3 border-b border-white/8">
        <span className="text-[10px] font-mono text-white/30">In [{cell.execution_count ?? ' '}]</span>
        <span className="text-[10px] text-white/20">Python</span>
      </div>
      <SyntaxHighlighter
        language="python"
        style={oneDark}
        customStyle={{ margin: 0, background: 'rgba(0,0,0,0.4)', fontSize: '13px', borderRadius: 0 }}
        showLineNumbers
      >
        {source || ''}
      </SyntaxHighlighter>
      {cell.outputs && cell.outputs.length > 0 && (
        <div className="bg-black/20 border-t border-white/8">
          {cell.outputs.map((output, i) => (
            <OutputRenderer key={i} output={output} />
          ))}
        </div>
      )}
    </div>
  )
}

function OutputRenderer({ output }: { output: NotebookOutput }) {
  if (output.output_type === 'error') {
    return (
      <div className="p-4 font-mono text-xs text-red-400">
        <div className="font-bold">{output.ename}: {output.evalue}</div>
        {output.traceback?.map((line, i) => (
          <div key={i} dangerouslySetInnerHTML={{ __html: line.replace(/\x1b\[[0-9;]*m/g, '') }} />
        ))}
      </div>
    )
  }
  if (output.output_type === 'display_data' || output.output_type === 'execute_result') {
    if (output.data?.['image/png']) {
      return (
        <div className="p-4">
          <img src={`data:image/png;base64,${output.data['image/png']}`} alt="output" className="max-w-full rounded-lg" />
        </div>
      )
    }
    if (output.data?.['text/html']) {
      return (
        <div
          className="p-4 text-sm text-white/70 overflow-auto"
          dangerouslySetInnerHTML={{ __html: normalizeOutput(output.data['text/html']) }}
        />
      )
    }
    if (output.data?.['text/plain']) {
      return (
        <div className="p-4 font-mono text-xs text-green-400 whitespace-pre-wrap">
          {normalizeOutput(output.data['text/plain'])}
        </div>
      )
    }
  }
  if (output.text) {
    return (
      <div className="p-4 font-mono text-xs text-white/60 whitespace-pre-wrap">
        {normalizeOutput(output.text)}
      </div>
    )
  }
  return null
}

function MarkdownCell({ cell }: { cell: NotebookCell }) {
  const source = normalizeSource(cell.source)
  return (
    <div className="mb-4 px-6 py-4 prose prose-invert max-w-none prose-headings:text-white prose-p:text-white/70 prose-code:text-violet-300 prose-pre:bg-black/40 prose-strong:text-white">
      <ReactMarkdown
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '')
            const isInline = !match
            return isInline ? (
              <code className="bg-white/10 px-1.5 py-0.5 rounded text-violet-300 text-[13px] font-mono" {...props}>
                {children}
              </code>
            ) : (
              <SyntaxHighlighter language={match[1]} style={oneDark} customStyle={{ borderRadius: '8px', fontSize: '13px' }}>
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            )
          },
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  )
}

export default function NotebookViewer({ content }: { content: string }) {
  let notebook: NotebookData
  try {
    notebook = JSON.parse(content)
  } catch {
    return <div className="p-8 text-red-400 text-center">Invalid notebook format</div>
  }

  const kernelName = notebook.metadata?.kernelspec?.display_name || 'Python'

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 px-4 py-3 rounded-xl border border-white/8 bg-white/3 flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-sm text-white/50">Kernel: {kernelName}</span>
        <span className="text-white/20">·</span>
        <span className="text-sm text-white/50">{notebook.cells.length} cells</span>
      </div>
      <div className="space-y-1">
        {notebook.cells.map((cell, index) => {
          if (cell.cell_type === 'markdown') return <MarkdownCell key={index} cell={cell} />
          if (cell.cell_type === 'code') return <CodeCell key={index} cell={cell} index={index} />
          return null
        })}
      </div>
    </div>
  )
}

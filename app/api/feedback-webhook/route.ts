import { NextRequest, NextResponse } from 'next/server'

const GITHUB_TOKEN  = process.env.GITHUB_ISSUES_TOKEN ?? ''
const GITHUB_REPO   = 'blaubeerina/myLunaraCycleApp'
const GITHUB_API    = `https://api.github.com/repos/${GITHUB_REPO}/issues`

interface FormspreePayload {
  rating?:   string
  liked?:    string
  missing?:  string
  email?:    string
  device?:   string
  language?: string
}

function buildIssueBody(p: FormspreePayload): string {
  const lines = [
    `**Rating:** ${p.rating ?? '—'}`,
    `**Gerät:** ${p.device ?? '—'} | **Sprache:** ${p.language ?? '—'}`,
    `**Email:** ${p.email ?? '(keine Angabe)'}`,
    '',
    '### Was hat gefallen',
    p.liked?.trim() || '*(nichts angegeben)*',
    '',
    '### Was fehlt / nervt',
    p.missing?.trim() || '*(nichts angegeben)*',
  ]
  return lines.join('\n')
}

function chooseLabels(p: FormspreePayload): string[] {
  const labels: string[] = ['feedback']
  if (p.missing?.trim()) labels.push('bug')
  const r = parseInt(p.rating ?? '5')
  if (r <= 2)           labels.push('priority')
  return labels
}

function buildTitle(p: FormspreePayload): string {
  const r   = p.rating ?? '?/5'
  const dev = p.device ?? 'Unknown'
  const snippet = p.missing?.trim().slice(0, 60) ?? p.liked?.trim().slice(0, 60) ?? ''
  return snippet
    ? `[Feedback ${r}] ${snippet}${snippet.length >= 60 ? '…' : ''} (${dev})`
    : `[Feedback ${r}] Allgemeines Feedback (${dev})`
}

export async function POST(req: NextRequest) {
  if (!GITHUB_TOKEN) {
    console.error('GITHUB_ISSUES_TOKEN not set')
    return NextResponse.json({ error: 'not configured' }, { status: 500 })
  }

  let payload: FormspreePayload
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }

  const issue = {
    title:  buildTitle(payload),
    body:   buildIssueBody(payload),
    labels: chooseLabels(payload),
  }

  const ghRes = await fetch(GITHUB_API, {
    method:  'POST',
    headers: {
      Authorization:  `Bearer ${GITHUB_TOKEN}`,
      Accept:         'application/vnd.github+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify(issue),
  })

  if (!ghRes.ok) {
    const err = await ghRes.text()
    console.error('GitHub API error:', err)
    return NextResponse.json({ error: 'github error' }, { status: 502 })
  }

  const created = await ghRes.json()
  return NextResponse.json({ issue: created.html_url }, { status: 201 })
}

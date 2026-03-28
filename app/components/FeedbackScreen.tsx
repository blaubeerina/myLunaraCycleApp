'use client'
import { useState } from 'react'
import { StoredData } from '../lib/cycle'
import { Translations } from '../lib/i18n'

interface Props {
  data: StoredData
  t: Translations
}

const FORM_ID = process.env.NEXT_PUBLIC_FORMSPREE_ID ?? 'xreozebq'

export default function FeedbackScreen({ data }: Props) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [liked, setLiked] = useState('')
  const [missing, setMissing] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const device = typeof navigator !== 'undefined'
    ? /iPhone|iPad|iPod/.test(navigator.userAgent) ? 'iOS'
      : /Android/.test(navigator.userAgent) ? 'Android'
      : 'Desktop'
    : 'Unknown'

  const lang = data.language

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) return
    setStatus('sending')

    try {
      const res = await fetch(`https://formspree.io/f/${FORM_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          rating: `${rating}/5 Monde`,
          liked,
          missing,
          email: email || '(keine Angabe)',
          device,
          language: lang,
          _subject: `lunaracycle Beta Feedback — ${rating}⭐ von ${device}`,
        }),
      })
      setStatus(res.ok ? 'sent' : 'error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div className="min-h-screen pb-24 px-5 pt-8 max-w-md mx-auto flex flex-col items-center justify-center">
        <div className="text-7xl mb-6">🌕</div>
        <h2 className="font-serif text-3xl italic text-gold mb-4 text-center">
          {lang === 'de' ? 'Danke, mein Kind' : 'Thank you, dear one'}
        </h2>
        <p className="text-ivory/60 text-center font-sans leading-relaxed">
          {lang === 'de'
            ? 'Dein Feedback hilft lunaracycle zu wachsen. Der Mond trägt deine Worte.'
            : 'Your feedback helps lunaracycle grow. The moon carries your words.'}
        </p>
        <button
          onClick={() => { setStatus('idle'); setRating(0); setLiked(''); setMissing(''); setEmail('') }}
          className="mt-8 text-xs text-ivory/30 hover:text-ivory/50"
        >
          {lang === 'de' ? 'Weiteres Feedback senden' : 'Send more feedback'}
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24 px-5 pt-8 max-w-md mx-auto">
      <h1 className="font-serif text-3xl italic text-gold mb-2">
        {lang === 'de' ? 'Deine Stimme' : 'Your Voice'}
      </h1>
      <p className="text-xs text-ivory/40 mb-8">
        {lang === 'de'
          ? 'Hilf lunaracycle zu wachsen — dein Feedback ist ein Geschenk'
          : 'Help lunaracycle grow — your feedback is a gift'}
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Sterne-Rating */}
        <div className="bg-cosmos rounded-2xl p-5 border border-white/5">
          <p className="text-xs text-ivory/40 uppercase tracking-widest mb-4">
            {lang === 'de' ? 'Gesamteindruck' : 'Overall Impression'}
          </p>
          <div className="flex justify-center gap-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                onMouseEnter={() => setHovered(n)}
                onMouseLeave={() => setHovered(0)}
                className={`text-4xl transition-all ${
                  n <= (hovered || rating) ? 'opacity-100 scale-110' : 'opacity-25'
                }`}
              >
                🌙
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-center text-xs text-gold/60 mt-3">
              {lang === 'de'
                ? ['', '💫 Noch nicht meins', '🌒 Hat Potenzial', '🌓 Ganz okay', '🌔 Gefällt mir gut', '🌕 Liebe es!'][rating]
                : ['', '💫 Not for me yet', '🌒 Has potential', '🌓 Pretty okay', '🌔 Really like it', '🌕 Love it!'][rating]}
            </p>
          )}
        </div>

        {/* Was gefallen */}
        <div className="bg-cosmos rounded-2xl p-5 border border-white/5">
          <label className="text-xs text-ivory/40 uppercase tracking-widest mb-3 block">
            {lang === 'de' ? 'Was hat dir gut gefallen?' : 'What did you like?'}
          </label>
          <textarea
            name="liked"
            value={liked}
            onChange={(e) => setLiked(e.target.value)}
            rows={3}
            placeholder={lang === 'de' ? 'Erzähl mir ...' : 'Tell me ...'}
            className="w-full bg-midnight rounded-xl p-3 text-ivory/80 text-sm font-sans border border-white/10 focus:border-gold/40 outline-none resize-none placeholder-ivory/20"
          />
        </div>

        {/* Was fehlt */}
        <div className="bg-cosmos rounded-2xl p-5 border border-white/5">
          <label className="text-xs text-ivory/40 uppercase tracking-widest mb-3 block">
            {lang === 'de' ? 'Was fehlt oder nervt?' : 'What is missing or annoying?'}
          </label>
          <textarea
            name="missing"
            value={missing}
            onChange={(e) => setMissing(e.target.value)}
            rows={3}
            placeholder={lang === 'de' ? 'Ehrlichkeit ist ein Geschenk ...' : 'Honesty is a gift ...'}
            className="w-full bg-midnight rounded-xl p-3 text-ivory/80 text-sm font-sans border border-white/10 focus:border-rose/40 outline-none resize-none placeholder-ivory/20"
          />
        </div>

        {/* Email optional */}
        <div className="bg-cosmos rounded-2xl p-5 border border-white/5">
          <label className="text-xs text-ivory/40 uppercase tracking-widest mb-3 block">
            {lang === 'de' ? 'Deine Email (optional)' : 'Your Email (optional)'}
          </label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={lang === 'de' ? 'Für Rückfragen ...' : 'For follow-up ...'}
            className="w-full bg-midnight rounded-xl p-3 text-ivory/80 text-sm font-sans border border-white/10 focus:border-lavender/40 outline-none placeholder-ivory/20"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={rating === 0 || status === 'sending'}
          className={`w-full py-4 rounded-2xl font-sans text-sm tracking-wide transition-all ${
            rating === 0
              ? 'bg-cosmos text-ivory/20 cursor-not-allowed border border-white/5'
              : 'text-midnight font-medium'
          }`}
          style={rating > 0 ? { background: 'linear-gradient(135deg, #C9A84C, #9B8EC4)' } : {}}
        >
          {status === 'sending'
            ? '🌙 ...'
            : lang === 'de' ? 'Feedback senden' : 'Send Feedback'}
        </button>

        {status === 'error' && (
          <p className="text-rose text-xs text-center">
            {lang === 'de' ? 'Fehler beim Senden. Bitte nochmal versuchen.' : 'Error sending. Please try again.'}
          </p>
        )}
      </form>
    </div>
  )
}

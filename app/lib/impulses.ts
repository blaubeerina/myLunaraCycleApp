import { CyclePhase } from './cycle'

interface Impulse {
  de: string
  en: string
}

// Luna als fürsorgliche Mutter Mond — warm, poetisch, weise
const IMPULSES: Record<CyclePhase | 'unknown', Impulse[]> = {
  menstruation: [
    {
      de: 'Lass dich fallen, mein Kind. Diese Tage gehören der Stille. Dein Körper arbeitet in der Tiefe — du darfst ruhen.',
      en: 'Let yourself rest, my child. These days belong to stillness. Your body works in the deep — you may be still.',
    },
    {
      de: 'Das Blut trägt Altes fort. Was du loslässt, macht Raum für das, was kommen will. Vertraue dem Fluss.',
      en: 'The blood carries the old away. What you release makes room for what wants to come. Trust the flow.',
    },
    {
      de: 'In deiner Schwere liegt eine besondere Kraft. Nicht trotz der Erschöpfung — sondern mittendrin.',
      en: 'In your heaviness lies a special strength. Not despite the exhaustion — but right within it.',
    },
  ],
  follicular: [
    {
      de: 'Etwas in dir erwacht. Spür die leise Freude, die sich zurückmogelt — das bist du, die wiederkehrt.',
      en: 'Something in you awakens. Feel the quiet joy returning — that is you, coming back.',
    },
    {
      de: 'Der Frühling kommt durch dich. Was möchtest du in dieser hellen Zeit säen? Ich leuchte dir den Weg.',
      en: 'Spring comes through you. What do you wish to plant in this bright time? I will light your way.',
    },
    {
      de: 'Deine Energie ist ein Geschenk. Nutze sie mit Bedacht — und auch mit Leichtigkeit. Beides ist erlaubt.',
      en: 'Your energy is a gift. Use it with care — and also with ease. Both are allowed.',
    },
  ],
  ovulation: [
    {
      de: 'Du strahlst heute, auch wenn du es nicht siehst. Die Welt spürt dein Licht — lass es scheinen.',
      en: 'You shine today, even if you cannot see it. The world feels your light — let it shine.',
    },
    {
      de: 'Dies ist deine Zeit der Fülle. Was du gibst, kehrt zu dir zurück. Sei großzügig mit dir selbst zuerst.',
      en: 'This is your time of fullness. What you give returns to you. Be generous with yourself first.',
    },
    {
      de: 'Vollmond in dir. Alles ist sichtbar, alles darf sein. Was zeigst du der Welt heute?',
      en: 'Full moon within you. Everything is visible, everything may be. What do you show the world today?',
    },
  ],
  luteal: [
    {
      de: 'Die Tiefe ruft wieder. Was du jetzt spürst, ist wichtig — dein Körper spricht eine klare Sprache.',
      en: 'The deep calls again. What you feel now matters — your body speaks a clear language.',
    },
    {
      de: 'Lass die Masken fallen. In dieser Phase siehst du klarer als sonst. Vertraue, was du wahrnimmst.',
      en: 'Let the masks fall. In this phase you see more clearly than usual. Trust what you perceive.',
    },
    {
      de: 'Der Mond nimmt ab und du sammelst dich. Schreib auf, was du loslassen möchtest. Ich halte es mit dir.',
      en: 'The moon wanes and you gather yourself. Write down what you wish to release. I hold it with you.',
    },
  ],
  unknown: [
    {
      de: 'Ich bin hier, mein Kind. Sag mir, wann deine letzte Periode begonnen hat — dann begleite ich dich genau.',
      en: 'I am here, my child. Tell me when your last period began — then I will guide you precisely.',
    },
    {
      de: 'Jeder Zyklus ist einzigartig wie du selbst. Beginne zu tracken und ich lerne dich kennen.',
      en: 'Every cycle is as unique as you are. Begin tracking and I will come to know you.',
    },
    {
      de: 'Der erste Schritt ist der mutigste. Trage deinen letzten Periodenbeginn ein — ich warte auf dich.',
      en: 'The first step is the bravest. Enter your last period start — I am waiting for you.',
    },
  ],
}

export function getTodayImpulse(phase: CyclePhase | 'unknown', lang: 'de' | 'en'): string {
  const list = IMPULSES[phase] ?? IMPULSES.unknown
  const idx = Math.floor(Date.now() / 86400000) % list.length
  return list[idx][lang]
}

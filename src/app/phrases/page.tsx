export const instant = false

import { PhrasesClient } from './PhrasesClient'

export const metadata = {
  title: 'Essential Japanese Phrases - Daily, Anime & Travel | Learn Japanese',
  description:
    'Free essential Japanese phrases with audio pronunciation, Romaji, and Bengali meanings for Anime fans, travelers, and beginners.',
}

export default function PhrasesPage() {
  return (
    <main className="min-h-screen bg-background">
      <PhrasesClient />
    </main>
  )
}

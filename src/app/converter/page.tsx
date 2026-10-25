export const instant = false

import { ConverterClient } from './ConverterClient'

export const metadata = {
  title: 'Romaji to Japanese Kana Converter | Learn Japanese',
  description:
    'Free online Romaji to Hiragana and Katakana converter. Type English letters and instantly get authentic Japanese script with audio pronunciation.',
}

export default function ConverterPage() {
  return (
    <main className="min-h-screen bg-background">
      <ConverterClient />
    </main>
  )
}

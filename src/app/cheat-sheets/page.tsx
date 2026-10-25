export const instant = false

import { CheatSheetsClient } from './CheatSheetsClient'

export const metadata = {
  title: 'Free Printable Japanese Cheat Sheets & PDF Charts | Learn Japanese',
  description:
    'Free high-resolution printable Japanese study sheets: 46 Hiragana chart, Katakana chart, and JLPT N5 Kanji summary chart.',
}

export default function CheatSheetsPage() {
  return (
    <main className="min-h-screen bg-background">
      <CheatSheetsClient />
    </main>
  )
}

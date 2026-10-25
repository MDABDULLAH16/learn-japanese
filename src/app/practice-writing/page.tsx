export const instant = false

import { WritingPracticeClient } from './WritingPracticeClient'

export const metadata = {
  title: 'Japanese Handwriting Practice Pad - Stroke Order Canvas | Learn Japanese',
  description:
    'Free online Japanese handwriting canvas. Practice stroke orders and curves of Hiragana and Katakana with watermark guides on your phone, tablet, or desktop.',
}

export default function PracticeWritingPage() {
  return (
    <main className="min-h-screen bg-background">
      <WritingPracticeClient />
    </main>
  )
}

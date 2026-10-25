const ROMAJI_TO_HIRAGANA: Record<string, string> = {
  // 3-letter combinations
  kya: 'きゃ',
  kyu: 'きゅ',
  kyo: 'きょ',
  sha: 'しゃ',
  shu: 'しゅ',
  sho: 'しょ',
  cha: 'ちゃ',
  chu: 'ちゅ',
  cho: 'ちょ',
  nya: 'にゃ',
  nyu: 'にゅ',
  nyo: 'にょ',
  hya: 'ひゃ',
  hyu: 'ひゅ',
  hyo: 'ひょ',
  mya: 'みゃ',
  myu: 'みゅ',
  myo: 'みょ',
  rya: 'りゃ',
  ryu: 'りゅ',
  ryo: 'りょ',
  gya: 'ぎゃ',
  gyu: 'ぎゅ',
  gyo: 'ぎょ',
  ja: 'じゃ',
  ju: 'じゅ',
  jo: 'じょ',
  bya: 'びゃ',
  byu: 'びゅ',
  byo: 'びょ',
  pya: 'ぴゃ',
  pyu: 'ぴゅ',
  pyo: 'ぴょ',
  shi: 'し',
  chi: 'ち',
  tsu: 'つ',
  fu: 'ふ',

  // 2-letter combinations
  ka: 'か',
  ki: 'き',
  ku: 'く',
  ke: 'け',
  ko: 'こ',
  sa: 'さ',
  su: 'す',
  se: 'せ',
  so: 'そ',
  ta: 'た',
  te: 'て',
  to: 'と',
  na: 'な',
  ni: 'に',
  nu: 'ぬ',
  ne: 'ね',
  no: 'の',
  ha: 'は',
  hi: 'ひ',
  he: 'へ',
  ho: 'ほ',
  ma: 'ま',
  mi: 'み',
  mu: 'む',
  me: 'め',
  mo: 'も',
  ya: 'や',
  yu: 'ゆ',
  yo: 'よ',
  ra: 'ら',
  ri: 'り',
  ru: 'る',
  re: 'れ',
  ro: 'ろ',
  wa: 'わ',
  wo: 'を',
  ga: 'が',
  gi: 'ぎ',
  gu: 'ぐ',
  ge: 'げ',
  go: 'ご',
  za: 'ざ',
  ji: 'じ',
  zu: 'ず',
  ze: 'ぜ',
  zo: 'ぞ',
  da: 'だ',
  di: 'ぢ',
  du: 'づ',
  de: 'de',
  do: 'ど',
  ba: 'ば',
  bi: 'び',
  bu: 'ぶ',
  be: 'べ',
  bo: 'ぼ',
  pa: 'ぱ',
  pi: 'ぴ',
  pu: 'ぷ',
  pe: 'ぺ',
  po: 'ぽ',
  nn: 'ん',

  // Single vowels
  a: 'あ',
  i: 'い',
  u: 'う',
  e: 'え',
  o: 'お',
  n: 'ん',
}

const HIRAGANA_TO_KATAKANA_OFFSET = 0x60 // Unicode difference between Hiragana and Katakana

export function toHiragana(input: string): string {
  let str = input.toLowerCase()
  let result = ''
  let i = 0

  while (i < str.length) {
    // Check for double consonants for small tsu (っ) e.g., "matte", "ippai", "kekka"
    if (
      i < str.length - 1 &&
      str[i] === str[i + 1] &&
      /[b-df-hj-np-tv-z]/.test(str[i]) &&
      str[i] !== 'n'
    ) {
      result += 'っ'
      i++
      continue
    }

    // Try 3-char match
    if (i <= str.length - 3) {
      const sub3 = str.substring(i, i + 3)
      if (ROMAJI_TO_HIRAGANA[sub3]) {
        result += ROMAJI_TO_HIRAGANA[sub3]
        i += 3
        continue
      }
    }

    // Try 2-char match
    if (i <= str.length - 2) {
      const sub2 = str.substring(i, i + 2)
      if (ROMAJI_TO_HIRAGANA[sub2]) {
        result += ROMAJI_TO_HIRAGANA[sub2]
        i += 2
        continue
      }
    }

    // Try 1-char match
    const sub1 = str[i]
    if (ROMAJI_TO_HIRAGANA[sub1]) {
      // Avoid converting 'n' if next is a vowel or 'y' until next loop
      if (sub1 === 'n' && i + 1 < str.length && /[aeiouy]/.test(str[i + 1])) {
        // Let next step handle na/ni/nu/ne/no/nya
        result += sub1
      } else {
        result += ROMAJI_TO_HIRAGANA[sub1]
      }
      i += 1
      continue
    }

    // Otherwise keep character as is (punctuation, spaces, kanji)
    result += sub1
    i += 1
  }

  return result
}

export function toKatakana(hiraganaOrRomaji: string): string {
  const hira = toHiragana(hiraganaOrRomaji)
  let result = ''

  for (let i = 0; i < hira.length; i++) {
    const code = hira.charCodeAt(i)
    // Hiragana range: U+3041 to U+3096
    if (code >= 0x3041 && code <= 0x3096) {
      result += String.fromCharCode(code + HIRAGANA_TO_KATAKANA_OFFSET)
    } else {
      result += hira[i]
    }
  }

  return result
}

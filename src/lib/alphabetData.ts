export type Character = {
  romaji: string
  char: string
  hint?: string
}

export type AlphabetCategory = {
  title: string
  items: Character[]
}

export type AlphabetData = {
  basic: AlphabetCategory
  dakuten: AlphabetCategory // tenten/maru
  yoon: AlphabetCategory // combined
}

// Basic mnemonics for Hiragana
export const HIRAGANA_DATA: AlphabetData = {
  basic: {
    title: 'Basic Hiragana',
    items: [
      { romaji: 'a', char: 'あ', hint: 'Looks like an "A"pple with a stem.' },
      { romaji: 'i', char: 'い', hint: 'Looks like two "I"cicles.' },
      { romaji: 'u', char: 'う', hint: 'An "U" on its side.' },
      { romaji: 'e', char: 'え', hint: 'Looks like an "E"xotic bird.' },
      { romaji: 'o', char: 'お', hint: 'Two circles overlapping like an "O"wl.' },
      
      { romaji: 'ka', char: 'か', hint: 'A "Ka"ngaroo jumping.' },
      { romaji: 'ki', char: 'き', hint: 'Looks like a "Key".' },
      { romaji: 'ku', char: 'く', hint: 'A "Cuckoo" bird\'s beak.' },
      { romaji: 'ke', char: 'け', hint: 'A "Ke"g of root beer.' },
      { romaji: 'ko', char: 'こ', hint: 'Two "Co"ins (ko-ins).' },
      
      { romaji: 'sa', char: 'さ', hint: 'A "Sa"d face looking left.' },
      { romaji: 'shi', char: 'し', hint: 'A "She"pherd\'s hook.' },
      { romaji: 'su', char: 'す', hint: 'A "Su"bmarine swinging around.' },
      { romaji: 'se', char: 'せ', hint: 'Setting a table.' },
      { romaji: 'so', char: 'そ', hint: 'A zigzag "So"wing needle.' },
      
      { romaji: 'ta', char: 'た', hint: 'Looks like "Ta".' },
      { romaji: 'chi', char: 'ち', hint: 'A "Chee"rleader.' },
      { romaji: 'tsu', char: 'つ', hint: 'A "Tsu"nami wave.' },
      { romaji: 'te', char: 'て', hint: 'A broken "Te"nnis racket.' },
      { romaji: 'to', char: 'と', hint: 'A "Toe" with a splinter.' },
      
      { romaji: 'na', char: 'な', hint: 'A "Nu"n kneeling.' },
      { romaji: 'ni', char: 'に', hint: 'A "Knee".' },
      { romaji: 'nu', char: 'ぬ', hint: 'Noodles in a bowl.' },
      { romaji: 'ne', char: 'ね', hint: 'A "Ne"t.' },
      { romaji: 'no', char: 'の', hint: 'A "No" entry sign.' },
      
      { romaji: 'ha', char: 'は', hint: 'Laughing "Ha ha" beside a keg.' },
      { romaji: 'hi', char: 'ひ', hint: 'He is smiling.' },
      { romaji: 'fu', char: 'ふ', hint: 'Mount "Fu"ji.' },
      { romaji: 'he', char: 'へ', hint: 'Pointing to "He"aven.' },
      { romaji: 'ho', char: 'ほ', hint: 'A "Ho"me with a chimney.' },
      
      { romaji: 'ma', char: 'ま', hint: 'Calling "Ma" on a double-mast ship.' },
      { romaji: 'mi', char: 'み', hint: 'A "Me"ow cat.' },
      { romaji: 'mu', char: 'む', hint: 'A "Moo" cow.' },
      { romaji: 'me', char: 'め', hint: 'A "Me"dal without a loop.' },
      { romaji: 'mo', char: 'も', hint: 'Catching "Mo"re fish.' },
      
      { romaji: 'ya', char: 'や', hint: 'A "Yak".' }, { romaji: '', char: '' },
      { romaji: 'yu', char: 'ゆ', hint: 'A "U" turn.' }, { romaji: '', char: '' },
      { romaji: 'yo', char: 'よ', hint: 'A "Yo-yo".' },
      
      { romaji: 'ra', char: 'ら', hint: 'A "Ra"bbit.' },
      { romaji: 'ri', char: 'り', hint: 'A "Ri"bbon.' },
      { romaji: 'ru', char: 'る', hint: 'A "Rou"te with a loop.' },
      { romaji: 're', char: 'れ', hint: 'A "Re"stless dog.' },
      { romaji: 'ro', char: 'ろ', hint: 'A "Ro"ute without a loop.' },
      
      { romaji: 'wa', char: 'わ', hint: 'A "Wa"sp.' }, { romaji: '', char: '' }, { romaji: '', char: '' }, { romaji: '', char: '' },
      { romaji: 'wo', char: 'を', hint: '"Whoa"!' },
      
      { romaji: 'n', char: 'ん', hint: 'Looks like an "n".' }
    ]
  },
  dakuten: {
    title: 'Dakuten (Tenten / Maru)',
    items: [
      { romaji: 'ga', char: 'が' }, { romaji: 'gi', char: 'ぎ' }, { romaji: 'gu', char: 'ぐ' }, { romaji: 'ge', char: 'げ' }, { romaji: 'go', char: 'ご' },
      { romaji: 'za', char: 'ざ' }, { romaji: 'ji', char: 'じ' }, { romaji: 'zu', char: 'ず' }, { romaji: 'ze', char: 'ぜ' }, { romaji: 'zo', char: 'ぞ' },
      { romaji: 'da', char: 'だ' }, { romaji: 'ji', char: 'ぢ' }, { romaji: 'zu', char: 'づ' }, { romaji: 'de', char: 'で' }, { romaji: 'do', char: 'ど' },
      { romaji: 'ba', char: 'ば' }, { romaji: 'bi', char: 'び' }, { romaji: 'bu', char: 'ぶ' }, { romaji: 'be', char: 'べ' }, { romaji: 'bo', char: 'ぼ' },
      { romaji: 'pa', char: 'ぱ' }, { romaji: 'pi', char: 'ぴ' }, { romaji: 'pu', char: 'ぷ' }, { romaji: 'pe', char: 'ぺ' }, { romaji: 'po', char: 'ぽ' },
    ]
  },
  yoon: {
    title: 'Yoon (Combinations)',
    items: [
      { romaji: 'kya', char: 'きゃ' }, { romaji: 'kyu', char: 'きゅ' }, { romaji: 'kyo', char: 'きょ' },
      { romaji: 'sha', char: 'しゃ' }, { romaji: 'shu', char: 'しゅ' }, { romaji: 'sho', char: 'しょ' },
      { romaji: 'cha', char: 'ちゃ' }, { romaji: 'chu', char: 'ちゅ' }, { romaji: 'cho', char: 'ちょ' },
      { romaji: 'nya', char: 'にゃ' }, { romaji: 'nyu', char: 'にゅ' }, { romaji: 'nyo', char: 'にょ' },
      { romaji: 'hya', char: 'ひゃ' }, { romaji: 'hyu', char: 'ひゅ' }, { romaji: 'hyo', char: 'ひょ' },
      { romaji: 'mya', char: 'みゃ' }, { romaji: 'myu', char: 'みゅ' }, { romaji: 'myo', char: 'みょ' },
      { romaji: 'rya', char: 'りゃ' }, { romaji: 'ryu', char: 'りゅ' }, { romaji: 'ryo', char: 'りょ' },
      { romaji: 'gya', char: 'ぎゃ' }, { romaji: 'gyu', char: 'ぎゅ' }, { romaji: 'gyo', char: 'ぎょ' },
      { romaji: 'ja', char: 'じゃ' }, { romaji: 'ju', char: 'じゅ' }, { romaji: 'jo', char: 'じょ' },
      { romaji: 'bya', char: 'びゃ' }, { romaji: 'byu', char: 'びゅ' }, { romaji: 'byo', char: 'びょ' },
      { romaji: 'pya', char: 'ぴゃ' }, { romaji: 'pyu', char: 'ぴゅ' }, { romaji: 'pyo', char: 'ぴょ' },
    ]
  }
}

export const KATAKANA_DATA: AlphabetData = {
  basic: {
    title: 'Basic Katakana',
    items: [
      { romaji: 'a', char: 'ア', hint: 'An "A"xe.' },
      { romaji: 'i', char: 'イ', hint: 'An "Ea"gle.' },
      { romaji: 'u', char: 'ウ', hint: 'An "U"mbrella.' },
      { romaji: 'e', char: 'エ', hint: 'An "E"levator door.' },
      { romaji: 'o', char: 'オ', hint: 'An "O"pera singer.' },
      { romaji: 'ka', char: 'カ', hint: 'A "Ka"ngaroo (sharper).' },
      { romaji: 'ki', char: 'キ', hint: 'A "Key" (sharper).' },
      { romaji: 'ku', char: 'ク', hint: 'A "Coo"k\'s hat.' },
      { romaji: 'ke', char: 'ケ', hint: 'The letter "K".' },
      { romaji: 'ko', char: 'コ', hint: 'Two "Co"rners.' },
      { romaji: 'sa', char: 'サ', hint: 'Three "Sa"rdines.' },
      { romaji: 'shi', char: 'シ', hint: 'A "Shi"p with two drops.' },
      { romaji: 'su', char: 'ス', hint: 'A "Su"perman symbol.' },
      { romaji: 'se', char: 'セ', hint: 'Looks like "Se"ven.' },
      { romaji: 'so', char: 'ソ', hint: 'One "So"ft drop.' },
      { romaji: 'ta', char: 'タ', hint: 'A "Ti"dal wave.' },
      { romaji: 'chi', char: 'チ', hint: 'A "Chee"se slice.' },
      { romaji: 'tsu', char: 'ツ', hint: 'Two "Tsu"nami drops.' },
      { romaji: 'te', char: 'テ', hint: 'A "Te"lephone pole.' },
      { romaji: 'to', char: 'ト', hint: 'A "To"tem pole.' },
      { romaji: 'na', char: 'ナ', hint: 'A "Nu"tcracker.' },
      { romaji: 'ni', char: 'ニ', hint: 'Two "Nee"dles.' },
      { romaji: 'nu', char: 'ヌ', hint: 'A "Noo"dle.' },
      { romaji: 'ne', char: 'ネ', hint: 'A "Ne"st.' },
      { romaji: 'no', char: 'ノ', hint: 'A "No" sign.' },
      { romaji: 'ha', char: 'ハ', hint: 'A "Ha"t.' },
      { romaji: 'hi', char: 'ヒ', hint: 'A "He"el.' },
      { romaji: 'fu', char: 'フ', hint: 'A "Foo"l\'s cap.' },
      { romaji: 'he', char: 'ヘ', hint: 'Pointing to "He"aven.' },
      { romaji: 'ho', char: 'ホ', hint: 'A "Ho"ly cross.' },
      { romaji: 'ma', char: 'マ', hint: 'A "Ma"rtini glass.' },
      { romaji: 'mi', char: 'ミ', hint: 'Three "Mi"ssiles.' },
      { romaji: 'mu', char: 'ム', hint: 'A "Moo"se.' },
      { romaji: 'me', char: 'メ', hint: 'An "X" marking the "Me"dal.' },
      { romaji: 'mo', char: 'モ', hint: 'A "Mo"nitor.' },
      { romaji: 'ya', char: 'ヤ', hint: 'A "Ya"k (sharper).' }, { romaji: '', char: '' },
      { romaji: 'yu', char: 'ユ', hint: 'A "U" turn (sharper).' }, { romaji: '', char: '' },
      { romaji: 'yo', char: 'ヨ', hint: 'A "Yo-yo" (sharper).' },
      { romaji: 'ra', char: 'ラ', hint: 'A "Ra"m.' },
      { romaji: 'ri', char: 'リ', hint: 'A "Ri"bbon (sharper).' },
      { romaji: 'ru', char: 'ル', hint: 'Two "Roo"ts.' },
      { romaji: 're', char: 'レ', hint: 'A "Re"d checkmark.' },
      { romaji: 'ro', char: 'ロ', hint: 'A "Ro"bot head (box).' },
      { romaji: 'wa', char: 'ワ', hint: 'A "Wa"ine glass.' }, { romaji: '', char: '' }, { romaji: '', char: '' }, { romaji: '', char: '' },
      { romaji: 'wo', char: 'ヲ', hint: '"Whoa"! (sharper)' },
      { romaji: 'n', char: 'ン', hint: 'One eye looking "N"orth.' }
    ]
  },
  dakuten: {
    title: 'Dakuten (Tenten / Maru)',
    items: [
      { romaji: 'ga', char: 'ガ' }, { romaji: 'gi', char: 'ギ' }, { romaji: 'gu', char: 'グ' }, { romaji: 'ge', char: 'ゲ' }, { romaji: 'go', char: 'ゴ' },
      { romaji: 'za', char: 'ザ' }, { romaji: 'ji', char: 'ジ' }, { romaji: 'zu', char: 'ズ' }, { romaji: 'ze', char: 'ゼ' }, { romaji: 'zo', char: 'ゾ' },
      { romaji: 'da', char: 'ダ' }, { romaji: 'ji', char: 'ヂ' }, { romaji: 'zu', char: 'ヅ' }, { romaji: 'de', char: 'デ' }, { romaji: 'do', char: 'ド' },
      { romaji: 'ba', char: 'バ' }, { romaji: 'bi', char: 'ビ' }, { romaji: 'bu', char: 'ブ' }, { romaji: 'be', char: 'ベ' }, { romaji: 'bo', char: 'ボ' },
      { romaji: 'pa', char: 'パ' }, { romaji: 'pi', char: 'ピ' }, { romaji: 'pu', char: 'プ' }, { romaji: 'pe', char: 'ペ' }, { romaji: 'po', char: 'ポ' },
    ]
  },
  yoon: {
    title: 'Yoon (Combinations)',
    items: [
      { romaji: 'kya', char: 'キャ' }, { romaji: 'kyu', char: 'キュ' }, { romaji: 'kyo', char: 'キョ' },
      { romaji: 'sha', char: 'シャ' }, { romaji: 'shu', char: 'シュ' }, { romaji: 'sho', char: 'ショ' },
      { romaji: 'cha', char: 'チャ' }, { romaji: 'chu', char: 'チュ' }, { romaji: 'cho', char: 'チョ' },
      { romaji: 'nya', char: 'ニャ' }, { romaji: 'nyu', char: 'ニュ' }, { romaji: 'nyo', char: 'ニョ' },
      { romaji: 'hya', char: 'ヒャ' }, { romaji: 'hyu', char: 'ヒュ' }, { romaji: 'hyo', char: 'ヒョ' },
      { romaji: 'mya', char: 'ミャ' }, { romaji: 'myu', char: 'ミュ' }, { romaji: 'myo', char: 'ミョ' },
      { romaji: 'rya', char: 'リャ' }, { romaji: 'ryu', char: 'リュ' }, { romaji: 'ryo', char: 'リョ' },
      { romaji: 'gya', char: 'ギャ' }, { romaji: 'gyu', char: 'ギュ' }, { romaji: 'gyo', char: 'ギョ' },
      { romaji: 'ja', char: 'ジャ' }, { romaji: 'ju', char: 'ジュ' }, { romaji: 'jo', char: 'ジョ' },
      { romaji: 'bya', char: 'ビャ' }, { romaji: 'byu', char: 'ビュ' }, { romaji: 'byo', char: 'ビョ' },
      { romaji: 'pya', char: 'ピャ' }, { romaji: 'pyu', char: 'ピュ' }, { romaji: 'pyo', char: 'ピョ' },
    ]
  }
}

export const getAllItemsFlat = () => {
  return [
    ...HIRAGANA_DATA.basic.items,
    ...HIRAGANA_DATA.dakuten.items,
    ...HIRAGANA_DATA.yoon.items,
    ...KATAKANA_DATA.basic.items,
    ...KATAKANA_DATA.dakuten.items,
    ...KATAKANA_DATA.yoon.items,
  ].filter(i => i.char !== '')
}

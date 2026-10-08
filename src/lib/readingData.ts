export type ReadingLevel = 
  | 'level1' | 'level2' | 'level3' | 'level4' | 'level5' 
  | 'level6' | 'level7' | 'level8' | 'level9' | 'level10'
  | 'level11' | 'level12' | 'level13' | 'level14' | 'level15'
  | 'level16' | 'level17' | 'level18' | 'level19' | 'level20'
  | 'level21' | 'level22' | 'level23' | 'level24' | 'level25'
  | 'level26' | 'level27' | 'level28' | 'level29' | 'level30'
  | 'level31' | 'level32' | 'level33' | 'level34' | 'level35'
  | 'level36' | 'level37' | 'level38' | 'level39' | 'level40'
  | 'level41' | 'level42' | 'level43' | 'level44' | 'level45'
  | 'level46' | 'level47' | 'level48' | 'level49' | 'level50'

export type ReadingItem = {
  id: string
  japanese: string
  furigana?: string
  romaji: string
  meaning: string
}

export type ReadingCategory = {
  title: string
  description: string
  items: ReadingItem[]
}

export const readingData: Record<ReadingLevel, ReadingCategory> = {
  level1: {
    title: 'Greetings & Basics',
    description: 'Essential everyday greetings and basic expressions.',
    items: [
      { id: 'l1_1', japanese: 'こんにちは', romaji: 'konnichiwa', meaning: 'Hello / Good afternoon' },
      { id: 'l1_2', japanese: 'さようなら', romaji: 'sayounara', meaning: 'Goodbye' },
      { id: 'l1_3', japanese: 'ありがとう', romaji: 'arigatou', meaning: 'Thank you' },
      { id: 'l1_4', japanese: 'おはよう', romaji: 'ohayou', meaning: 'Good morning' },
      { id: 'l1_5', japanese: 'こんばんは', romaji: 'konbanwa', meaning: 'Good evening' },
      { id: 'l1_6', japanese: 'はい', romaji: 'hai', meaning: 'Yes' },
      { id: 'l1_7', japanese: 'いいえ', romaji: 'iie', meaning: 'No' },
      { id: 'l1_8', japanese: 'すみません', romaji: 'sumimasen', meaning: 'Excuse me / I am sorry' },
      { id: 'l1_9', japanese: 'ごめんなさい', romaji: 'gomennasai', meaning: 'I am sorry' },
      { id: 'l1_10', japanese: 'おねがいします', romaji: 'onegaishimasu', meaning: 'Please' },
    ]
  },
  level2: {
    title: 'Numbers & Counters',
    description: 'Basic counting from one to ten and beyond.',
    items: [
      { id: 'l2_1', japanese: 'いち', romaji: 'ichi', meaning: 'One (1)' },
      { id: 'l2_2', japanese: 'に', romaji: 'ni', meaning: 'Two (2)' },
      { id: 'l2_3', japanese: 'さん', romaji: 'san', meaning: 'Three (3)' },
      { id: 'l2_4', japanese: 'よん', romaji: 'yon', meaning: 'Four (4)' },
      { id: 'l2_5', japanese: 'ご', romaji: 'go', meaning: 'Five (5)' },
      { id: 'l2_6', japanese: 'ろく', romaji: 'roku', meaning: 'Six (6)' },
      { id: 'l2_7', japanese: 'なな', romaji: 'nana', meaning: 'Seven (7)' },
      { id: 'l2_8', japanese: 'はち', romaji: 'hachi', meaning: 'Eight (8)' },
      { id: 'l2_9', japanese: 'きゅう', romaji: 'kyuu', meaning: 'Nine (9)' },
      { id: 'l2_10', japanese: 'じゅう', romaji: 'juu', meaning: 'Ten (10)' },
    ]
  },
  level3: {
    title: 'People & Family',
    description: 'Vocabulary related to people and family members.',
    items: [
      { id: 'l3_1', japanese: 'ひと', romaji: 'hito', meaning: 'Person' },
      { id: 'l3_2', japanese: 'おとこ', romaji: 'otoko', meaning: 'Man' },
      { id: 'l3_3', japanese: 'おんな', romaji: 'onna', meaning: 'Woman' },
      { id: 'l3_4', japanese: 'こども', romaji: 'kodomo', meaning: 'Child' },
      { id: 'l3_5', japanese: 'ともだち', romaji: 'tomodachi', meaning: 'Friend' },
      { id: 'l3_6', japanese: 'ちち', romaji: 'chichi', meaning: 'Father (my)' },
      { id: 'l3_7', japanese: 'はは', romaji: 'haha', meaning: 'Mother (my)' },
      { id: 'l3_8', japanese: 'あに', romaji: 'ani', meaning: 'Older brother (my)' },
      { id: 'l3_9', japanese: 'あね', romaji: 'ane', meaning: 'Older sister (my)' },
      { id: 'l3_10', japanese: 'せんせい', romaji: 'sensei', meaning: 'Teacher' },
    ]
  },
  level4: {
    title: 'Time & Days',
    description: 'Words for days of the week and time.',
    items: [
      { id: 'l4_1', japanese: 'きょう', romaji: 'kyou', meaning: 'Today' },
      { id: 'l4_2', japanese: 'あした', romaji: 'ashita', meaning: 'Tomorrow' },
      { id: 'l4_3', japanese: 'きのう', romaji: 'kinou', meaning: 'Yesterday' },
      { id: 'l4_4', japanese: 'いま', romaji: 'ima', meaning: 'Now' },
      { id: 'l4_5', japanese: 'あさ', romaji: 'asa', meaning: 'Morning' },
      { id: 'l4_6', japanese: 'ひる', romaji: 'hiru', meaning: 'Afternoon / Daytime' },
      { id: 'l4_7', japanese: 'よる', romaji: 'yoru', meaning: 'Night' },
      { id: 'l4_8', japanese: 'まいにち', romaji: 'mainichi', meaning: 'Every day' },
      { id: 'l4_9', japanese: 'じかん', romaji: 'jikan', meaning: 'Time / Hours' },
      { id: 'l4_10', japanese: 'とけい', romaji: 'tokei', meaning: 'Clock / Watch' },
    ]
  },
  level5: {
    title: 'Food & Drink',
    description: 'Common food and drink items.',
    items: [
      { id: 'l5_1', japanese: 'みず', romaji: 'mizu', meaning: 'Water' },
      { id: 'l5_2', japanese: 'おちゃ', romaji: 'ocha', meaning: 'Green tea' },
      { id: 'l5_3', japanese: 'ごはん', romaji: 'gohan', meaning: 'Rice / Meal' },
      { id: 'l5_4', japanese: 'パン', romaji: 'pan', meaning: 'Bread' },
      { id: 'l5_5', japanese: 'にく', romaji: 'niku', meaning: 'Meat' },
      { id: 'l5_6', japanese: 'さかな', romaji: 'sakana', meaning: 'Fish' },
      { id: 'l5_7', japanese: 'たまご', romaji: 'tamago', meaning: 'Egg' },
      { id: 'l5_8', japanese: 'やさい', romaji: 'yasai', meaning: 'Vegetable' },
      { id: 'l5_9', japanese: 'くだもの', romaji: 'kudamono', meaning: 'Fruit' },
      { id: 'l5_10', japanese: 'りんご', romaji: 'ringo', meaning: 'Apple' },
    ]
  },
  level6: {
    title: 'Nature & Elements',
    description: 'Words related to nature and natural elements.',
    items: [
      { id: 'l6_1', japanese: 'やま', romaji: 'yama', meaning: 'Mountain' },
      { id: 'l6_2', japanese: 'かわ', romaji: 'kawa', meaning: 'River' },
      { id: 'l6_3', japanese: 'うみ', romaji: 'umi', meaning: 'Sea / Ocean' },
      { id: 'l6_4', japanese: 'そら', romaji: 'sora', meaning: 'Sky' },
      { id: 'l6_5', japanese: 'あめ', romaji: 'ame', meaning: 'Rain' },
      { id: 'l6_6', japanese: 'ゆき', romaji: 'yuki', meaning: 'Snow' },
      { id: 'l6_7', japanese: 'はな', romaji: 'hana', meaning: 'Flower' },
      { id: 'l6_8', japanese: 'き', romaji: 'ki', meaning: 'Tree / Wood' },
      { id: 'l6_9', japanese: 'つき', romaji: 'tsuki', meaning: 'Moon' },
      { id: 'l6_10', japanese: 'てんき', romaji: 'tenki', meaning: 'Weather' },
    ]
  },
  level7: {
    title: 'Places & Transport',
    description: 'Locations and ways to get around.',
    items: [
      { id: 'l7_1', japanese: 'がっこう', romaji: 'gakkou', meaning: 'School' },
      { id: 'l7_2', japanese: 'えき', romaji: 'eki', meaning: 'Train station' },
      { id: 'l7_3', japanese: 'いえ', romaji: 'ie', meaning: 'House / Home' },
      { id: 'l7_4', japanese: 'みせ', romaji: 'mise', meaning: 'Shop / Store' },
      { id: 'l7_5', japanese: 'くるま', romaji: 'kuruma', meaning: 'Car' },
      { id: 'l7_6', japanese: 'でんしゃ', romaji: 'densha', meaning: 'Train' },
      { id: 'l7_7', japanese: 'じてんしゃ', romaji: 'jitensha', meaning: 'Bicycle' },
      { id: 'l7_8', japanese: 'ひこうき', romaji: 'hikouki', meaning: 'Airplane' },
      { id: 'l7_9', japanese: 'みち', romaji: 'michi', meaning: 'Road / Street' },
      { id: 'l7_10', japanese: 'びょういん', romaji: 'byouin', meaning: 'Hospital' },
    ]
  },
  level8: {
    title: 'Things & Items',
    description: 'Common everyday objects.',
    items: [
      { id: 'l8_1', japanese: 'ほん', romaji: 'hon', meaning: 'Book' },
      { id: 'l8_2', japanese: 'かばん', romaji: 'kaban', meaning: 'Bag' },
      { id: 'l8_3', japanese: 'えんぴつ', romaji: 'enpitsu', meaning: 'Pencil' },
      { id: 'l8_4', japanese: 'かさ', romaji: 'kasa', meaning: 'Umbrella' },
      { id: 'l8_5', japanese: 'くつ', romaji: 'kutsu', meaning: 'Shoes' },
      { id: 'l8_6', japanese: 'ふく', romaji: 'fuku', meaning: 'Clothes' },
      { id: 'l8_7', japanese: 'てがみ', romaji: 'tegami', meaning: 'Letter' },
      { id: 'l8_8', japanese: 'おかね', romaji: 'okane', meaning: 'Money' },
      { id: 'l8_9', japanese: 'かみ', romaji: 'kami', meaning: 'Paper' },
      { id: 'l8_10', japanese: 'しゃしん', romaji: 'shashin', meaning: 'Photograph' },
    ]
  },
  level9: {
    title: 'Basic Verbs',
    description: 'Essential N5 action words (Verbs).',
    items: [
      { id: 'l9_1', japanese: 'たべる', romaji: 'taberu', meaning: 'To eat' },
      { id: 'l9_2', japanese: 'のむ', romaji: 'nomu', meaning: 'To drink' },
      { id: 'l9_3', japanese: 'いく', romaji: 'iku', meaning: 'To go' },
      { id: 'l9_4', japanese: 'くる', romaji: 'kuru', meaning: 'To come' },
      { id: 'l9_5', japanese: 'みる', romaji: 'miru', meaning: 'To see / watch' },
      { id: 'l9_6', japanese: 'きく', romaji: 'kiku', meaning: 'To listen / hear' },
      { id: 'l9_7', japanese: 'よむ', romaji: 'yomu', meaning: 'To read' },
      { id: 'l9_8', japanese: 'かく', romaji: 'kaku', meaning: 'To write' },
      { id: 'l9_9', japanese: 'はなす', romaji: 'hanasu', meaning: 'To speak' },
      { id: 'l9_10', japanese: 'かう', romaji: 'kau', meaning: 'To buy' },
    ]
  },
  level10: {
    title: 'Basic Adjectives',
    description: 'Essential N5 describing words (Adjectives).',
    items: [
      { id: 'l10_1', japanese: 'おおきい', romaji: 'ookii', meaning: 'Big' },
      { id: 'l10_2', japanese: 'ちいさい', romaji: 'chiisai', meaning: 'Small' },
      { id: 'l10_3', japanese: 'あたらしい', romaji: 'atarashii', meaning: 'New' },
      { id: 'l10_4', japanese: 'ふるい', romaji: 'furui', meaning: 'Old' },
      { id: 'l10_5', japanese: 'いい', romaji: 'ii', meaning: 'Good' },
      { id: 'l10_6', japanese: 'わるい', romaji: 'warui', meaning: 'Bad' },
      { id: 'l10_7', japanese: 'あつい', romaji: 'atsui', meaning: 'Hot' },
      { id: 'l10_8', japanese: 'さむい', romaji: 'samui', meaning: 'Cold' },
      { id: 'l10_9', japanese: 'たかい', romaji: 'takai', meaning: 'High / Expensive' },
      { id: 'l10_10', japanese: 'やすい', romaji: 'yasui', meaning: 'Cheap' },
    ]
  },
  level11: {
    title: 'Daily Routine Verbs',
    description: 'Verbs used in everyday routines.',
    items: [
      { id: 'l11_1', japanese: 'おきる', romaji: 'okiru', meaning: 'To wake up / get up' },
      { id: 'l11_2', japanese: 'ねる', romaji: 'neru', meaning: 'To sleep' },
      { id: 'l11_3', japanese: 'あびる', romaji: 'abiru', meaning: 'To take (a shower)' },
      { id: 'l11_4', japanese: 'あらう', romaji: 'arau', meaning: 'To wash' },
      { id: 'l11_5', japanese: 'みがく', romaji: 'migaku', meaning: 'To brush / polish' },
      { id: 'l11_6', japanese: 'かえる', romaji: 'kaeru', meaning: 'To return home' },
      { id: 'l11_7', japanese: 'やすむ', romaji: 'yasumu', meaning: 'To rest' },
      { id: 'l11_8', japanese: 'あそぶ', romaji: 'asobu', meaning: 'To play / hang out' },
      { id: 'l11_9', japanese: 'べんきょうする', romaji: 'benkyousuru', meaning: 'To study' },
      { id: 'l11_10', japanese: 'しごとをする', romaji: 'shigoto o suru', meaning: 'To work' },
    ]
  },
  level12: {
    title: 'Motion & Action Verbs',
    description: 'Common verbs for moving and acting.',
    items: [
      { id: 'l12_1', japanese: 'あるく', romaji: 'aruku', meaning: 'To walk' },
      { id: 'l12_2', japanese: 'はしる', romaji: 'hashiru', meaning: 'To run' },
      { id: 'l12_3', japanese: 'およぐ', romaji: 'oyogu', meaning: 'To swim' },
      { id: 'l12_4', japanese: 'とぶ', romaji: 'tobu', meaning: 'To fly / jump' },
      { id: 'l12_5', japanese: 'のる', romaji: 'noru', meaning: 'To ride' },
      { id: 'l12_6', japanese: 'おりる', romaji: 'oriru', meaning: 'To get off' },
      { id: 'l12_7', japanese: 'はいる', romaji: 'hairu', meaning: 'To enter' },
      { id: 'l12_8', japanese: 'でる', romaji: 'deru', meaning: 'To exit / leave' },
      { id: 'l12_9', japanese: 'たつ', romaji: 'tatsu', meaning: 'To stand' },
      { id: 'l12_10', japanese: 'すわる', romaji: 'suwaru', meaning: 'To sit' },
    ]
  },
  level13: {
    title: 'Adjectives (Feelings)',
    description: 'Describing how you feel.',
    items: [
      { id: 'l13_1', japanese: 'うれしい', romaji: 'ureshii', meaning: 'Happy / Glad' },
      { id: 'l13_2', japanese: 'かなしい', romaji: 'kanashii', meaning: 'Sad' },
      { id: 'l13_3', japanese: 'たのしい', romaji: 'tanoshii', meaning: 'Fun / Enjoyable' },
      { id: 'l13_4', japanese: 'さびしい', romaji: 'sabishii', meaning: 'Lonely' },
      { id: 'l13_5', japanese: 'こわい', romaji: 'kowai', meaning: 'Scary / Frightening' },
      { id: 'l13_6', japanese: 'いたい', romaji: 'itai', meaning: 'Painful' },
      { id: 'l13_7', japanese: 'ねむい', romaji: 'nemui', meaning: 'Sleepy' },
      { id: 'l13_8', japanese: 'いそがしい', romaji: 'isogashii', meaning: 'Busy' },
      { id: 'l13_9', japanese: 'ひま', romaji: 'hima', meaning: 'Free (time)' },
      { id: 'l13_10', japanese: 'げんき', romaji: 'genki', meaning: 'Healthy / Energetic' },
    ]
  },
  level14: {
    title: 'Adjectives (Appearance)',
    description: 'Words to describe appearance and nature.',
    items: [
      { id: 'l14_1', japanese: 'きれい', romaji: 'kirei', meaning: 'Beautiful / Clean' },
      { id: 'l14_2', japanese: 'かわいい', romaji: 'kawaii', meaning: 'Cute' },
      { id: 'l14_3', japanese: 'かっこいい', romaji: 'kakkoii', meaning: 'Cool / Handsome' },
      { id: 'l14_4', japanese: 'ながい', romaji: 'nagai', meaning: 'Long' },
      { id: 'l14_5', japanese: 'みじかい', romaji: 'mijikai', meaning: 'Short (length)' },
      { id: 'l14_6', japanese: 'おもい', romaji: 'omoi', meaning: 'Heavy' },
      { id: 'l14_7', japanese: 'かるい', romaji: 'karui', meaning: 'Light (weight)' },
      { id: 'l14_8', japanese: 'ひろい', romaji: 'hiroi', meaning: 'Wide / Spacious' },
      { id: 'l14_9', japanese: 'せまい', romaji: 'semai', meaning: 'Narrow' },
      { id: 'l14_10', japanese: 'あかるい', romaji: 'akarui', meaning: 'Bright' },
    ]
  },
  level15: {
    title: 'Positions & Directions',
    description: 'Essential words for locations.',
    items: [
      { id: 'l15_1', japanese: 'うえ', romaji: 'ue', meaning: 'Up / Above' },
      { id: 'l15_2', japanese: 'した', romaji: 'shita', meaning: 'Down / Below' },
      { id: 'l15_3', japanese: 'まえ', romaji: 'mae', meaning: 'Front / Before' },
      { id: 'l15_4', japanese: 'うしろ', romaji: 'ushiro', meaning: 'Behind' },
      { id: 'l15_5', japanese: 'みぎ', romaji: 'migi', meaning: 'Right' },
      { id: 'l15_6', japanese: 'ひだり', romaji: 'hidari', meaning: 'Left' },
      { id: 'l15_7', japanese: 'なか', romaji: 'naka', meaning: 'Inside' },
      { id: 'l15_8', japanese: 'そと', romaji: 'soto', meaning: 'Outside' },
      { id: 'l15_9', japanese: 'となり', romaji: 'tonari', meaning: 'Next to' },
      { id: 'l15_10', japanese: 'ちかく', romaji: 'chikaku', meaning: 'Near' },
    ]
  },
  level16: {
    title: 'Animals',
    description: 'Common animals vocabulary.',
    items: [
      { id: 'l16_1', japanese: 'いぬ', romaji: 'inu', meaning: 'Dog' },
      { id: 'l16_2', japanese: 'ねこ', romaji: 'neko', meaning: 'Cat' },
      { id: 'l16_3', japanese: 'とり', romaji: 'tori', meaning: 'Bird' },
      { id: 'l16_4', japanese: 'うし', romaji: 'ushi', meaning: 'Cow' },
      { id: 'l16_5', japanese: 'うま', romaji: 'uma', meaning: 'Horse' },
      { id: 'l16_6', japanese: 'ぶた', romaji: 'buta', meaning: 'Pig' },
      { id: 'l16_7', japanese: 'さる', romaji: 'saru', meaning: 'Monkey' },
      { id: 'l16_8', japanese: 'くま', romaji: 'kuma', meaning: 'Bear' },
      { id: 'l16_9', japanese: 'むし', romaji: 'mushi', meaning: 'Insect / Bug' },
      { id: 'l16_10', japanese: 'どうぶつ', romaji: 'doubutsu', meaning: 'Animal' },
    ]
  },
  level17: {
    title: 'Colors',
    description: 'Learn the basic colors.',
    items: [
      { id: 'l17_1', japanese: 'あか', romaji: 'aka', meaning: 'Red' },
      { id: 'l17_2', japanese: 'あお', romaji: 'ao', meaning: 'Blue' },
      { id: 'l17_3', japanese: 'しろ', romaji: 'shiro', meaning: 'White' },
      { id: 'l17_4', japanese: 'くろ', romaji: 'kuro', meaning: 'Black' },
      { id: 'l17_5', japanese: 'きいろ', romaji: 'kiiro', meaning: 'Yellow' },
      { id: 'l17_6', japanese: 'みどり', romaji: 'midori', meaning: 'Green' },
      { id: 'l17_7', japanese: 'ちゃいろ', romaji: 'chairo', meaning: 'Brown' },
      { id: 'l17_8', japanese: 'ピンク', romaji: 'pinku', meaning: 'Pink' },
      { id: 'l17_9', japanese: 'オレンジ', romaji: 'orenji', meaning: 'Orange' },
      { id: 'l17_10', japanese: 'いろ', romaji: 'iro', meaning: 'Color' },
    ]
  },
  level18: {
    title: 'Body Parts',
    description: 'Essential vocabulary for the body.',
    items: [
      { id: 'l18_1', japanese: 'からだ', romaji: 'karada', meaning: 'Body' },
      { id: 'l18_2', japanese: 'あたま', romaji: 'atama', meaning: 'Head' },
      { id: 'l18_3', japanese: 'かお', romaji: 'kao', meaning: 'Face' },
      { id: 'l18_4', japanese: 'め', romaji: 'me', meaning: 'Eye' },
      { id: 'l18_5', japanese: 'みみ', romaji: 'mimi', meaning: 'Ear' },
      { id: 'l18_6', japanese: 'はな', romaji: 'hana', meaning: 'Nose' },
      { id: 'l18_7', japanese: 'くち', romaji: 'kuchi', meaning: 'Mouth' },
      { id: 'l18_8', japanese: 'て', romaji: 'te', meaning: 'Hand' },
      { id: 'l18_9', japanese: 'あし', romaji: 'ashi', meaning: 'Leg / Foot' },
      { id: 'l18_10', japanese: 'かみ', romaji: 'kami', meaning: 'Hair' },
    ]
  },
  level19: {
    title: 'Family (Extended)',
    description: 'Other family members and formal terms.',
    items: [
      { id: 'l19_1', japanese: 'かぞく', romaji: 'kazoku', meaning: 'Family' },
      { id: 'l19_2', japanese: 'おとうさん', romaji: 'otousan', meaning: 'Father (formal)' },
      { id: 'l19_3', japanese: 'おかあさん', romaji: 'okaasan', meaning: 'Mother (formal)' },
      { id: 'l19_4', japanese: 'おにいさん', romaji: 'oniisan', meaning: 'Older brother (formal)' },
      { id: 'l19_5', japanese: 'おねえさん', romaji: 'oneesan', meaning: 'Older sister (formal)' },
      { id: 'l19_6', japanese: 'おとうと', romaji: 'otouto', meaning: 'Younger brother' },
      { id: 'l19_7', japanese: 'いもうと', romaji: 'imouto', meaning: 'Younger sister' },
      { id: 'l19_8', japanese: 'おじいさん', romaji: 'ojiisan', meaning: 'Grandfather' },
      { id: 'l19_9', japanese: 'おばあさん', romaji: 'obaasan', meaning: 'Grandmother' },
      { id: 'l19_10', japanese: 'りょうしん', romaji: 'ryoushin', meaning: 'Parents' },
    ]
  },
  level20: {
    title: 'Occupations',
    description: 'Common jobs and roles.',
    items: [
      { id: 'l20_1', japanese: 'がくせい', romaji: 'gakusei', meaning: 'Student' },
      { id: 'l20_2', japanese: 'せんせい', romaji: 'sensei', meaning: 'Teacher' },
      { id: 'l20_3', japanese: 'いしゃ', romaji: 'isha', meaning: 'Doctor' },
      { id: 'l20_4', japanese: 'かいしゃいん', romaji: 'kaishain', meaning: 'Office worker' },
      { id: 'l20_5', japanese: 'けいかん', romaji: 'keikan', meaning: 'Police officer' },
      { id: 'l20_6', japanese: 'てんいん', romaji: 'tenin', meaning: 'Store clerk' },
      { id: 'l20_7', japanese: 'えきいん', romaji: 'ekiin', meaning: 'Station attendant' },
      { id: 'l20_8', japanese: 'ぎんこういん', romaji: 'ginkouin', meaning: 'Bank employee' },
      { id: 'l20_9', japanese: 'しゅふ', romaji: 'shufu', meaning: 'Housewife' },
      { id: 'l20_10', japanese: 'しごと', romaji: 'shigoto', meaning: 'Job / Work' },
    ]
  },
  level21: {
    title: 'Adverbs of Degree',
    description: 'Words that express how much or how often.',
    items: [
      { id: 'l21_1', japanese: 'とても', romaji: 'totemo', meaning: 'Very' },
      { id: 'l21_2', japanese: 'すこし', romaji: 'sukoshi', meaning: 'A little' },
      { id: 'l21_3', japanese: 'たくさん', romaji: 'takusan', meaning: 'A lot / Many' },
      { id: 'l21_4', japanese: 'よく', romaji: 'yoku', meaning: 'Often / Well' },
      { id: 'l21_5', japanese: 'たいてい', romaji: 'taitei', meaning: 'Usually' },
      { id: 'l21_6', japanese: 'いつも', romaji: 'itsumo', meaning: 'Always' },
      { id: 'l21_7', japanese: 'ときどき', romaji: 'tokidoki', meaning: 'Sometimes' },
      { id: 'l21_8', japanese: 'ぜんぜん', romaji: 'zenzen', meaning: 'Not at all (used with negative)' },
      { id: 'l21_9', japanese: 'あまり', romaji: 'amari', meaning: 'Not much (used with negative)' },
      { id: 'l21_10', japanese: 'もう', romaji: 'mou', meaning: 'Already / Anymore' },
    ]
  },
  level22: {
    title: 'Time Expressions (Days)',
    description: 'Vocabulary for specifying days and dates.',
    items: [
      { id: 'l22_1', japanese: 'おととい', romaji: 'ototoi', meaning: 'The day before yesterday' },
      { id: 'l22_2', japanese: 'あさって', romaji: 'asatte', meaning: 'The day after tomorrow' },
      { id: 'l22_3', japanese: 'こんしゅう', romaji: 'konshuu', meaning: 'This week' },
      { id: 'l22_4', japanese: 'らいしゅう', romaji: 'raishuu', meaning: 'Next week' },
      { id: 'l22_5', japanese: 'せんしゅう', romaji: 'senshuu', meaning: 'Last week' },
      { id: 'l22_6', japanese: 'こんげつ', romaji: 'kongetsu', meaning: 'This month' },
      { id: 'l22_7', japanese: 'らいげつ', romaji: 'raigetsu', meaning: 'Next month' },
      { id: 'l22_8', japanese: 'せんげつ', romaji: 'sengetsu', meaning: 'Last month' },
      { id: 'l22_9', japanese: 'ことし', romaji: 'kotoshi', meaning: 'This year' },
      { id: 'l22_10', japanese: 'らいねん', romaji: 'rainen', meaning: 'Next year' },
    ]
  },
  level23: {
    title: 'Days of the Week',
    description: 'Learn the days of the week in Japanese.',
    items: [
      { id: 'l23_1', japanese: 'げつようび', romaji: 'getsuyoubi', meaning: 'Monday' },
      { id: 'l23_2', japanese: 'かようび', romaji: 'kayoubi', meaning: 'Tuesday' },
      { id: 'l23_3', japanese: 'すいようび', romaji: 'suiyoubi', meaning: 'Wednesday' },
      { id: 'l23_4', japanese: 'もくようび', romaji: 'mokuyoubi', meaning: 'Thursday' },
      { id: 'l23_5', japanese: 'きんようび', romaji: 'kinyoubi', meaning: 'Friday' },
      { id: 'l23_6', japanese: 'どようび', romaji: 'doyoubi', meaning: 'Saturday' },
      { id: 'l23_7', japanese: 'にちようび', romaji: 'nichiyoubi', meaning: 'Sunday' },
      { id: 'l23_8', japanese: 'へいじつ', romaji: 'heijitsu', meaning: 'Weekday' },
      { id: 'l23_9', japanese: 'しゅうまつ', romaji: 'shuumatsu', meaning: 'Weekend' },
      { id: 'l23_10', japanese: 'なんようび', romaji: 'nanyoubi', meaning: 'What day of the week?' },
    ]
  },
  level24: {
    title: 'House & Furniture',
    description: 'Things you find around the house.',
    items: [
      { id: 'l24_1', japanese: 'へや', romaji: 'heya', meaning: 'Room' },
      { id: 'l24_2', japanese: 'まど', romaji: 'mado', meaning: 'Window' },
      { id: 'l24_3', japanese: 'ドア', romaji: 'doa', meaning: 'Door' },
      { id: 'l24_4', japanese: 'つくえ', romaji: 'tsukue', meaning: 'Desk' },
      { id: 'l24_5', japanese: 'いす', romaji: 'isu', meaning: 'Chair' },
      { id: 'l24_6', japanese: 'ベッド', romaji: 'beddo', meaning: 'Bed' },
      { id: 'l24_7', japanese: 'テレビ', romaji: 'terebi', meaning: 'Television' },
      { id: 'l24_8', japanese: 'れいぞうこ', romaji: 'reizouko', meaning: 'Refrigerator' },
      { id: 'l24_9', japanese: 'トイレ', romaji: 'toire', meaning: 'Toilet / Restroom' },
      { id: 'l24_10', japanese: 'おふろ', romaji: 'ofuro', meaning: 'Bath' },
    ]
  },
  level25: {
    title: 'School & Office',
    description: 'Items used in study or work.',
    items: [
      { id: 'l25_1', japanese: 'えんぴつ', romaji: 'enpitsu', meaning: 'Pencil' },
      { id: 'l25_2', japanese: 'ボールペン', romaji: 'boorupen', meaning: 'Ballpoint pen' },
      { id: 'l25_3', japanese: 'けしゴム', romaji: 'keshigomu', meaning: 'Eraser' },
      { id: 'l25_4', japanese: 'ノート', romaji: 'nooto', meaning: 'Notebook' },
      { id: 'l25_5', japanese: 'じしょ', romaji: 'jisho', meaning: 'Dictionary' },
      { id: 'l25_6', japanese: 'かさ', romaji: 'kasa', meaning: 'Umbrella' },
      { id: 'l25_7', japanese: 'めがね', romaji: 'megane', meaning: 'Glasses' },
      { id: 'l25_8', japanese: 'パソコン', romaji: 'pasokon', meaning: 'Personal Computer' },
      { id: 'l25_9', japanese: 'でんわ', romaji: 'denwa', meaning: 'Telephone' },
      { id: 'l25_10', japanese: 'けいたい', romaji: 'keitai', meaning: 'Mobile phone' },
    ]
  },
  level26: {
    title: 'Question Words',
    description: 'Essential words for asking questions.',
    items: [
      { id: 'l26_1', japanese: 'なに', romaji: 'nani / nan', meaning: 'What' },
      { id: 'l26_2', japanese: 'だれ', romaji: 'dare', meaning: 'Who' },
      { id: 'l26_3', japanese: 'どこ', romaji: 'doko', meaning: 'Where' },
      { id: 'l26_4', japanese: 'いつ', romaji: 'itsu', meaning: 'When' },
      { id: 'l26_5', japanese: 'なぜ', romaji: 'naze', meaning: 'Why' },
      { id: 'l26_6', japanese: 'どうして', romaji: 'doushite', meaning: 'Why (informal)' },
      { id: 'l26_7', japanese: 'どちら', romaji: 'dochira', meaning: 'Which one (of two)' },
      { id: 'l26_8', japanese: 'どれ', romaji: 'dore', meaning: 'Which one (of three or more)' },
      { id: 'l26_9', japanese: 'どんな', romaji: 'donna', meaning: 'What kind of' },
      { id: 'l26_10', japanese: 'いくつ', romaji: 'ikutsu', meaning: 'How many / How old' },
    ]
  },
  level27: {
    title: 'Basic Phrases 1 (Questions)',
    description: 'Common daily questions.',
    items: [
      { id: 'l27_1', japanese: 'おげんきですか', romaji: 'o genki desu ka', meaning: 'How are you?' },
      { id: 'l27_2', japanese: 'おなまえはなんですか', romaji: 'o namae wa nan desu ka', meaning: 'What is your name?' },
      { id: 'l27_3', japanese: 'どこからきましたか', romaji: 'doko kara kimashita ka', meaning: 'Where are you from?' },
      { id: 'l27_4', japanese: 'いまなんじですか', romaji: 'ima nanji desu ka', meaning: 'What time is it now?' },
      { id: 'l27_5', japanese: 'いくらですか', romaji: 'ikura desu ka', meaning: 'How much is it?' },
      { id: 'l27_6', japanese: 'これはなんですか', romaji: 'kore wa nan desu ka', meaning: 'What is this?' },
      { id: 'l27_7', japanese: 'トイレはどこですか', romaji: 'toire wa doko desu ka', meaning: 'Where is the restroom?' },
      { id: 'l27_8', japanese: 'えいごがはなせますか', romaji: 'eigo ga hanasemasu ka', meaning: 'Can you speak English?' },
      { id: 'l27_9', japanese: 'わかりましたか', romaji: 'wakarimashita ka', meaning: 'Did you understand?' },
      { id: 'l27_10', japanese: 'どうしましたか', romaji: 'dou shimashita ka', meaning: 'What happened? / What is wrong?' },
    ]
  },
  level28: {
    title: 'Basic Phrases 2 (Responses)',
    description: 'Common responses and manners.',
    items: [
      { id: 'l28_1', japanese: 'はじめまして', romaji: 'hajimemashite', meaning: 'Nice to meet you (first time)' },
      { id: 'l28_2', japanese: 'よろしくおねがいします', romaji: 'yoroshiku onegaishimasu', meaning: 'Please treat me well' },
      { id: 'l28_3', japanese: 'いただきます', romaji: 'itadakimasu', meaning: 'Let’s eat (before meal)' },
      { id: 'l28_4', japanese: 'ごちそうさまでした', romaji: 'gochisousama deshita', meaning: 'Thank you for the meal (after meal)' },
      { id: 'l28_5', japanese: 'いってきます', romaji: 'ittekimasu', meaning: 'I am leaving' },
      { id: 'l28_6', japanese: 'いってらっしゃい', romaji: 'itterasshai', meaning: 'Take care / See you (to someone leaving)' },
      { id: 'l28_7', japanese: 'ただいま', romaji: 'tadaima', meaning: 'I am home' },
      { id: 'l28_8', japanese: 'おかえりなさい', romaji: 'okaerinasai', meaning: 'Welcome home' },
      { id: 'l28_9', japanese: 'わかりません', romaji: 'wakarimasen', meaning: 'I do not understand' },
      { id: 'l28_10', japanese: 'だいじょうぶです', romaji: 'daijoubu desu', meaning: 'It is okay / I am fine' },
    ]
  },
  level29: {
    title: 'Connecting Words',
    description: 'Words used to connect sentences.',
    items: [
      { id: 'l29_1', japanese: 'そして', romaji: 'soshite', meaning: 'And / And then' },
      { id: 'l29_2', japanese: 'それから', romaji: 'sorekara', meaning: 'After that' },
      { id: 'l29_3', japanese: 'でも', romaji: 'demo', meaning: 'But / However' },
      { id: 'l29_4', japanese: 'だから', romaji: 'dakara', meaning: 'So / Therefore' },
      { id: 'l29_5', japanese: 'また', romaji: 'mata', meaning: 'Also / Again' },
      { id: 'l29_6', japanese: 'しかし', romaji: 'shikashi', meaning: 'However (formal)' },
      { id: 'l29_7', japanese: 'なぜなら', romaji: 'nazenara', meaning: 'Because' },
      { id: 'l29_8', japanese: 'たとえば', romaji: 'tatoeba', meaning: 'For example' },
      { id: 'l29_9', japanese: 'ほんとうに', romaji: 'hontouni', meaning: 'Really / Truly' },
      { id: 'l29_10', japanese: 'もちろん', romaji: 'mochiron', meaning: 'Of course' },
    ]
  },
  level30: {
    title: 'Bonus: Essential Kanji Readings',
    description: 'Practice speaking the Japanese reading of N5 Kanji words.',
    items: [
      { id: 'l30_1', japanese: '日', romaji: 'hi / nichi / bi', meaning: 'Sun / Day' },
      { id: 'l30_2', japanese: '月', romaji: 'tsuki / getsu', meaning: 'Moon / Month' },
      { id: 'l30_3', japanese: '火', romaji: 'hi / ka', meaning: 'Fire' },
      { id: 'l30_4', japanese: '水', romaji: 'mizu / sui', meaning: 'Water' },
      { id: 'l30_5', japanese: '木', romaji: 'ki / moku', meaning: 'Tree / Wood' },
      { id: 'l30_6', japanese: '金', romaji: 'kane / kin', meaning: 'Gold / Money' },
      { id: 'l30_7', japanese: '土', romaji: 'tsuchi / do', meaning: 'Earth / Soil' },
      { id: 'l30_8', japanese: '山', romaji: 'yama / san', meaning: 'Mountain' },
      { id: 'l30_9', japanese: '川', romaji: 'kawa / sen', meaning: 'River' },
      { id: 'l30_10', japanese: '人', romaji: 'hito / jin / nin', meaning: 'Person' },
    ]
  },
  level31: {
    title: 'Verbs (Giving & Receiving)',
    description: 'N5 verbs for interactions between people.',
    items: [
      { id: 'l31_1', japanese: 'あげる', romaji: 'ageru', meaning: 'To give' },
      { id: 'l31_2', japanese: 'もらう', romaji: 'morau', meaning: 'To receive' },
      { id: 'l31_3', japanese: 'くれる', romaji: 'kureru', meaning: 'To give (to me)' },
      { id: 'l31_4', japanese: 'かす', romaji: 'kasu', meaning: 'To lend' },
      { id: 'l31_5', japanese: 'かりる', romaji: 'kariru', meaning: 'To borrow' },
      { id: 'l31_6', japanese: 'おしえる', romaji: 'oshieru', meaning: 'To teach / tell' },
      { id: 'l31_7', japanese: 'ならう', romaji: 'narau', meaning: 'To learn' },
      { id: 'l31_8', japanese: 'かける', romaji: 'kakeru', meaning: 'To make (a phone call)' },
      { id: 'l31_9', japanese: 'みせる', romaji: 'miseru', meaning: 'To show' },
      { id: 'l31_10', japanese: 'おくる', romaji: 'okuru', meaning: 'To send' },
    ]
  },
  level32: {
    title: 'Verbs (Daily Chores)',
    description: 'N5 verbs used in daily household activities.',
    items: [
      { id: 'l32_1', japanese: 'あける', romaji: 'akeru', meaning: 'To open' },
      { id: 'l32_2', japanese: 'しめる', romaji: 'shimeru', meaning: 'To close' },
      { id: 'l32_3', japanese: 'つける', romaji: 'tsukeru', meaning: 'To turn on' },
      { id: 'l32_4', japanese: 'けす', romaji: 'kesu', meaning: 'To turn off / erase' },
      { id: 'l32_5', japanese: 'そうじする', romaji: 'soujisuru', meaning: 'To clean' },
      { id: 'l32_6', japanese: 'せんたくする', romaji: 'sentakusuru', meaning: 'To do laundry' },
      { id: 'l32_7', japanese: 'りょうりする', romaji: 'ryourisuru', meaning: 'To cook' },
      { id: 'l32_8', japanese: 'きる', romaji: 'kiru', meaning: 'To cut / slice' },
      { id: 'l32_9', japanese: 'いれる', romaji: 'ireru', meaning: 'To put in' },
      { id: 'l32_10', japanese: 'だす', romaji: 'dasu', meaning: 'To take out / hand in' },
    ]
  },
  level33: {
    title: 'Clothing & Wearing',
    description: 'Words for clothes and verbs for wearing them.',
    items: [
      { id: 'l33_1', japanese: 'ふく', romaji: 'fuku', meaning: 'Clothes' },
      { id: 'l33_2', japanese: 'シャツ', romaji: 'shatsu', meaning: 'Shirt' },
      { id: 'l33_3', japanese: 'ズボン', romaji: 'zubon', meaning: 'Trousers / Pants' },
      { id: 'l33_4', japanese: 'ぼうし', romaji: 'boushi', meaning: 'Hat / Cap' },
      { id: 'l33_5', japanese: 'めがね', romaji: 'megane', meaning: 'Glasses' },
      { id: 'l33_6', japanese: 'きる', romaji: 'kiru', meaning: 'To wear (upper body)' },
      { id: 'l33_7', japanese: 'はく', romaji: 'haku', meaning: 'To wear (lower body/shoes)' },
      { id: 'l33_8', japanese: 'かぶる', romaji: 'kaburu', meaning: 'To wear (on head)' },
      { id: 'l33_9', japanese: 'かける', romaji: 'kakeru', meaning: 'To wear (glasses)' },
      { id: 'l33_10', japanese: 'ぬぐ', romaji: 'nugu', meaning: 'To take off (clothes)' },
    ]
  },
  level34: {
    title: 'Places in Town',
    description: 'Buildings and locations in a city.',
    items: [
      { id: 'l34_1', japanese: 'ぎんこう', romaji: 'ginkou', meaning: 'Bank' },
      { id: 'l34_2', japanese: 'ゆうびんきょく', romaji: 'yuubinkyoku', meaning: 'Post office' },
      { id: 'l34_3', japanese: 'としょかん', romaji: 'toshokan', meaning: 'Library' },
      { id: 'l34_4', japanese: 'びじゅつかん', romaji: 'bijutsukan', meaning: 'Art museum' },
      { id: 'l34_5', japanese: 'えいがかん', romaji: 'eigakan', meaning: 'Movie theater' },
      { id: 'l34_6', japanese: 'こうえん', romaji: 'kouen', meaning: 'Park' },
      { id: 'l34_7', japanese: 'しょくどう', romaji: 'shokudou', meaning: 'Cafeteria / Dining hall' },
      { id: 'l34_8', japanese: 'デパート', romaji: 'depaato', meaning: 'Department store' },
      { id: 'l34_9', japanese: 'スーパー', romaji: 'suupaa', meaning: 'Supermarket' },
      { id: 'l34_10', japanese: 'コンビニ', romaji: 'konbini', meaning: 'Convenience store' },
    ]
  },
  level35: {
    title: 'Food & Meals 2',
    description: 'More specific food and meal vocabulary.',
    items: [
      { id: 'l35_1', japanese: 'あさごはん', romaji: 'asagohan', meaning: 'Breakfast' },
      { id: 'l35_2', japanese: 'ひるごはん', romaji: 'hirugohan', meaning: 'Lunch' },
      { id: 'l35_3', japanese: 'ばんごはん', romaji: 'bangohan', meaning: 'Dinner' },
      { id: 'l35_4', japanese: 'ぎゅうにゅう', romaji: 'gyuunyuu', meaning: 'Milk' },
      { id: 'l35_5', japanese: 'おさけ', romaji: 'osake', meaning: 'Alcohol / Sake' },
      { id: 'l35_6', japanese: 'さとう', romaji: 'satou', meaning: 'Sugar' },
      { id: 'l35_7', japanese: 'しお', romaji: 'shio', meaning: 'Salt' },
      { id: 'l35_8', japanese: 'しょうゆ', romaji: 'shouyu', meaning: 'Soy sauce' },
      { id: 'l35_9', japanese: 'やさい', romaji: 'yasai', meaning: 'Vegetables' },
      { id: 'l35_10', japanese: 'おかし', romaji: 'okashi', meaning: 'Sweets / Snacks' },
    ]
  },
  level36: {
    title: 'Time (Frequencies)',
    description: 'Words describing how often things happen.',
    items: [
      { id: 'l36_1', japanese: 'まいにち', romaji: 'mainichi', meaning: 'Every day' },
      { id: 'l36_2', japanese: 'まいあさ', romaji: 'maiasa', meaning: 'Every morning' },
      { id: 'l36_3', japanese: 'まいばん', romaji: 'maiban', meaning: 'Every night' },
      { id: 'l36_4', japanese: 'まいしゅう', romaji: 'maishuu', meaning: 'Every week' },
      { id: 'l36_5', japanese: 'まいげつ', romaji: 'maigetsu', meaning: 'Every month' },
      { id: 'l36_6', japanese: 'まいとし', romaji: 'maitoshi', meaning: 'Every year' },
      { id: 'l36_7', japanese: 'ときどき', romaji: 'tokidoki', meaning: 'Sometimes' },
      { id: 'l36_8', japanese: 'いつも', romaji: 'itsumo', meaning: 'Always' },
      { id: 'l36_9', japanese: 'たいてい', romaji: 'taitei', meaning: 'Usually' },
      { id: 'l36_10', japanese: 'よく', romaji: 'yoku', meaning: 'Often' },
    ]
  },
  level37: {
    title: 'Adjectives (Taste & Weather)',
    description: 'Words for describing food and weather.',
    items: [
      { id: 'l37_1', japanese: 'おいしい', romaji: 'oishii', meaning: 'Delicious / Tasty' },
      { id: 'l37_2', japanese: 'まずい', romaji: 'mazui', meaning: 'Bad tasting' },
      { id: 'l37_3', japanese: 'あまい', romaji: 'amai', meaning: 'Sweet' },
      { id: 'l37_4', japanese: 'からい', romaji: 'karai', meaning: 'Spicy / Salty' },
      { id: 'l37_5', japanese: 'つめたい', romaji: 'tsumetai', meaning: 'Cold (to the touch)' },
      { id: 'l37_6', japanese: 'あたたかい', romaji: 'atatakai', meaning: 'Warm' },
      { id: 'l37_7', japanese: 'すずしい', romaji: 'suzushii', meaning: 'Cool (weather)' },
      { id: 'l37_8', japanese: 'むしあつい', romaji: 'mushiatsui', meaning: 'Hot and humid' },
      { id: 'l37_9', japanese: 'いいてんき', romaji: 'ii tenki', meaning: 'Good weather' },
      { id: 'l37_10', japanese: 'わるいてんき', romaji: 'warui tenki', meaning: 'Bad weather' },
    ]
  },
  level38: {
    title: 'Adjectives (Difficulty & Quality)',
    description: 'Words describing tasks and objects.',
    items: [
      { id: 'l38_1', japanese: 'むずかしい', romaji: 'muzukashii', meaning: 'Difficult' },
      { id: 'l38_2', japanese: 'やさしい', romaji: 'yasashii', meaning: 'Easy / Kind' },
      { id: 'l38_3', japanese: 'たかい', romaji: 'takai', meaning: 'Expensive / High' },
      { id: 'l38_4', japanese: 'やすい', romaji: 'yasui', meaning: 'Cheap' },
      { id: 'l38_5', japanese: 'ひくい', romaji: 'hikui', meaning: 'Low' },
      { id: 'l38_6', japanese: 'おもしろい', romaji: 'omoshiroi', meaning: 'Interesting' },
      { id: 'l38_7', japanese: 'つまらない', romaji: 'tsumaranai', meaning: 'Boring' },
      { id: 'l38_8', japanese: 'いそがしい', romaji: 'isogashii', meaning: 'Busy' },
      { id: 'l38_9', japanese: 'べんり', romaji: 'benri', meaning: 'Convenient' },
      { id: 'l38_10', japanese: 'ふべん', romaji: 'fuben', meaning: 'Inconvenient' },
    ]
  },
  level39: {
    title: 'N5 Grammar Keywords 1',
    description: 'Important words used for N5 grammar structures.',
    items: [
      { id: 'l39_1', japanese: 'から', romaji: 'kara', meaning: 'Because / From' },
      { id: 'l39_2', japanese: 'まで', romaji: 'made', meaning: 'Until / To' },
      { id: 'l39_3', japanese: 'くらい', romaji: 'kurai', meaning: 'About / Approximately' },
      { id: 'l39_4', japanese: 'だけ', romaji: 'dake', meaning: 'Only / Just' },
      { id: 'l39_5', japanese: 'ごろ', romaji: 'goro', meaning: 'Around (time)' },
      { id: 'l39_6', japanese: 'もう', romaji: 'mou', meaning: 'Already / Anymore' },
      { id: 'l39_7', japanese: 'まだ', romaji: 'mada', meaning: 'Still / Not yet' },
      { id: 'l39_8', japanese: 'もっと', romaji: 'motto', meaning: 'More' },
      { id: 'l39_9', japanese: 'いちばん', romaji: 'ichiban', meaning: 'Number one / Most' },
      { id: 'l39_10', japanese: 'たぶん', romaji: 'tabun', meaning: 'Probably / Perhaps' },
    ]
  },
  level40: {
    title: 'N5 Grammar Keywords 2',
    description: 'More important structural N5 words.',
    items: [
      { id: 'l40_1', japanese: 'まえに', romaji: 'mae ni', meaning: 'Before...' },
      { id: 'l40_2', japanese: 'あとに', romaji: 'ato ni', meaning: 'After...' },
      { id: 'l40_3', japanese: 'とき', romaji: 'toki', meaning: 'When...' },
      { id: 'l40_4', japanese: 'ながら', romaji: 'nagara', meaning: 'While...' },
      { id: 'l40_5', japanese: 'つもり', romaji: 'tsumori', meaning: 'Intention to...' },
      { id: 'l40_6', japanese: 'たい', romaji: 'tai', meaning: 'Want to (verb)...' },
      { id: 'l40_7', japanese: 'ほしい', romaji: 'hoshii', meaning: 'Want (noun)' },
      { id: 'l40_8', japanese: 'たり', romaji: 'tari', meaning: 'Do such things as...' },
      { id: 'l40_9', japanese: 'ことが あります', romaji: 'koto ga arimasu', meaning: 'Have the experience of...' },
      { id: 'l40_10', japanese: 'ほうが いい', romaji: 'hou ga ii', meaning: 'It is better to...' },
    ]
  },
  level41: {
    title: 'Months of the Year',
    description: 'Learn how to say the 12 months.',
    items: [
      { id: 'l41_1', japanese: 'いちがつ', romaji: 'ichigatsu', meaning: 'January' },
      { id: 'l41_2', japanese: 'にがつ', romaji: 'nigatsu', meaning: 'February' },
      { id: 'l41_3', japanese: 'さんがつ', romaji: 'sangatsu', meaning: 'March' },
      { id: 'l41_4', japanese: 'しがつ', romaji: 'shigatsu', meaning: 'April' },
      { id: 'l41_5', japanese: 'ごがつ', romaji: 'gogatsu', meaning: 'May' },
      { id: 'l41_6', japanese: 'ろくがつ', romaji: 'rokugatsu', meaning: 'June' },
      { id: 'l41_7', japanese: 'しちがつ', romaji: 'shichigatsu', meaning: 'July' },
      { id: 'l41_8', japanese: 'はちがつ', romaji: 'hachigatsu', meaning: 'August' },
      { id: 'l41_9', japanese: 'くがつ', romaji: 'kugatsu', meaning: 'September' },
      { id: 'l41_10', japanese: 'じゅうがつ', romaji: 'juugatsu', meaning: 'October' },
    ]
  },
  level42: {
    title: 'Dates of the Month (1-10)',
    description: 'Special irregular readings for dates 1st to 10th.',
    items: [
      { id: 'l42_1', japanese: 'ついたち', romaji: 'tsuitachi', meaning: '1st day of the month' },
      { id: 'l42_2', japanese: 'ふつか', romaji: 'futsuka', meaning: '2nd day of the month' },
      { id: 'l42_3', japanese: 'みっか', romaji: 'mikka', meaning: '3rd day of the month' },
      { id: 'l42_4', japanese: 'よっか', romaji: 'yokka', meaning: '4th day of the month' },
      { id: 'l42_5', japanese: 'いつか', romaji: 'itsuka', meaning: '5th day of the month' },
      { id: 'l42_6', japanese: 'むいか', romaji: 'muika', meaning: '6th day of the month' },
      { id: 'l42_7', japanese: 'なのか', romaji: 'nanoka', meaning: '7th day of the month' },
      { id: 'l42_8', japanese: 'ようか', romaji: 'youka', meaning: '8th day of the month' },
      { id: 'l42_9', japanese: 'ここのか', romaji: 'kokonoka', meaning: '9th day of the month' },
      { id: 'l42_10', japanese: 'とおか', romaji: 'tooka', meaning: '10th day of the month' },
    ]
  },
  level43: {
    title: 'Dates of the Month (Irregular)',
    description: 'Other special irregular readings for dates.',
    items: [
      { id: 'l43_1', japanese: 'じゅうよっか', romaji: 'juuyokka', meaning: '14th day' },
      { id: 'l43_2', japanese: 'はつか', romaji: 'hatsuka', meaning: '20th day' },
      { id: 'l43_3', japanese: 'にじゅうよっか', romaji: 'nijuuyokka', meaning: '24th day' },
      { id: 'l43_4', japanese: 'いちにち', romaji: 'ichinichi', meaning: 'One day (duration)' },
      { id: 'l43_5', japanese: 'なんにち', romaji: 'nannichi', meaning: 'What day of the month? / How many days?' },
      { id: 'l43_6', japanese: 'いっしゅうかん', romaji: 'isshuukan', meaning: 'One week' },
      { id: 'l43_7', japanese: 'いっかげつ', romaji: 'ikkagetsu', meaning: 'One month' },
      { id: 'l43_8', japanese: 'いちねん', romaji: 'ichinen', meaning: 'One year' },
      { id: 'l43_9', japanese: 'はん', romaji: 'han', meaning: 'Half (e.g. 1:30)' },
      { id: 'l43_10', japanese: 'たんじょうび', romaji: 'tanjoubi', meaning: 'Birthday' },
    ]
  },
  level44: {
    title: 'Travel & Vacation',
    description: 'Words related to trips and hobbies.',
    items: [
      { id: 'l44_1', japanese: 'りょこう', romaji: 'ryokou', meaning: 'Travel / Trip' },
      { id: 'l44_2', japanese: 'おんせん', romaji: 'onsen', meaning: 'Hot spring' },
      { id: 'l44_3', japanese: 'ホテル', romaji: 'hoteru', meaning: 'Hotel' },
      { id: 'l44_4', japanese: 'きっぷ', romaji: 'kippu', meaning: 'Ticket' },
      { id: 'l44_5', japanese: 'ちず', romaji: 'chizu', meaning: 'Map' },
      { id: 'l44_6', japanese: 'カメラ', romaji: 'kamera', meaning: 'Camera' },
      { id: 'l44_7', japanese: 'にもつ', romaji: 'nimotsu', meaning: 'Luggage / Baggage' },
      { id: 'l44_8', japanese: 'おみやげ', romaji: 'omiyage', meaning: 'Souvenir' },
      { id: 'l44_9', japanese: 'パスポート', romaji: 'pasupooto', meaning: 'Passport' },
      { id: 'l44_10', japanese: 'やすみ', romaji: 'yasumi', meaning: 'Holiday / Vacation / Rest' },
    ]
  },
  level45: {
    title: 'Hobbies & Sports',
    description: 'Things to do in your free time.',
    items: [
      { id: 'l45_1', japanese: 'しゅみ', romaji: 'shumi', meaning: 'Hobby' },
      { id: 'l45_2', japanese: 'おんがく', romaji: 'ongaku', meaning: 'Music' },
      { id: 'l45_3', japanese: 'うた', romaji: 'uta', meaning: 'Song' },
      { id: 'l45_4', japanese: 'えいが', romaji: 'eiga', meaning: 'Movie' },
      { id: 'l45_5', japanese: 'スポーツ', romaji: 'supootsu', meaning: 'Sports' },
      { id: 'l45_6', japanese: 'サッカー', romaji: 'sakkaa', meaning: 'Soccer' },
      { id: 'l45_7', japanese: 'テニス', romaji: 'tenisu', meaning: 'Tennis' },
      { id: 'l45_8', japanese: 'プール', romaji: 'puuru', meaning: 'Pool' },
      { id: 'l45_9', japanese: 'ギター', romaji: 'gitaa', meaning: 'Guitar' },
      { id: 'l45_10', japanese: 'え', romaji: 'e', meaning: 'Picture / Painting' },
    ]
  },
  level46: {
    title: 'Classroom Vocabulary',
    description: 'Things you hear and see in a classroom.',
    items: [
      { id: 'l46_1', japanese: 'きょうしつ', romaji: 'kyoushitsu', meaning: 'Classroom' },
      { id: 'l46_2', japanese: 'じゅぎょう', romaji: 'jugyou', meaning: 'Class / Lesson' },
      { id: 'l46_3', japanese: 'テスト', romaji: 'tesuto', meaning: 'Test' },
      { id: 'l46_4', japanese: 'しゅくだい', romaji: 'shukudai', meaning: 'Homework' },
      { id: 'l46_5', japanese: 'こくばん', romaji: 'kokuban', meaning: 'Blackboard' },
      { id: 'l46_6', japanese: 'しつもん', romaji: 'shitsumon', meaning: 'Question' },
      { id: 'l46_7', japanese: 'こたえ', romaji: 'kotae', meaning: 'Answer' },
      { id: 'l46_8', japanese: 'ページ', romaji: 'peeji', meaning: 'Page' },
      { id: 'l46_9', japanese: 'もんだい', romaji: 'mondai', meaning: 'Problem / Question' },
      { id: 'l46_10', japanese: 'れい', romaji: 'rei', meaning: 'Example' },
    ]
  },
  level47: {
    title: 'Sickness & Health',
    description: 'Vocabulary for when you are unwell.',
    items: [
      { id: 'l47_1', japanese: 'びょうき', romaji: 'byouki', meaning: 'Illness / Sickness' },
      { id: 'l47_2', japanese: 'かぜ', romaji: 'kaze', meaning: 'Cold (illness)' },
      { id: 'l47_3', japanese: 'ねつ', romaji: 'netsu', meaning: 'Fever' },
      { id: 'l47_4', japanese: 'くすり', romaji: 'kusuri', meaning: 'Medicine' },
      { id: 'l47_5', japanese: 'いたい', romaji: 'itai', meaning: 'Painful / Hurt' },
      { id: 'l47_6', japanese: 'びょういん', romaji: 'byouin', meaning: 'Hospital' },
      { id: 'l47_7', japanese: 'いしゃ', romaji: 'isha', meaning: 'Medical Doctor' },
      { id: 'l47_8', japanese: 'だるい', romaji: 'darui', meaning: 'Sluggish / Heavy feeling' },
      { id: 'l47_9', japanese: 'なおる', romaji: 'naoru', meaning: 'To get well / be cured' },
      { id: 'l47_10', japanese: 'やすむ', romaji: 'yasumu', meaning: 'To rest / take a day off' },
    ]
  },
  level48: {
    title: 'Shopping & Money',
    description: 'Important words for buying things.',
    items: [
      { id: 'l48_1', japanese: 'かいもの', romaji: 'kaimono', meaning: 'Shopping' },
      { id: 'l48_2', japanese: 'おかね', romaji: 'okane', meaning: 'Money' },
      { id: 'l48_3', japanese: 'おつり', romaji: 'otsuri', meaning: 'Change (money)' },
      { id: 'l48_4', japanese: 'さいふ', romaji: 'saifu', meaning: 'Wallet' },
      { id: 'l48_5', japanese: 'レジ', romaji: 'reji', meaning: 'Cash register' },
      { id: 'l48_6', japanese: 'いくら', romaji: 'ikura', meaning: 'How much' },
      { id: 'l48_7', japanese: 'カード', romaji: 'kaado', meaning: 'Credit card' },
      { id: 'l48_8', japanese: 'えん', romaji: 'en', meaning: 'Yen' },
      { id: 'l48_9', japanese: 'たかい', romaji: 'takai', meaning: 'Expensive' },
      { id: 'l48_10', japanese: 'やすい', romaji: 'yasui', meaning: 'Cheap' },
    ]
  },
  level49: {
    title: 'Colors & Description',
    description: 'Describing the color and type of things.',
    items: [
      { id: 'l49_1', japanese: 'あかい', romaji: 'akai', meaning: 'Red (adjective)' },
      { id: 'l49_2', japanese: 'あおい', romaji: 'aoi', meaning: 'Blue (adjective)' },
      { id: 'l49_3', japanese: 'しろい', romaji: 'shiroi', meaning: 'White (adjective)' },
      { id: 'l49_4', japanese: 'くろい', romaji: 'kuroi', meaning: 'Black (adjective)' },
      { id: 'l49_5', japanese: 'きいろい', romaji: 'kiiroi', meaning: 'Yellow (adjective)' },
      { id: 'l49_6', japanese: 'ちゃいろい', romaji: 'chairoi', meaning: 'Brown (adjective)' },
      { id: 'l49_7', japanese: 'まるい', romaji: 'marui', meaning: 'Round' },
      { id: 'l49_8', japanese: 'しかくい', romaji: 'shikakui', meaning: 'Square' },
      { id: 'l49_9', japanese: 'あたらしい', romaji: 'atarashii', meaning: 'New' },
      { id: 'l49_10', japanese: 'ふるい', romaji: 'furui', meaning: 'Old (thing)' },
    ]
  },
  level50: {
    title: 'Greetings & Farewell (Review)',
    description: 'Final essential phrases to wrap up N5 basics.',
    items: [
      { id: 'l50_1', japanese: 'おやすみなさい', romaji: 'oyasuminasai', meaning: 'Good night' },
      { id: 'l50_2', japanese: 'いってきます', romaji: 'ittekimasu', meaning: 'I’m leaving' },
      { id: 'l50_3', japanese: 'いってらっしゃい', romaji: 'itterasshai', meaning: 'Have a good trip (to someone leaving)' },
      { id: 'l50_4', japanese: 'ただいま', romaji: 'tadaima', meaning: 'I’m home' },
      { id: 'l50_5', japanese: 'おかえりなさい', romaji: 'okaerinasai', meaning: 'Welcome back' },
      { id: 'l50_6', japanese: 'いただきます', romaji: 'itadakimasu', meaning: 'Let’s eat' },
      { id: 'l50_7', japanese: 'ごちそうさまでした', romaji: 'gochisousamadeshita', meaning: 'Thank you for the meal' },
      { id: 'l50_8', japanese: 'おつかれさまでした', romaji: 'otsukaresamadeshita', meaning: 'Thank you for your hard work' },
      { id: 'l50_9', japanese: 'おさきにしつれいします', romaji: 'osakini shitsureishimasu', meaning: 'Pardon me for leaving before you' },
      { id: 'l50_10', japanese: 'きをつけて', romaji: 'ki o tsukete', meaning: 'Be careful / Take care' },
    ]
  }
}

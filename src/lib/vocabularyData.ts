export type VocabularyItem = {
  nihongo: string;
  romaji: string;
  uchharon: string;
  kanji: string;
  english: string;
  bangla: string;
};

export type Lesson = {
  lesson_number: number;
  vocabularies: VocabularyItem[];
};

export const VOCABULARY_DATA: { lessons: Lesson[] } = {
  "lessons": [
    {
      "lesson_number": 1,
      "vocabularies": [
        { "nihongo": "わたし", "romaji": "watashi", "uchharon": "ওয়াতাশি", "kanji": "私", "english": "I", "bangla": "আমি" },
        { "nihongo": "わたしたち", "romaji": "watashitachi", "uchharon": "ওয়াতাশিতাচি", "kanji": "私たち", "english": "We", "bangla": "আমরা" },
        { "nihongo": "わたしの", "romaji": "watashino", "uchharon": "ওয়াতাশিনো", "kanji": "私の", "english": "My", "bangla": "আমার" },
        { "nihongo": "あなた", "romaji": "anata", "uchharon": "আনাতা", "kanji": "あなた", "english": "You", "bangla": "তুমি" },
        { "nihongo": "あなたたち", "romaji": "anatatachi", "uchharon": "আনাতাতাচি", "kanji": "あなたたち", "english": "Yours", "bangla": "তোমরা" },
        { "nihongo": "あなたの", "romaji": "anatano", "uchharon": "আনাতানো", "kanji": "あなたの", "english": "Your", "bangla": "তোমার" },
        { "nihongo": "あのひと (あのかた)", "romaji": "anohito (anokata)", "uchharon": "আনোহিতো (আনোকাতা)", "kanji": "あの人、あの方", "english": "That Person, he, she", "bangla": "ঐ ব্যক্তি, সে, তিনি" },
        { "nihongo": "~さん", "romaji": "~san", "uchharon": "মিনাসান", "kanji": "皆さん", "english": "Ladies and Gentlemen, all of you", "bangla": "~সাহেব/মিস~ (ভদ্র ভাবে সম্মোদন করার সময় পুরুষ/মহিলা উভয়ের নামের শেষে বসে)" },
        { "nihongo": "~さま", "romaji": "~sama", "uchharon": "মিনাসামা", "kanji": "皆様", "english": "Ladies and Gentlemen, all of you", "bangla": "~সাহেব/মিস~ (আরো বেশি ভদ্র ভাবে সম্মোদন করার সময় পুরুষ/মহিলা উভয়ের নামের শেষে বসে)" },
        { "nihongo": "~ちゃん", "romaji": "~chan", "uchharon": "চান", "kanji": "", "english": "Suffix often added to a child's name instead of ~さん", "bangla": "কিশোর কিশোরীদের নামের পরে বসে" },
        { "nihongo": "~くん", "romaji": "~kun", "uchharon": "কুন", "kanji": "君", "english": "Suffix often added to a boy's name", "bangla": "০ থেকে ৮ বছর বয়সয়ের ছেলে বাচ্চাদের নামের পরে বসে" },
        { "nihongo": "~じん", "romaji": "~jin", "uchharon": "জিন", "kanji": "人", "english": "Suffix meaning \"a national of\"", "bangla": "নাগরিক (কোনো দেশের নাগরিক বুঝাতে ঐ দেশের নামের পরে বসে)" },
        { "nihongo": "せんせい", "romaji": "sensei", "uchharon": "সেনসেই", "kanji": "先生", "english": "Teacher, Instructor", "bangla": "শিক্ষক, পরিদর্শক (নিজের পেশার পরিচয় দেওয়ার ক্ষেত্রে বসবেনা)" },
        { "nihongo": "きょうし", "romaji": "kyoushi", "uchharon": "কিয়োউশি", "kanji": "教師", "english": "Teacher, Instructor", "bangla": "শিক্ষক (নিজের পেশার পরিচয় দেওয়ার ক্ষেত্রে বসবে)" },
        { "nihongo": "がくせい", "romaji": "gakusei", "uchharon": "গাকুসেই", "kanji": "学生", "english": "Student", "bangla": "ছাত্র/ছাত্রী" },
        { "nihongo": "かいしゃいん", "romaji": "kaishain", "uchharon": "কাইশাইন", "kanji": "会社員", "english": "Company employee", "bangla": "কোম্পানি কর্মচারী" },
        { "nihongo": "しゃいん", "romaji": "shain", "uchharon": "শাইন", "kanji": "社員", "english": "Employee", "bangla": "কর্মচারী" },
        { "nihongo": "ぎんこういん", "romaji": "ginkouin", "uchharon": "গিনকোউইন", "kanji": "銀行員", "english": "Bank employee", "bangla": "ব্যাংক কর্মচারী" },
        { "nihongo": "いしゃ", "romaji": "isha", "uchharon": "ইশা", "kanji": "医者", "english": "Medical doctor", "bangla": "ডাক্তার" },
        { "nihongo": "けんきゅうしゃ", "romaji": "kenkyuusha", "uchharon": "কেনকিউশা", "kanji": "研究者", "english": "Researcher, Scholar", "bangla": "গবেষক, পন্ডিত" },
        { "nihongo": "エンジニア", "romaji": "enjinia", "uchharon": "এনজিনিয়া", "kanji": "", "english": "Engineer", "bangla": "ইঞ্জিনিয়ার" },
        { "nihongo": "だいがく", "romaji": "daigaku", "uchharon": "দাইগাকু", "kanji": "大学", "english": "University", "bangla": "বিশ্ববিদ্যালয়" },
        { "nihongo": "びょういん", "romaji": "byouin", "uchharon": "বিয়ৌইন", "kanji": "病院", "english": "Hospital", "bangla": "হাসপাতাল" },
        { "nihongo": "でんき", "romaji": "denki", "uchharon": "দেনকি", "kanji": "電気", "english": "Electricity, Light", "bangla": "বিদ্যুৎ, লাইট" },
        { "nihongo": "だれ(どなた)", "romaji": "dare (donata)", "uchharon": "দারে (দোনাতা)", "kanji": "", "english": "Who", "bangla": "কে (どなた হচ্ছেだれ এর মার্জিত রূপ)" },
        { "nihongo": "~さい", "romaji": "~sai", "uchharon": "সাই", "kanji": "歳", "english": "~ years old", "bangla": "বয়স (বয়স বোঝাতে)" },
        { "nihongo": "なんさい (おいくつ)", "romaji": "nansai (oikutsu)", "uchharon": "নানসাই (ওইকুত্সু)", "kanji": "何歳", "english": "How old", "bangla": "কত বছর বয়স?" },
        { "nihongo": "はい。", "romaji": "hai", "uchharon": "হাই", "kanji": "", "english": "Yes", "bangla": "হ্যাঁ" },
        { "nihongo": "いいえ", "romaji": "iie", "uchharon": "ইইয়ে", "kanji": "", "english": "No", "bangla": "না" },
        { "nihongo": "しつれいですが", "romaji": "shitsurei desuga", "uchharon": "শিত্সু রেইদেসুগা", "kanji": "失礼ですが", "english": "Excuse me, but", "bangla": "দুঃখিত/মাফ করবেন" },
        { "nihongo": "はじめまして", "romaji": "hajimemashite", "uchharon": "হাজিমেমাশিতে", "kanji": "初めまして", "english": "How do you do", "bangla": "আপনার সাথে দেখা করে ভালো লাগলো" },
        { "nihongo": "どうぞよろしくおねがいします", "romaji": "douzo yoroshiku onegaishimasu", "uchharon": "দৌযো ইয়োরোশিকু ওনেগাইশিমাস", "kanji": "どうぞよろしくお願いします", "english": "Pleased to meet you", "bangla": "আপনার সাথে পরিচিত হয়ে খুশি হলাম" },
        { "nihongo": "こちらは〜さんです", "romaji": "kochira wa ~ san desu", "uchharon": "কোচিরা ওয়া ~ সান দেস", "kanji": "", "english": "This is Mr./Mrs. ~", "bangla": "এই হলো জনাব/জনাবা~" },
        { "nihongo": "~からきました", "romaji": "~ kara kimashita", "uchharon": "কারা কিমাশিতা", "kanji": "~から来ました", "english": "I came from ~.", "bangla": "আমি এসেছি" },
        { "nihongo": "アメリカ", "romaji": "amerika", "uchharon": "আমেরিকা", "kanji": "", "english": "America, U.S.A.", "bangla": "আমেরিকা" },
        { "nihongo": "イギリス", "romaji": "igirisu", "uchharon": "ইগিরিসু", "kanji": "", "english": "U.K.", "bangla": "যুক্তরাজ্য" },
        { "nihongo": "インド", "romaji": "indo", "uchharon": "ইন্দো", "kanji": "", "english": "India", "bangla": "ইন্ডিয়া" },
        { "nihongo": "インドネシア", "romaji": "indoneshia", "uchharon": "ইন্দোনেশিয়া", "kanji": "", "english": "Indonesia", "bangla": "ইন্দোনেশিয়া" },
        { "nihongo": "かんこく", "romaji": "kankoku", "uchharon": "কানকোকু", "kanji": "韓国", "english": "South Korea", "bangla": "দক্ষিণ কোরিয়া" },
        { "nihongo": "タイ", "romaji": "tai", "uchharon": "তাই", "kanji": "", "english": "Thailand", "bangla": "থাইল্যান্ড" },
        { "nihongo": "ちゅうごく", "romaji": "chuugoku", "uchharon": "চৌগোকু", "kanji": "中国", "english": "China", "bangla": "চীন" },
        { "nihongo": "ドイツ", "romaji": "doitsu", "uchharon": "দোইৎসু", "kanji": "", "english": "Germany", "bangla": "জার্মানি" },
        { "nihongo": "にほん", "romaji": "nihon", "uchharon": "নিহোন", "kanji": "日本", "english": "Japan", "bangla": "জাপান" },
        { "nihongo": "フランス", "romaji": "furansu", "uchharon": "ফুরানসু", "kanji": "", "english": "France", "bangla": "ফ্রান্স" },
        { "nihongo": "ブラジル", "romaji": "burajiru", "uchharon": "বুরাজিরু", "kanji": "", "english": "Brazil", "bangla": "ব্রাজিল" }
      ]
    },
    {
      "lesson_number": 2,
      "vocabularies": [
        { "nihongo": "これ", "romaji": "kore", "uchharon": "কোরে", "kanji": "", "english": "This", "bangla": "এটা" },
        { "nihongo": "それ", "romaji": "sore", "uchharon": "সোরে", "kanji": "", "english": "That", "bangla": "সেটা" },
        { "nihongo": "あれ", "romaji": "are", "uchharon": "আরে", "kanji": "", "english": "That over there", "bangla": "ঐটা" },
        { "nihongo": "この~", "romaji": "kono ~", "uchharon": "কোনো~", "kanji": "", "english": "This ~", "bangla": "এই~" },
        { "nihongo": "その~", "romaji": "sono ~", "uchharon": "সোনো~", "kanji": "", "english": "That ~", "bangla": "ওই~" },
        { "nihongo": "あの~", "romaji": "ano ~", "uchharon": "আনো~", "kanji": "", "english": "That ~ over there", "bangla": "ঐ~" },
        { "nihongo": "ほん", "romaji": "hon", "uchharon": "হোন", "kanji": "本", "english": "Book", "bangla": "বই" },
        { "nihongo": "じしょ", "romaji": "jisho", "uchharon": "জিশো", "kanji": "辞書", "english": "Dictionary", "bangla": "অভিধান" },
        { "nihongo": "ざっし", "romaji": "zasshi", "uchharon": "জাৎশি", "kanji": "雑誌", "english": "Magazine", "bangla": "ম্যাগাজিন" },
        { "nihongo": "しんぶん", "romaji": "shinbun", "uchharon": "শিনবুন", "kanji": "新聞", "english": "Newspaper", "bangla": "পত্রিকা" },
        { "nihongo": "ノート", "romaji": "nooto", "uchharon": "নোতো", "kanji": "", "english": "Notebook", "bangla": "নোটবুক / খাতা" },
        { "nihongo": "てちょう", "romaji": "techou", "uchharon": "তেচৌ", "kanji": "手帳", "english": "Pocket notebook", "bangla": "পকেট নোটবুক / খাতা" },
        { "nihongo": "めいし", "romaji": "meishi", "uchharon": "মেইশি", "kanji": "名詞", "english": "Business card", "bangla": "বিজনেস কার্ড" },
        { "nihongo": "カード", "romaji": "kaado", "uchharon": "কাদো", "kanji": "", "english": "Card", "bangla": "কার্ড" },
        { "nihongo": "テレホンカード", "romaji": "terehonkaado", "uchharon": "তেরেহোনকাদো", "kanji": "", "english": "Telephone card", "bangla": "টেলিফোন কার্ড" },
        { "nihongo": "えんぴつ", "romaji": "enpitsu", "uchharon": "এনপিৎসু", "kanji": "鉛筆", "english": "Pencil", "bangla": "পেন্সিল" },
        { "nihongo": "ボールペン", "romaji": "boorupen", "uchharon": "বোরুপেন", "kanji": "", "english": "Ballpoint pen", "bangla": "বলপয়েন্ট কলম" },
        { "nihongo": "シャープペンシル", "romaji": "shaapupenshiru", "uchharon": "শাপুপেনশিরু", "kanji": "", "english": "Mechanical pencil", "bangla": "যান্ত্রিক পেন্সিল" },
        { "nihongo": "かぎ", "romaji": "kagi", "uchharon": "কাগি", "kanji": "かぎ", "english": "Key", "bangla": "চাবি" },
        { "nihongo": "とけい", "romaji": "tokei", "uchharon": "তোকেই", "kanji": "時計", "english": "Watch, clock", "bangla": "ঘড়ি" },
        { "nihongo": "かさ", "romaji": "kasa", "uchharon": "কাসা", "kanji": "傘", "english": "Umbrella", "bangla": "ছাতা" },
        { "nihongo": "かばん", "romaji": "kaban", "uchharon": "কাবান", "kanji": "", "english": "Bag, briefcase", "bangla": "ব্যাগ, ব্রিফকেস" },
        { "nihongo": "[カセット] テープ", "romaji": "[kasetto] teepu", "uchharon": "কাসেত্তো তেপু", "kanji": "", "english": "Cassette tape", "bangla": "ক্যাসেট টেপ" },
        { "nihongo": "テープレコーダー", "romaji": "teepurekooda", "uchharon": "তেপুরেকোদা", "kanji": "", "english": "Tape recorder", "bangla": "টেপ রেকোর্ডার" },
        { "nihongo": "テレビ", "romaji": "terebi", "uchharon": "তেরেবি", "kanji": "", "english": "Television", "bangla": "টেলিভিশন" },
        { "nihongo": "ラジオ", "romaji": "rajio", "uchharon": "রাজিও", "kanji": "", "english": "Radio", "bangla": "রেডিও" },
        { "nihongo": "カメラ", "romaji": "kamera", "uchharon": "কামেরা", "kanji": "", "english": "Camera", "bangla": "ক্যামেরা" },
        { "nihongo": "コンピューター", "romaji": "konpyuuta", "uchharon": "কোনপিউতা", "kanji": "", "english": "Computer", "bangla": "কম্পিউটার" },
        { "nihongo": "じどうしゃ", "romaji": "jidousha", "uchharon": "জিদৌশা", "kanji": "自動車", "english": "Car", "bangla": "গাড়ি" },
        { "nihongo": "つくえ", "romaji": "tsukue", "uchharon": "ৎসুকুয়ে", "kanji": "机", "english": "Desk", "bangla": "ডেস্ক" },
        { "nihongo": "いす", "romaji": "isu", "uchharon": "ইসু", "kanji": "", "english": "Chair", "bangla": "চেয়ার" },
        { "nihongo": "チョコレート", "romaji": "chokoreeto", "uchharon": "চোকোরেতো", "kanji": "", "english": "Chocolate", "bangla": "চকোলেট" },
        { "nihongo": "コーヒー", "romaji": "koohii", "uchharon": "কোহি", "kanji": "", "english": "Coffee", "bangla": "কফি" },
        { "nihongo": "えいご", "romaji": "eigo", "uchharon": "এইগো", "kanji": "英語", "english": "English language", "bangla": "ইংরেজি ভাষা" },
        { "nihongo": "にほんご", "romaji": "nihongo", "uchharon": "নিহোনগো", "kanji": "日本語", "english": "Japanese language", "bangla": "জাপানি ভাষা" },
        { "nihongo": "~ご", "romaji": "~go", "uchharon": "~ গো", "kanji": "~語", "english": "Language", "bangla": "~ভাষা" },
        { "nihongo": "なん", "romaji": "nan", "uchharon": "নান", "kanji": "何", "english": "What", "bangla": "কি, কী" },
        { "nihongo": "そう", "romaji": "sou", "uchharon": "সৌ", "kanji": "", "english": "So", "bangla": "তাই" },
        { "nihongo": "ちがいます", "romaji": "chigaimasu", "uchharon": "চিগাইমাসু", "kanji": "違います", "english": "No, it isn't.", "bangla": "না, তা নয়" }
      ]
    }
  ]
};

---
title: "PROMPT"
date: 2026-07-22
category: "CYBERSECURITY"
readTime: "25 MIN READ"
classification: "UNCLASSIFIED"
tags: ["KERNEL", "EXPLOIT", "WINDOWS", "HEVD"]
summary: "Step-by-step walkthrough of exploiting a stack buffer overflow in the HackSys Extreme Vulnerable Driver to achieve SYSTEM privileges."
---

## 🏯 ROLE

![background_xianxia](/images/bg_xianxia.jpg)

You are a team consisting of: **Product Designer + Creative Director + Front-end Engineer + Linguistics Expert + Certification Exam Expert**. Please design and build a language learning web app tentatively named **「LangLest」** (you can suggest a better name), where learning a foreign language is a journey of **cultivation / immortality seeking**.

## 🎯 OBJECTIVES

A platform to learn 7 languages, covering all skills, strictly adhering to exam standards, with an interface that feels like entering a **仙境 (xianxia fairyland) or 魔界 (demonic realm)**. Learners should feel like they are "leveling up their cultivation base," not just doing dry exercises.

| Language | Target Certification | Notes |
|---|---|---|
| English | IELTS (+ CEFR framework) | IPA, 4 skills |
| Chinese | HSK 1–9 | Pinyin, radicals, stroke order, Regular / Semi-cursive / Cursive / Seal / Clerical scripts |
| Japanese | JLPT N5–N1 | Hiragana, Katakana, Kanji, Furigana |
| Korean | TOPIK I–II | Hangul, honorifics |
| French | DELF / DALF (A1–C2) | Pronunciation, liaison, gender |
| Russian | TORFL / ТРКИ (A1–C2) | Cyrillic, cases, stress |
| Vietnamese | Competency Assessment (VNU-HCM / HN) | Exam preparation style, **not** for teaching foreigners, **no** 4 skills, focused on reading comprehension, grammar, vocabulary, language logic |

---

## 🧭 PAGE STRUCTURE AND NAVIGATION

**Navbar (fixed, frosted glass):** Logo | **Learn Knowledge** | **Exam Prep** | **Resources** | **Blog / Tips** | Select Language | Dark/Light Mode | Avatar & Cultivation Level

Pages:

1. **Landing page / Homepage** (has a Footer, **only this page has a footer**)
2. **Dashboard** (cultivation base, streak, daily quests, skill radar chart, review calendar)
3. **Learn Knowledge**
4. **Exam Prep**
5. **Resources**
6. **Blog / Tips**
7. Lesson and Exercise pages (full-screen, focused)
8. Profile, achievements, leaderboard, settings

---

## 🏔️ LANDING PAGE (scrolling storytelling)

Scrolling down takes you through different realms:

1. **Hero:** A misty immortal mountain scene (left half, bright tone) contrasting with a blood-moon demonic realm (right half, red-black tone). The user **chooses a path: Immortal Path (Tiên Đạo) or Demonic Path (Ma Đạo)** (changes theme and mascot). Large heading, "Enter the Sect" CTA.
2. **7 Sects:** 7 languages represented as 7 sects, each with a unique spirit beast and symbol.
3. **Cultivation Path:** Qi Condensation → Foundation Establishment → Golden Core → Nascent Soul → Soul Formation → Tribulation Transcendence → Ascension, mapped to exam levels (e.g., HSK 1–2 = Qi Condensation).
4. **Cultivation Methods (Learning Techniques):** Spaced repetition, shadowing, active recall... presented as "secret manuals / immortal arts".
5. **Exams as Heavenly Tribulations:** IELTS, HSK, JLPT, TOPIK, DELF, TORFL, Competency Assessment.
6. **Preview** of the dashboard and lesson interface.
7. **Student Testimonials**, **FAQ**, **Final CTA**.
8. **Footer** (only here): links, social media, copyright, Dong Son bronze drum patterns.

---

## 🎨 DESIGN SYSTEM

### Color Palette (USE ONLY 6 colors, soft/pastel or moderately bold)

Red (cinnabar), white (jade, clouds), green (emerald, bamboo), blue (azure sky, lake), yellow (gold, loess), black (ink).

- **Light mode is default**, dark mode is available.
- Smooth gradients between these colors, **glassmorphism** (frosted glass, glowing edges) for cards, modals, and navbars.
- Immortal Path leans towards white, blue, green, yellow. Demonic Path leans towards black, red, gold.

### Typography (do not use default fonts, must support Vietnamese)

Headings in a calligraphy/ancient style, body text modern and readable. Suggestions: *Be Vietnam Pro, Playfair Display, Cormorant, Noto Serif/Sans (SC, JP, KR), Ma Shan Zheng, Zhi Mang Xing, Cinzel Decorative, Philosopher, Yeseva One, Bellota*. Choose **2–3 fonts** and explain why.

### Unique Shapes (NO default rounded rectangles allowed)

- **Buttons:** lotus leaf, folding fan, seal stamp, talisman, rolling clouds, sword.
- **Cards:** scroll frame, stone stele, temple gate, lotus petal borders, ancient window frame.
- **Tags/Badges:** jade pendant, dragon scale, red seal, bodhi leaf, gourd.
- **Progress bars:** sword, spirit energy ribbon, bagua ring, halo ring.
- Use `clip-path`, SVG masks, border-image, patterned borders.

### Cultural Motifs

- **Vietnam:** Lac bird, Dong Son bronze drum, Ly dynasty dragon, water wave patterns, bodhi leaf, lotus, Son Tinh - Thuy Tinh, Lac Long Quan - Au Co.
- **Immortal Realm (Xianxia):** fairyland, Penglai, clouds, cranes, immortal peaches, magic arts, immortal artifacts (swords, whisks, pill furnaces, magic mirrors).
- **Demonic Realm:** demonic realm, blood moon, black lotus, dark magic, demonic artifacts (demonic swords, soul banners).
- **Buddhist / Taoist:** Bagua, Tai Chi, prayer beads, temple bells, Buddha statues, Dharma wheel.
- **Imagery:** prioritize SVGs and custom illustrations, or royalty-free images.

### Animation and Interaction

- **Dynamic Backgrounds:** drifting clouds, multi-layered distant mountains (parallax), spirit energy fireflies, falling petals, ash and embers (Demonic Path), mist.
- **Mouse Cursor:** changes based on the chosen Path (immortal sword, demonic flame) with a spirit energy trail and click effects (ripples, blooming lotus).
- **Microinteractions:** page transitions like unrolling a scroll, "breakthrough" effects when leveling up, optional sound effects (bells, zither, monochord), with a mute button.
- Respect `prefers-reduced-motion`.

---

## 📚 FEATURES BY SECTION

### 1. LEARN KNOWLEDGE

Learning path **Basic → Intermediate → Advanced**, for each language:

- Language history and origin, writing system, cultural characteristics.
- Pronunciation and alphabet, grammar, vocabulary, sentence patterns.
- Covers all **Listening, Speaking, Reading, Writing** skills (except Vietnamese).
- **Chinese:** radicals, animated stroke order, calligraphy styles (regular, semi-cursive, cursive, seal, clerical), traditional and simplified characters.
- **Japanese:** Kana, Kanji, Furigana. **Korean:** Hangul, particles. **Russian:** Cyrillic, 6 cases. **French:** gender, verb conjugations.
- Learning map designed as a **realm map** (like the Duolingo path but with mountains, islands, battlefields), each stage is a "secret realm".

### 2. EXAM PREP (categorized by cards: certification → skill → topic)

- **Vocabulary:** each word includes an image, meaning, phonetic transcription / IPA / Pinyin, audio, examples, idioms, synonyms, antonyms, collocations, compound words, advanced vocabulary, word families, mnemonic tips.
- **Flashcards** with **SRS (spaced repetition like Anki / SM-2)**, flip mode, typing mode, listening dictation.
- **Listening Practice:** dictation, fill in the blanks, listening in IELTS / HSK / JLPT / TOPIK formats, adjustable speed.
- **Speaking Practice:** voice recognition (Web Speech API), **shadowing**, pronunciation grading, sound wave comparison, IPA practice, spoken language, IELTS Speaking Part 1–2–3 simulation.
- **Reading Practice:** reading comprehension, cloze tests, True/False/Not Given, matching headings, in-text dictionary lookups.
- **Writing Practice:** writing tasks with rubrics, editing suggestions, handwriting practice (Kanji, Kana, Hangul strokes) on a canvas.
- **Mock Exams:** timed, graded, weakness analysis, band/level conversion.
- **Vietnamese - Competency Assessment:** reading comprehension, grammar, cloze tests, literature and language logic, mock exams following the VNU structure.

### 3. RESOURCES

Special cards (flip, hover glow) for: books, textbooks, links, YouTube videos, websites, podcasts, apps, tools. Filter by language, skill, level, type; can be saved and bookmarked. Named in the style of "Scripture Pavilion" (Tàng Kinh Các).

### 4. BLOG / TIPS

Articles, exam tips, learning experiences, strategies for each skill, material reviews. Includes tags, search, featured posts, reading time, table of contents; comfortable reading interface.

### 5. DASHBOARD & GAMIFICATION

- **Cultivation Level** (Qi Condensation → Ascension) corresponding to exam levels, EXP, "spirit stones" (currency), streak (continuous incense burning), daily/weekly quests.
- **4-skill radar chart**, certification progress, score prediction.
- Leaderboards, achievements / badges, "Heavenly Tribulation" (major mock exams to level up).
- Smart review reminders based on SRS.

---

## 🧠 APPLIED LEARNING METHODS

Spaced Repetition (SM-2), Active Recall, Shadowing, Comprehensible Input (i+1), Pomodoro, Interleaving, Dictation, Mnemonics and Memory Palace, Chunking / Collocation, Gamification, Immersion, Error Log, context-based learning. Each technique must have a clear display area in the product.

---

## ⚙️ TECHNICAL REQUIREMENTS

- Responsive (desktop, tablet, mobile), fast loading, accessible (contrast, keyboard, ARIA).
- Recommended stack: **React + Vite + TypeScript + Tailwind + Framer Motion** (or Next.js). Mock data in JSON format, progress saved locally first, backend can be expanded later.
- Clean folder structure, reusable components, design tokens for themes (Immortal/Demonic × Light/Dark).
- UI i18n in English (can be expanded).

## 🚫 RESTRICTIONS

- Do not use "AI slop" interfaces: generic purple-pink gradients, default rounded cards, excessive emoji icons, template layouts.
- Do not use default fonts or colors outside the 6 chosen ones.
- Do not use fake content (lorem ipsum); use real, professionally accurate mock data.
- Do not copy the exact interface or copyrighted content of reference sites, only **learn from their structure and experience**.

## 🌐 REFERENCE SITES (for UX, features, layout)

- https://academy.hackthebox.com and https://tryhackme.com/ (learning paths, modules, rooms, ranks)
- https://www.chineseskill.com/, https://www.duolingo.com/, https://www.superchinese.com/ (short lessons, gamification)
- https://youpass.vn/, https://parroto.app/, https://openquiz.ai/, https://tuhoc.dolenglish.vn/ (exam prep, grading, mock exams)

---

## 🗺️ IMPLEMENTATION PROCESS (do sequentially, wait for my confirmation after each step)

1. **Detailed Plan:** sitemap, user flow, feature list by priority (MVP → expansion), data model.
2. **Design System:** color palette, fonts, shape set (buttons/cards/tags), motifs, text-based moodboard, custom cursor and dynamic backgrounds.
3. **Project Skeleton + Landing page** (with footer).
4. **Navbar, Dashboard, Light/Dark and Immortal/Demonic toggles.**
5. **Learn Knowledge** (complete 1 sample language, e.g., Chinese).
6. **Exam Prep** (vocabulary, SRS flashcards, 4 skills, mock exams).
7. **Resources and Blog.**
8. **Scale to the remaining 6 languages + Vietnamese Competency Assessment.**
9. **Optimization, testing, animation and performance tuning.**

---

### Improvements over the original version

- Added **clear roles**, a **certification table by language** (added DELF/DALF for French, TORFL for Russian which were not mentioned in the original).
- Turned the "cultivation leveling" idea into a **cultivation level system tied to exam levels** and a choice of **Immortal Path / Demonic Path** that changes the entire theme.
- Specified "unique shapes" into a list of shapes for each component.
- Systematized **learning techniques** (SRS, shadowing...) and tied them to specific features.
- Added technical requirements, restrictions list, and a process with **confirmation checkpoints**.

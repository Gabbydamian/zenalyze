# 🚀 ClareAi Phase 1 MVP Roadmap (Updated)

> **Legend:**
>
> - [ ] = Not started
> - [x] = Complete
> - [~] = In progress
> - 🆕 = Newly added
> - ✳️ = Modified or expanded

---

## 1. Foundation & Setup

- [x] Initialize Next.js 14 PWA with App Router
- [x] Configure Tailwind CSS with theming (light, dark, pastel, pro)
- [x] Add Supabase client (auth, storage, db)
- [ ] Setup Supabase DB with tables:
  - [ ] users
  - [ ] entries
  - [ ] mood_logs
  - [ ] insights
  - [ ] patterns
  - [ ] categories
- [ ] ✳️ Environment config & Vercel deployment
  - [ ] 🆕 Setup staging + production projects
  - [ ] 🆕 Add feature flag for test users

---

## 2. User Authentication

- [x] Email/password signup & login
- [ ] Google OAuth integration
- [ ] Magic link login
- [x] Auth context + protected routes
- [ ] Basic profile screen (timezone, name, theme)

---

## 3. Text Journaling

- [ ] Distraction-free text editor
- [ ] Auto-save every 30s
- [ ] Character count & writing timer
- [ ] Entry tagging with categories
- [ ] Entry history (list, calendar view)
- [ ] 🆕 Streak tracking & daily reminder logic

---

## 4. Voice Journaling

- [ ] Record audio in-browser
- [ ] Show waveform animation during recording
- [ ] Save audio file to Supabase Storage
- [ ] Transcribe using Whisper (client API or server action)
- [ ] Display transcript in editor view

---

## 5. Mood Check-In

- [ ] 1–10 mood slider
- [ ] Emotion chip selector (from pastel image example)
- [ ] One-word day description input
- [ ] Store to mood_logs table
- [ ] Add daily emoji/mood calendar tracker

---

## 6. AI Processing Engine (Basic)

- [ ] Sentiment analysis (cardiffnlp/twitter-roberta-base-sentiment-latest)
- [ ] Emotion detection (j-hartmann/emotion-english-distilroberta-base)
- [ ] Category detection (facebook/bart-large-mnli)
- [ ] Summary extraction (facebook/bart-large-cnn)
- [ ] Embed entries (all-MiniLM-L6-v2)
- [ ] 🆕 `/process-entry` server action to trigger all AI inference
- [ ] 🆕 Store insights JSON to Supabase (linked to entry_id)
- [ ] 🆕 Cache AI results to reduce reprocessing

---

## 7. Dashboard & Insights

- [ ] Show today’s mood snapshot + emoji
- [ ] List recent journal entries
- [ ] 7-day mood line chart
- [ ] Category distribution pie chart
- [ ] Weekly summary card (avg mood, top emotion)
- [ ] Simple “insight card” suggestions
- [ ] 🆕 Reprocess entries weekly with updated AI models
- [ ] 🆕 Insight rating (“Accurate?” thumbs up/down)

---

## 8. Theme Support

- [~] Theme context hook (light, dark, pastel, pro)
- [~] ThemeSwitcher component in settings (toggle in header/landing implemented)
- [ ] Responsive Tailwind color usage with CSS variables
- [ ] Default based on system or user profile
- [ ] 🆕 Save theme preference in user profile

---

## 9. Data Management

- [ ] Edit/delete entries & check-ins
- [ ] Export data (JSON/CSV)
- [ ] Account deletion / GDPR delete
- [ ] Retain last 7 days for free users
- [ ] 🆕 View data usage (entries used this month)

---

## 10. Freemium Gatekeeping

- [ ] Free: 50 entries/month, 7-day data
- [ ] Premium flag in Supabase user metadata
- [ ] Restrict access to insights if over quota
- [ ] Stripe (or placeholder) for future billing
- [ ] 🆕 Prompt upgrade when nearing limits
- [ ] 🆕 Placeholder pricing modal

---

## 11. Analytics & Usage Tracking 🆕

- [ ] Integrate Vercel Analytics or Splitbee
- [ ] Track entry creation, mood check-in, theme switch
- [ ] Track conversion funnel: signup → first entry → dashboard → upgrade
- [ ] Log insight engagement events

---

## 🧪 Bonus (Optional)

- [ ] Entry tagging via emoji (😌💡🧠💤)
- [ ] Prompt-based journaling
- [ ] AI-written journal summary
- [ ] Mobile PWA install banner
- [ ] Anonymous feedback form
- [ ] 🆕 Onboarding goals selection (“track mood,” “prevent burnout”)
- [ ] 🆕 Typing animation in hero tagline

---

## 🗓️ Suggested Timeline

| Week | Milestone                                 |
| ---- | ----------------------------------------- |
| 1–2  | Project setup, Supabase DB, Auth, Themes  |
| 3–4  | Journaling + mood check-in                |
| 5–6  | Audio recording + transcription           |
| 7–8  | AI processing engine + Dashboard Insights |
| 9    | Freemium logic, data controls             |
| 10   | Polish, streaks, bug fixes, analytics     |
| 11   | Internal testing, feedback, AI rating UX  |
| 12   | Public beta launch                        |

---

> Update checkboxes as you build. This roadmap balances core functionality with UX polish and AI depth — perfect for a lean, lovable MVP.

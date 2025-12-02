# 🌸 Shuroku - Product Requirements Document (PRD)

### **Version 1**

**Author:** Aditya Sinha
**Tone:** Hybrid (Professional × Modern Startup)
**Goal:** Showcase PM-thinking, clarity, and product depth

---

# 1. 🌟 Product Overview

**Shuroku** (収録 - *to record, compile, collect*) is a modern anime library and progress‑tracking experience that brings three fragmented user actions into one seamless product:

1. **Search** anime across all platforms
2. **Track** watch progress in one place
3. **Discover** where to legally watch anime

Shuroku acts as a personal dashboard: fast search, curated library, detailed progress tracking, and verified free/paid sources - all wrapped in a clean, minimal interface.

> **Positioning:** Shuroku is *Notion for anime tracking* - structured, elegant, and user‑owned.

---

# 2. 🎯 Goals & Guardrails

## **2.1 Primary Goals**

* Deliver **instant, reliable anime search** with rich metadata.
* Provide **one unified library** with customizable collections.
* Enable frictionless **episode/season progress tracking**.
* Display **legal, verified sources** for every anime.
* Allow **user-generated sources** (safely flagged & sandboxed).
* Maintain a **fast, aesthetic, mobile-first UI**.

## **2.2 Non-Goals (Intentional Boundaries)**

* Hosting or mirroring copyrighted content
* Becoming a social network
* Implementing ML-based recommendations (MVP)
* Competing with full-scale streaming platforms

---

# 3. 👤 Target Users & Personas

## **Persona A: The Casual Watcher**

* Watches 1–2 shows casually
* Often forgets the last episode
* Wants effortless progress tracking

## **Persona B: The Binge Watcher**

* Actively watching multiple series
* Searches a lot, adds a lot
* Needs instant metadata + source routing

## **Persona C: The Curator / Collector**

* Creates themed lists
* Loves organization and categorization
* Wants polished UI + structured collections

---

# 4. 🧩 Problem Statement

Anime consumption is split across:

* Multiple streaming platforms (licensing fragmentation)
* Multiple tracking platforms (MAL/AniList)
* Manual progress tracking (notes/apps)
* Countless unofficial sites (varying quality)

Users lack **one place** to:

* Maintain a personal library
* Track exactly where they left off
* Discover watch sources instantly
* Organize shows beautifully

Shuroku solves this by integrating **search → library → progress → sources** into one unified experience.

---

# 5. 🛠 Feature Requirements

## **5.1 Search**

**Must-Have:**

* Meilisearch-powered typeahead
* Fuzzy matching, popularity ranking
* Anime tile: poster, title, year

## **5.2 Library & Collections**

**Must-Have:**

* Add/remove anime
* Status (Watching / Completed / Plan to Watch / Paused)
* Create, rename collections

**Nice-to-Have:**

* Drag‑and‑drop ordering
* Colored collection labels

## **5.3 Watch Progress**

* Episode/season selector
* Quick "+1 episode" button
* Auto-sync

## **5.4 Sources (Free/Paid)**

* Verified list of official platforms
* Free embedded players (CORS safe)
* User-added free sources (flagged)

## **5.5 Account & Auth**

* Email + password
* OAuth (Google, GitHub)

## **5.6 Export / Backup**

* JSON export of full library
* One-click import

---

# 6. 🔧 Functional Requirements (MVP)

### **Search Flow**

* User types query → Meilisearch returns results within 50–150ms
* If anime missing → Fetch from AniList → Insert into DB → Background index

### **Library Flow**

* User adds anime → Optimistic UI → DB write
* Status/progress stored per user per anime

### **Source Flow**

* Paid providers open via deep-link
* Free sources: embed if allowed, else open new tab
* User-added sources flagged as unverified

---

# 7. 📈 Success Metrics

## **Product Metrics**

* **TTFA (Time to First Add):** < 30s
* **% Users with 3+ anime in library:** > 60%
* **Progress updates per active user per week:** > 4

## **Performance Metrics**

* Search latency < 200ms
* Uptime > 99%
* Index freshness < 12 hours

## **Engagement Metrics**

* DAU/MAU target: > 25%
* Collection feature usage: > 40%

---

# 8. 🔍 Competitive Landscape

| Platform                      | Strengths                     | Weaknesses                         |
| ----------------------------- | ----------------------------- | ---------------------------------- |
| **MyAnimeList**               | Huge community                | Slow UI, no streaming integrations |
| **AniList**                   | Modern UI                     | No unified watch sources           |
| **Crunchyroll/Netflix lists** | Native tracking               | Locked to one platform             |
| **Trakt.tv**                  | Cross-platform media tracking | Not anime-focused, no source data  |

### **Shuroku Advantage**

**Only platform combining:**

* Universal search
* Personal library
* Episode-level progress
* Verified free/paid watch sources
* User-addable source system

---

# 9. ⚠️ Risks & Mitigations

### **1. Copyright Concerns**

**Risk:** Users may add suspicious/free sources.
**Mitigation:** Flag as “User-added / Unverified” + no hosting.

### **2. External API Dependence**

**Risk:** AniList/Jikan downtime affects metadata.
**Mitigation:** Cache + fallbacks + retry queues.

### **3. CORS Blocking for Embeds**

**Mitigation:** Safe embedding only; fallback to new tab.

### **4. Metadata Variability**

**Mitigation:** Normalize titles/seasons via AniList.

---

# 10. 🚀 Future Enhancements

## **Near-Term (v1.1)**

* Tag-based recommendations
* Recently watched module
* Episode reminder notifications

## **Mid-Term (v1.2)**

* Social sharing (public collections)
* Profile pages
* Activity feed

## **Long-Term (v2.0+)**

* Mobile app (React Native)
* Offline-first PWA
* Deep analytics (episode heatmaps)

---

# 📌 End of Document

**Shuroku PRD - Version 1**

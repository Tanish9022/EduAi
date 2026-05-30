# UI Reference — EduAI Assist Landing Page

This document captures the visual design from the reference screenshots for the AI to replicate accurately.

---

## Global Layout

- White navbar, full width, minimal
- Light gray (`#F3F4F6` / `bg-gray-100`) page background
- White cards with rounded corners (`rounded-2xl`) and soft shadows (`shadow-sm`)
- Font: System sans-serif, bold headings, regular body
- Max content width: ~1024px, centered

---

## Navbar

- Left: Logo text "EduAI Assist" (bold, ~18px) + subtitle "AI Admission Assistant SaaS" (gray, small)
- Right: Two buttons
  - "Login" — outlined, rounded pill, light background
  - "Get Started" — solid black, rounded pill, white text
- Background: White, bottom border or subtle shadow

---

## Hero Section

Layout: Two-column (left text, right dashboard card)

### Left Column
- Large bold heading (3 lines):
  ```
  AI Powered
  Admission Assistant
  for Colleges
  ```
  Font size: ~48px, font-weight: 800, color: near-black `#0F172A`

- Subtext (gray, ~16px):
  ```
  Automate admission queries using AI chatbots integrated
  with WhatsApp, websites, and student portals.
  ```

- Two CTA buttons (side by side):
  - "Start Free Demo" — solid black, white text, rounded-lg, px-6 py-3
  - "Watch Demo" — outlined black border, black text, rounded-lg, px-6 py-3

### Right Column — Dashboard Preview Card
White card, rounded-2xl, shadow-md, padding ~24px

- Header row:
  - Left: "Admission Dashboard" (bold) + "Realtime analytics" (gray, small)
  - Right: "AI Active" badge — green background (`#D1FAE5`), green text (`#065F46`), rounded-full, small

- Stats grid (2x2):
  | Label | Value |
  |---|---|
  | Total Queries | **12,480** |
  | Response Time | **1.2s** |
  | Students Helped | **8,300** |
  | WhatsApp Chats | **4,900** |

  Each stat in its own white rounded card (`bg-gray-50`), label in small gray text, value in bold ~24px

- Chat Preview section (below stats):
  - Label: "AI Chat Preview" (bold, small)
  - Student bubble: light gray background, rounded, left-aligned
    - Text: "What is the BCA admission fee?"
  - AI reply bubble: solid black background, white text, rounded, right-aligned
    - Text: "The BCA admission fee is ₹48,000 per year."

---

## Features Section

- Section background: Light gray (`bg-gray-100`)
- Cards in a 3-column grid, white background, rounded-2xl, shadow-sm, padding ~24px

### Feature Cards (visible in screenshot)

Each card:
- Black square icon block at top (rounded-xl, ~48x48px, solid black)
- Bold title (~18px)
- Gray description text (~14px)

Cards shown:
1. **Document AI** — "Upload PDFs and let AI understand admission data."
2. **24/7 Support** — "Students receive instant responses anytime."
3. **Multi-language** — "Support multiple languages for wider accessibility."

---

## Pricing Section

- Section background: Light gray
- Centered heading: **"Pricing Plans"** (bold, ~36px)
- Subtext: "Flexible SaaS pricing for institutions." (gray, centered)

### Pricing Cards (3-column grid)

White cards, rounded-2xl, shadow-sm, padding ~24px

| Plan | Price |
|---|---|
| **Basic** | ₹5k/month |
| **Standard** | ₹12k/month |
| **Premium** | ₹25k/month |

- Plan name: bold, ~20px
- Price: bold, ~28px, color near-black

---

## Design Tokens

```
Background:       #F3F4F6  (gray-100)
Card background:  #FFFFFF
Stat card bg:     #F9FAFB  (gray-50)
Primary text:     #0F172A  (slate-900)
Secondary text:   #6B7280  (gray-500)
Button primary:   #000000 bg, #FFFFFF text
Button outline:   #000000 border, #000000 text
AI Active badge:  #D1FAE5 bg, #065F46 text
Chat user bubble: #F3F4F6
Chat AI bubble:   #000000 bg, #FFFFFF text
Border radius:    rounded-2xl (cards), rounded-full (badges/pills)
Shadow:           shadow-sm to shadow-md
```

---

## Component Checklist for Implementation

- [ ] Navbar with logo + Login + Get Started buttons
- [ ] Hero two-column layout
- [ ] Dashboard preview card with stats grid + chat bubbles
- [ ] Features section with icon cards
- [ ] Pricing section with 3 plan cards
- [ ] Responsive: stack columns on mobile

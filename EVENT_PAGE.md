# Event Page Implementation

## Overview
Mobile-first Event screen dengan navigasi yang berfungsi dan UI/UX yang ditingkatkan.

## Perbaikan yang Dilakukan

### 1. Navigasi Fungsional
- ✅ Bottom navigation sekarang menggunakan Next.js Link
- ✅ Klik tombol Event akan membuka halaman `/event`
- ✅ Semua route (Home, Event, Record, Market, Profil) sudah dibuat
- ✅ Active state highlight pada tab yang sedang aktif

### 2. UI/UX Improvements

#### Event Card
- **Visual lebih menarik**: Gradient background dengan pattern
- **Tier badge lebih prominent**: Badge dengan shadow dan backdrop blur
- **Lock overlay lebih jelas**: Blur effect + icon lock besar di tengah
- **Icon dengan background**: Calendar dan MapPin dengan colored background
- **Button lebih engaging**: Gradient button dengan hover effect
- **Participant avatars**: Gradient colorful avatars
- **Better spacing**: Padding dan spacing yang lebih breathable

#### Search Bar
- **Rounded corners**: Dari rounded-full ke rounded-2xl (lebih modern)
- **Filter button**: Tambahan button filter di sebelah search
- **Better focus state**: Border dan shadow saat focus
- **Larger touch target**: Padding lebih besar untuk mobile

#### Event List
- **User Rank Badge**: Card gradient menampilkan rank user saat ini
- **Grouped by availability**: 
  - "Available for You" - event yang bisa diikuti
  - "Unlock with Higher Rank" - event yang terkunci
- **More events**: Ditambah 2 event lagi (total 4 events)

#### Header
- **Subtitle**: Tambahan deskripsi "Discover running challenges"
- **Icon decoration**: Sparkles icon dengan gradient background
- **Better hierarchy**: Title lebih bold

## User Rank System
- **Current User Rank**: Silver
- **Rank Order**: Bronze → Silver → Gold → Platinum → Elite

## Event Status

### Available Events (Unlocked)
1. **Summer Marathon** - 9 KM (Requires: Bronze) ✅
2. **Night Run Challenge** - 5 KM (Requires: Bronze) ✅

### Locked Events
1. **PACE+ athletic skincare** - Elite Tier (Requires: Platinum) 🔒
2. **Mountain Trail Run** - Elite Tier (Requires: Gold) 🔒

## Design Improvements

### Colors & Gradients
- Gradient backgrounds untuk visual appeal
- Colored icon backgrounds (blue, green, etc.)
- Gradient buttons untuk CTA
- Gradient avatars untuk participants

### Shadows & Depth
- Soft shadows pada cards
- Shadow pada buttons
- Backdrop blur pada badges
- Lock overlay dengan blur effect

### Typography
- Bold titles untuk hierarchy
- Medium weight untuk body text
- Proper text sizing untuk mobile

### Spacing
- Generous padding (p-5 instead of p-4)
- Better gap between elements
- Breathable layout

## Navigation Routes

- `/` - Home page
- `/event` - Event page (active)
- `/record` - Record page (placeholder)
- `/market` - Market page (placeholder)
- `/profile` - Profile page (placeholder)

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS 4
- Lucide React (icons)

## Running the App

```bash
pnpm dev
```

Kunjungi http://localhost:3000/event untuk melihat halaman Event yang sudah diperbaiki!

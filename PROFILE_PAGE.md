# Profile Page - User Identity & Progress

## Overview
Halaman Profile menampilkan user identity, rank progression, stats, dan achievements dengan design clean dan modern.

## Fitur Utama

### 1. Profile Identity Card
Card utama yang menampilkan identitas user:

#### Banner Background
- **Dynamic gradient** dari Market (banner skin yang dipilih)
- **Pattern overlay** untuk texture
- **Default**: Purple → Pink → Red gradient

#### Avatar
- **Centered overlap** dengan banner
- **Border putih** 4px
- **Gradient background**: Yellow → Orange
- **Shadow** untuk depth

#### User Info
- **Name**: Bagus (bold, 2xl)
- **Handle**: @bagus (gray, small)
- **Followers**: 11 followers
- **Following**: 2 following
- **Rank Badge**: Gold Runner (gradient yellow-orange)

#### Action Buttons
- **QR profil**: Show QR code modal (dummy)
- **Edit profil**: Open edit screen (placeholder)

### 2. Rank Progress Card
Menampilkan progress tier user:

#### Tier Badge
- **Large hexagon badge** dengan gradient
- **Roman numeral**: II (white, bold)
- **Size**: 24x24 (96px)
- **Gradient**: Yellow → Orange

#### Progress Info
- **Title**: Gold Tier II (gradient text)
- **Progress Bar**: Yellow-orange gradient
- **Current XP**: 1,200 XP
- **Next Level**: 2,500 XP
- **Progress**: 48% (calculated)

### 3. Stats Overview
3 stat cards dalam grid horizontal:

#### Total Distance
- **Icon**: MapPin (orange)
- **Value**: 124 km
- **Background**: Orange-50

#### Runs
- **Icon**: Activity (blue)
- **Value**: 15
- **Background**: Blue-50

#### Avg Pace
- **Icon**: Clock (green)
- **Value**: 5:30 min/km
- **Background**: Green-50

### 4. Achievements Section
Horizontal scroll dengan achievement cards:

#### Early Bird
- **Icon**: Sunrise (yellow)
- **Status**: Unlocked
- **Background**: Yellow-100

#### Night Owl
- **Icon**: Moon (purple)
- **Status**: Unlocked
- **Background**: Purple-100

#### 7 Day Streak
- **Icon**: Flame (red)
- **Status**: Unlocked
- **Background**: Red-100

#### Section Header
- **Title**: Achievements
- **Action**: "See All" button → navigates to full list

## Dummy User Data

```typescript
{
  name: "Bagus",
  handle: "@bagus",
  followers: 11,
  following: 2,
  rank: "Gold Runner",
  tier: "Gold Tier II",
  currentXP: 1200,
  nextLevelXP: 2500,
  stats: {
    totalDistance: 124, // km
    totalRuns: 15,
    avgPace: "5:30" // min/km
  }
}
```

## Design Features

### Colors & Gradients
- **Rank Badge**: Yellow-400 → Orange-400
- **Tier Badge**: Yellow-400 → Orange-400
- **Progress Bar**: Yellow-400 → Orange-400
- **Banner**: Dynamic from Market selection

### Layout
- **Mobile-first**: Max-width container
- **Card-based**: White cards dengan soft shadows
- **Rounded corners**: 2xl untuk cards, xl untuk buttons
- **Airy spacing**: Generous padding dan gaps

### Typography
- **Name**: 2xl, bold
- **Handle**: sm, gray-500
- **Stats labels**: xs, uppercase, gray-500
- **Stats values**: xl, bold, gray-900
- **Tier title**: xl, bold, gradient text

### Icons
- **Lucide React**: Outline style
- **Colored backgrounds**: Soft colored circles
- **Consistent sizing**: 4-6 units

## Component Structure

```
app/profile/page.tsx
├── ProfileHeader (title + settings)
├── ProfileIdentityCard
│   ├── Banner (dynamic gradient)
│   ├── Avatar (overlap)
│   ├── User Info (name, handle, stats)
│   ├── Rank Badge
│   └── Action Buttons (QR, Edit)
├── RankProgressCard
│   ├── Tier Badge (hexagon)
│   ├── Tier Title
│   ├── Progress Bar
│   └── XP Text
├── StatsOverview (3 cards grid)
│   ├── Total Distance
│   ├── Runs
│   └── Avg Pace
├── AchievementsSection
│   ├── Section Header
│   └── Achievement Cards (horizontal scroll)
└── BottomNavigation (Profil tab active)
```

## Interactions

### Implemented
- ✅ Hover effects pada buttons dan cards
- ✅ Smooth transitions
- ✅ Responsive layout

### Placeholder (Not Implemented)
- ⏳ QR profil modal
- ⏳ Edit profil screen
- ⏳ See All achievements page
- ⏳ Settings screen
- ⏳ Banner skin integration dengan Market

## Integration dengan Market

Banner background di Profile Identity Card akan menggunakan skin yang dipilih di Market page:

```typescript
// Future implementation with Context/State Management
const { selectedBannerSkin } = useMarketContext();
const bannerGradient = selectedBannerSkin?.gradient || defaultGradient;
```

## Future Enhancements

- [ ] Context/State management untuk banner skin
- [ ] QR code generation dan modal
- [ ] Edit profile functionality
- [ ] Full achievements list page
- [ ] Settings page
- [ ] Social features (follow/unfollow)
- [ ] Activity history integration
- [ ] Rank tier details modal
- [ ] Achievement unlock animations
- [ ] Share profile functionality

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS 4
- Lucide React (icons)

## Running the App

```bash
pnpm dev
```

Kunjungi http://localhost:3000/profile untuk melihat profile page!

## Design Philosophy

Profile page mengikuti prinsip:
- **Identity-first**: Banner dan avatar prominent
- **Progress-focused**: Rank progression visible
- **Achievement-driven**: Gamification elements
- **Clean & Minimal**: Tidak cluttered
- **Web3 + Fitness**: Modern aesthetic dengan fitness stats

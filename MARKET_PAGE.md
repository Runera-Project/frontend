# Market Page - Banner Skins Marketplace

## Overview
Halaman Market untuk browse dan preview banner skins untuk profile dengan live preview yang interaktif.

## Fitur Utama

### 1. Live Profile Preview
Card preview yang menampilkan bagaimana skin terlihat di profile user:
- **Banner Background**: Dynamic gradient berdasarkan skin yang dipilih
- **User Avatar**: Centered dengan border putih
- **User Info**: Username (Bagus), Wallet address (0x8F31cB2E90)
- **Stats**: 11 followers, 2 following
- **Badges**: Gold Runner rank + selected skin name

### 2. Preview Tabs
3 kategori customization (untuk future development):
- **Frames**: Decorative borders (active)
- **Background**: Banner backgrounds
- **Title**: Special title styles

### 3. My Collection
Skins yang sudah dimiliki user (4 skins):
- **Spacy Warp** - Epic (Purple/Blue/Black gradient)
- **Blurry Sunny** - Rare (Orange/Pink/Purple gradient)
- **Ocean Wave** - Rare (Cyan/Blue/Indigo gradient)
- **Sunset Glow** - Epic (Yellow/Orange/Red gradient)

### 4. Store
Skins yang bisa di-unlock (4 skins):
- **Neon Grid** - Epic (Green/Cyan/Blue gradient) 🔒
- **Galaxy Ring** - Legendary (Purple/Pink/Red gradient) 🔒
- **Aurora Borealis** - Legendary (Green/Blue/Purple gradient) 🔒
- **Cyber Punk** - Epic (Pink/Purple/Indigo gradient) 🔒

## Skin Card Design

### Owned Skins
- **Preview**: Gradient background dengan pattern overlay
- **Rarity Badge**: Top-right corner dengan gradient sesuai rarity
- **Selected Indicator**: Blue checkmark di top-left
- **Button**: "Use" (blue) atau "Using" (active state)
- **Interaction**: Klik untuk apply ke live preview

### Locked Skins
- **Lock Overlay**: Semi-transparent dengan blur effect
- **Lock Icon**: White rounded background
- **Button**: "Locked" (greyed out, disabled)
- **Interaction**: Tidak bisa diklik

## Rarity System

### Legendary
- **Color**: Yellow to Orange gradient
- **Examples**: Galaxy Ring, Aurora Borealis

### Epic
- **Color**: Purple to Pink gradient
- **Examples**: Spacy Warp, Neon Grid, Sunset Glow, Cyber Punk

### Rare
- **Color**: Blue to Cyan gradient
- **Examples**: Blurry Sunny, Ocean Wave

## Interactive Features

### Live Preview Update
1. User klik skin card di "My Collection"
2. Banner di profile preview langsung berubah
3. Skin name badge muncul di bawah rank badge
4. Selected indicator (checkmark) muncul di card
5. Button berubah dari "Use" ke "Using"

### State Management
- **Local React State**: `useState` untuk selected skin
- **No Backend**: Semua data dummy, tidak persist
- **Instant Update**: Preview update real-time tanpa loading

## Design Features

### Colors & Gradients
- **8 unique gradients** untuk variety
- **Rarity-based colors** untuk badges
- **Pattern overlays** untuk texture
- **Soft shadows** untuk depth

### Layout
- **2-column grid** untuk skin cards
- **Mobile-first** responsive design
- **Rounded-2xl** corners
- **Airy spacing** untuk modern look

### Typography
- **Bold titles** untuk hierarchy
- **Semibold** untuk skin names
- **Medium** untuk stats
- **Clean sans-serif** throughout

## Components Structure

```
app/market/page.tsx (main page with state)
├── MarketHeader (title + settings icon)
├── ProfilePreview (live preview card)
├── PreviewTabs (Frames/Background/Title)
├── SkinCollection (My Collection)
│   └── SkinCard (x4 owned)
├── SkinCollection (Store)
│   └── SkinCard (x4 locked)
└── BottomNavigation (Market tab active)
```

## Dummy User Data

```typescript
{
  name: "Bagus",
  wallet: "0x8F31cB2E90",
  followers: 11,
  following: 2,
  rank: "Gold Runner"
}
```

## Future Enhancements

- [ ] Purchase flow untuk locked skins
- [ ] Blockchain integration (NFT skins)
- [ ] Animated skin previews
- [ ] Frame customization (border styles)
- [ ] Title customization (text effects)
- [ ] Skin rarity filtering
- [ ] Search functionality
- [ ] Wishlist/favorites
- [ ] Skin trading marketplace
- [ ] Limited edition drops

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS 4
- Lucide React (icons)

## Running the App

```bash
pnpm dev
```

Kunjungi http://localhost:3000/market untuk melihat marketplace!

## Web3 Identity Vibe

Design mengikuti aesthetic web3 modern:
- **Gradient-heavy**: Colorful, vibrant
- **Gamification**: Rarity system, badges
- **Profile customization**: Personal identity
- **Clean UI**: Minimal, tidak cluttered
- **Soft shadows**: Modern depth
- **Rounded corners**: Friendly, approachable

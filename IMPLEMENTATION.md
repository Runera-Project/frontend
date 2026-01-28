# Runera Miniapp - Home Screen Implementation

## Overview
Mobile-first Home screen UI for a Base ecosystem miniapp with clean, minimal design.

## Components Created

### 1. Header (`components/Header.tsx`)
- Simple header with "Home" title
- Clean typography

### 2. QuestCard (`components/QuestCard.tsx`)
- Displays daily quest progress
- Streak counter with flame icon
- Weekly progress tracker (Mon-Sun)
- Steps progress bar (5,010 / 8,500)
- Rounded corners, soft shadows

### 3. ActivityFeed (`components/ActivityFeed.tsx`)
- Container for activity posts
- Displays posts from followers and user

### 4. PostCard (`components/PostCard.tsx`)
- Individual activity post card
- User avatar and name
- Activity details (distance, pace)
- Optional map preview placeholder
- Like button for other users' posts

### 5. BottomNavigation (`components/BottomNavigation.tsx`)
- Floating pill-shaped navigation bar
- Translucent background with backdrop blur
- 5 navigation items: Home, Event, Record, Market, Profil
- Fixed at bottom center with safe area padding

## Design Features

- **Background**: #f5f7fa (soft gray, not pure white)
- **Cards**: White with rounded-2xl corners and soft shadows
- **Icons**: Lucide React outline style
- **Typography**: Semibold titles, regular body text
- **Mobile-first**: Max-width container, optimized for mobile screens
- **Safe Area**: Bottom padding for notched devices

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS 4
- Lucide React (icons)

## Running the App

```bash
pnpm dev
```

Visit http://localhost:3000 to see the Home screen.

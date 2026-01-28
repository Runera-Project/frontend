# Activities Page - Activity History Tracker

## Overview
Halaman Activities menampilkan history aktivitas lari seperti Strava dengan UI yang clean dan minimal.

## Fitur Utama

### 1. Stats Overview
Dashboard statistik mingguan dengan 4 metric cards:
- **This Week**: Total jarak lari minggu ini (24.5 km)
- **Avg Pace**: Rata-rata pace (/km)
- **Total Time**: Total waktu aktivitas
- **Goal**: Progress terhadap target mingguan (82%)

### 2. Activity Tabs
Filter aktivitas berdasarkan tipe:
- All (semua aktivitas)
- Running 🏃‍♂️
- Walking 🚶‍♂️
- Cycling 🚴‍♂️

### 3. Activity Cards
Setiap card menampilkan:
- **Map Preview**: Placeholder untuk route map (jika ada)
- **Activity Type Badge**: Badge dengan gradient dan emoji
- **Title & Date**: Nama aktivitas dan waktu
- **Main Stats Grid**: Distance, Duration, Pace
- **Additional Stats**: Calories, Elevation, Heart Rate

### 4. Activity Types

#### Running 🏃‍♂️
- Gradient: Blue to Cyan
- Stats: Distance, Pace, Elevation, Heart Rate

#### Walking 🚶‍♂️
- Gradient: Green to Emerald
- Stats: Distance, Duration, Heart Rate

#### Cycling 🚴‍♂️
- Gradient: Orange to Red
- Stats: Distance, Speed, Elevation, Heart Rate

## Dummy Data

### Activity 1: Morning Run
- **Type**: Running
- **Distance**: 8.5 km
- **Duration**: 48:30
- **Pace**: 5:42 /km
- **Calories**: 520 kcal
- **Elevation**: 120 m
- **Heart Rate**: 145 bpm
- **Has Map**: Yes

### Activity 2: Evening Walk
- **Type**: Walking
- **Distance**: 3.2 km
- **Duration**: 35:20
- **Pace**: 11:02 /km
- **Calories**: 180 kcal
- **Heart Rate**: 95 bpm

### Activity 3: Interval Training
- **Type**: Running
- **Distance**: 6.0 km
- **Duration**: 32:15
- **Pace**: 5:22 /km
- **Calories**: 450 kcal
- **Elevation**: 85 m
- **Heart Rate**: 165 bpm
- **Has Map**: Yes

### Activity 4: Weekend Ride
- **Type**: Cycling
- **Distance**: 25.5 km
- **Duration**: 1:15:30
- **Pace**: 2:58 /km
- **Calories**: 680 kcal
- **Elevation**: 320 m
- **Heart Rate**: 135 bpm
- **Has Map**: Yes

### Activity 5: Recovery Run
- **Type**: Running
- **Distance**: 5.0 km
- **Duration**: 30:00
- **Pace**: 6:00 /km
- **Calories**: 320 kcal
- **Elevation**: 45 m
- **Heart Rate**: 125 bpm

## Design Features

### Cards
- **Rounded-2xl corners** untuk modern look
- **Soft shadows** dengan hover effect
- **Gradient backgrounds** untuk activity type badges
- **Colored icon backgrounds** untuk stats
- **Grid layout** untuk stats yang rapi

### Colors
- **Running**: Blue gradient (from-blue-500 to-cyan-500)
- **Walking**: Green gradient (from-green-500 to-emerald-500)
- **Cycling**: Orange gradient (from-orange-500 to-red-500)

### Icons
- **Lucide React** outline style
- **Colored backgrounds** untuk visual hierarchy
- **Emoji** untuk activity types

### Typography
- **Bold titles** untuk hierarchy
- **Semibold** untuk stats values
- **Medium** untuk labels
- **Regular** untuk secondary text

## Navigation

### Access Points
1. **From Record Page**: Klik "View Activity History" button
2. **From Bottom Nav**: Klik "Record" tab (akan ke recording page)
3. **Direct URL**: `/activities`

### Header Actions
- **Plus Button**: Link ke `/record` untuk mulai recording baru

## Components Structure

```
app/activities/page.tsx
├── RecordHeader (with + button to /record)
├── StatsOverview (4 metric cards)
├── ActivityTabs (filter tabs)
├── ActivityList
│   └── ActivityCard (x5)
└── BottomNavigation (Record tab active)
```

## Integration dengan Record Page

- **Record Page** (`/record`): Untuk tracking aktivitas real-time
- **Activities Page** (`/activities`): Untuk melihat history
- Link "View Activity History" di Record page (idle state)
- Link "+" button di Activities page untuk start new recording

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS 4
- Lucide React (icons)

## Running the App

```bash
pnpm dev
```

Kunjungi:
- http://localhost:3000/activities - Activity history
- http://localhost:3000/record - Start recording

# Validate Page - Activity Review & Save

## Overview
Halaman untuk review dan save aktivitas setelah selesai recording.

## Fitur

### 1. Header
- Success icon dengan gradient green
- Title: "Activity Complete!"
- Subtitle: "Review and save your activity"

### 2. Map Preview
- Placeholder untuk route map
- Rounded-2xl dengan shadow

### 3. Activity Title Input
- Editable text field
- Default: "Morning Run"
- User bisa mengubah nama aktivitas

### 4. Activity Summary
Stats yang ditampilkan:
- **Duration**: Waktu total (format MM:SS)
- **Distance**: Jarak tempuh (km)
- **Avg Pace**: Rata-rata pace (/km)
- **Calories**: Kalori terbakar (calculated: distance × 65)
- **Elevation**: Elevasi (calculated: distance × 15)

### 5. Action Buttons
- **Discard**: Buang aktivitas, kembali ke `/record`
- **Save Activity**: Simpan aktivitas, redirect ke `/activities`

## Data Flow

1. User selesai recording di `/record`
2. Klik Stop button
3. Redirect ke `/record/validate?time=XXX&distance=XXX&pace=XXX`
4. User review dan edit title
5. Klik "Save Activity" → redirect ke `/activities`
6. Atau klik "Discard" → kembali ke `/record`

## URL Parameters

- `time`: Total waktu dalam detik (string)
- `distance`: Jarak dalam km (string)
- `pace`: Pace dalam format MM:SS (string)

Example:
```
/record/validate?time=2910&distance=8.50&pace=5:42
```

## Design Features

- **Success theme**: Green gradient untuk celebrate completion
- **Clean layout**: White cards dengan soft shadows
- **Icon backgrounds**: Colored backgrounds untuk visual hierarchy
- **Gradient buttons**: Blue gradient untuk primary action
- **Responsive**: Mobile-first design

## Components Used

- `useSearchParams`: Get URL parameters
- `useRouter`: Navigation
- `Suspense`: Loading state handling
- `BottomNavigation`: Bottom nav bar

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS 4
- Lucide React (icons)

## Future Enhancements

- [ ] Save to database/localStorage
- [ ] Add activity type selector (Running/Walking/Cycling)
- [ ] Add notes/description field
- [ ] Add photo upload
- [ ] Show actual map route
- [ ] Add social sharing options

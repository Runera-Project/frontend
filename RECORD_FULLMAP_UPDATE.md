# Record Page - Full Map Update

## Overview
Redesign halaman Record dengan full-screen map dan button positioning yang lebih baik sesuai dengan design reference.

## Major Changes

### 1. Full Screen Map Background
**Before**: Small map preview card (h-64)
**After**: Full screen map covering entire viewport

#### Implementation
```tsx
<div className="absolute inset-0">
  <div className="relative h-full w-full bg-gradient-to-br from-gray-100 to-gray-200">
    {/* Map content */}
  </div>
</div>
```

#### Features
- ✅ Full viewport height
- ✅ Absolute positioning
- ✅ Mock map grid pattern
- ✅ Street labels
- ✅ Running route visualization
- ✅ Animated current position (when recording)

### 2. Content Overlay with Z-Index
**Before**: Sequential layout
**After**: Overlay layout with proper z-index

```tsx
<div className="relative z-10 flex min-h-screen flex-col">
  {/* All content floats above map */}
</div>
```

### 3. Button Positioning - Much Lower
**Before**: Buttons di tengah halaman
**After**: Buttons di bagian bawah (pb-32 untuk space bottom nav)

#### Layout Structure
```
┌─────────────────┐
│ Status Badge    │ ← Top
│                 │
│                 │
│   Full Map      │ ← Middle (flex-1 spacer)
│                 │
│                 │
│ Stats Card      │ ← Lower
│ Control Buttons │ ← Bottom (pb-32)
└─────────────────┘
```

### 4. Collapsible Stats Card
**New Feature**: Stats card dapat di-collapse untuk view map lebih luas

#### States
- **Collapsed**: Compact 3-column stats (TIME | KM | PACE)
- **Expanded**: Large time display + 2-column grid

#### Toggle
```tsx
<button onClick={() => setShowStats(!showStats)}>
  {showStats ? <ChevronDown /> : <ChevronUp />}
</button>
```

### 5. Improved Visual Hierarchy

#### Idle State
```
┌─────────────────┐
│ Ready Badge     │
│                 │
│   (Map BG)      │
│                 │
│ ┌─────────────┐ │
│ │   00:00     │ │
│ │   0.00 km   │ │
│ └─────────────┘ │
│                 │
│      ▶️         │ ← Play button (centered, lower)
└─────────────────┘
```

#### Recording State
```
┌─────────────────┐
│ Recording Badge │
│                 │
│  (Map + Route)  │
│                 │
│ ┌─────────────┐ │
│ │ Stats Card  │ │ ← Collapsible
│ └─────────────┘ │
│                 │
│   ⏹️    ⏸️      │ ← Stop + Pause (lower)
└─────────────────┘
```

#### Paused State
```
┌─────────────────┐
│ Paused Badge    │
│                 │
│  (Map + Route)  │
│                 │
│ ┌─────────────┐ │
│ │ Stats Card  │ │
│ └─────────────┘ │
│                 │
│   ⏹️    ▶️      │ ← Stop + Resume (lower)
└─────────────────┘
```

## Design Details

### Map Visualization
```tsx
// Full screen SVG map
<svg className="h-full w-full" viewBox="0 0 400 800">
  {/* Grid pattern */}
  <pattern id="grid" width="40" height="40">
    <path d="M 40 0 L 0 0 0 40" />
  </pattern>
  
  {/* Street labels */}
  <text>Main Street</text>
  <text>Park Avenue</text>
  
  {/* Running route */}
  <path stroke="#3B82F6" strokeWidth="5" />
  
  {/* Start point */}
  <circle fill="#10B981" />
  
  {/* Current position (animated) */}
  <circle fill="#3B82F6" className="animate-pulse" />
</svg>
```

### Stats Card Styling
```css
.stats-card {
  @apply rounded-2xl;
  @apply bg-white/95;
  @apply backdrop-blur-sm;
  @apply shadow-lg;
}
```

### Button Positioning
```css
.controls {
  @apply px-5;
  @apply pb-32; /* Space for bottom nav */
}
```

## Component Simplification

### Removed Components
- ❌ `MapPreview.tsx` (integrated into main page)
- ❌ `StatsDisplay.tsx` (integrated into main page)
- ❌ `RecordControls.tsx` (integrated into main page)

### Benefits
- ✅ Simpler component tree
- ✅ Better performance (less component overhead)
- ✅ Easier to maintain
- ✅ More flexible layout control

## Responsive Behavior

### Mobile-First
- Full screen map utilizes entire viewport
- Stats card floats above map
- Buttons positioned for easy thumb reach
- Bottom nav always accessible

### Touch Targets
- Play button: 80x80px (h-20 w-20)
- Stop button: 64x64px (h-16 w-16)
- Pause/Resume: 80x80px (h-20 w-20)
- All meet minimum 44px requirement

## Animation & Interactions

### Recording Animation
```tsx
{isRecording && (
  <circle>
    <animate attributeName="r" from="10" to="20" dur="1.5s" repeatCount="indefinite" />
    <animate attributeName="opacity" from="0.3" to="0" dur="1.5s" repeatCount="indefinite" />
  </circle>
)}
```

### Route Pulse
```tsx
<path className={isRecording ? 'animate-pulse' : ''} />
```

### Button Hover
```tsx
className="transition-all hover:scale-105"
```

## Color Scheme

### Status Indicators
- **Ready**: Gray-300 (inactive)
- **Recording**: Green-500 (active, pulsing)
- **Paused**: Yellow-500 (warning)

### Buttons
- **Play**: Blue gradient (from-blue-600 to-blue-500)
- **Stop**: Red gradient (from-red-500 to-red-600)
- **Pause**: White with gray icon

### Map Elements
- **Route**: Blue-500 (#3B82F6)
- **Start**: Green-500 (#10B981)
- **Current**: Blue-500 with pulse

## Performance Optimizations

### SVG Rendering
- Single SVG for entire map
- Conditional rendering for route (only when not idle)
- Animated elements only when recording

### State Management
- Minimal state updates
- Efficient timer implementation
- Calculated values (pace) only when needed

## Accessibility

### Visual Feedback
- Clear status indicators
- Color + text for states
- Large touch targets
- High contrast buttons

### Screen Readers
- Semantic HTML structure
- Descriptive button labels
- Status announcements

## Testing Checklist

- [x] Full map displays correctly
- [x] Buttons positioned at bottom
- [x] Stats card collapsible
- [x] Route animates when recording
- [x] Start/Stop/Pause/Resume work
- [x] Timer counts correctly
- [x] Distance increments
- [x] Pace calculates
- [x] Bottom nav visible
- [x] No TypeScript errors
- [x] Responsive on mobile
- [x] Touch targets adequate

## Future Enhancements

- [ ] Real GPS integration
- [ ] Actual map tiles (Google Maps / Mapbox)
- [ ] Route elevation profile
- [ ] Split times
- [ ] Audio cues
- [ ] Heart rate monitoring
- [ ] Cadence tracking
- [ ] Auto-pause detection
- [ ] Route sharing
- [ ] Offline map caching

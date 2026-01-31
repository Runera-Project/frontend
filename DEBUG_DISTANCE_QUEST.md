# Debug Distance Quest Issue

## Problem
User melaporkan bahwa quest "Run 5 Kilometers" tidak bisa di-claim setelah melakukan lari, padahal quest XP bisa di-claim.

## Root Cause Analysis

### Possible Issues:
1. **Data tidak reactive** - `todayDistance` dipanggil hanya sekali saat component mount
2. **Distance tidak tersimpan** - Data distance mungkin tidak tersimpan dengan benar di localStorage
3. **Format data salah** - Distance mungkin tersimpan dalam format yang berbeda

## Fixes Applied

### 1. Made Quest Data Reactive
```typescript
// Before: Called once
const todayDistance = getTodayDistance();

// After: Reactive state with periodic updates
const [todayDistance, setTodayDistance] = useState(0);

useEffect(() => {
  const updateQuestData = () => {
    setTodayDistance(getTodayDistance());
    setTodayActivityCount(getTodayActivityCount());
    setTodayXP(getTodayXP());
  };

  updateQuestData(); // Initial
  const interval = setInterval(updateQuestData, 2000); // Update every 2s
  
  return () => clearInterval(interval);
}, []);
```

### 2. Added Debug Logging
```typescript
const getTodayDistance = () => {
  console.log('🔍 Debug Distance Quest:');
  console.log('Today:', today);
  console.log('All activities:', activities);
  console.log('Today activities:', todayActivities);
  console.log('Total distance today:', totalDistance, 'km');
  
  return totalDistance;
};
```

### 3. Added Visual Debug Panel
Added a debug panel in the UI to show real-time values:
```
🔍 Debug:
Distance: 5.23km (need 5km)
Activities: 1 (need 3)
XP: 100 (need 100)
```

## How to Debug

### Step 1: Check Console Logs
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for logs starting with "🔍 Debug Distance Quest:"
4. Check:
   - Are activities being loaded?
   - Is today's date matching?
   - Is distance being calculated correctly?

### Step 2: Check Debug Panel
Look at the debug panel on the home page:
- Does it show the correct distance?
- Does it update after posting a run?

### Step 3: Check localStorage
In browser console, run:
```javascript
// Check activities
JSON.parse(localStorage.getItem('runera_activities'))

// Check specific activity
const activities = JSON.parse(localStorage.getItem('runera_activities'));
console.table(activities);

// Check today's activities
const today = new Date().toDateString();
activities.filter(a => new Date(a.timestamp).toDateString() === today);
```

### Step 4: Manual Test
```javascript
// Add test activity with 5km
const activities = JSON.parse(localStorage.getItem('runera_activities') || '[]');
activities.push({
  id: 'test-' + Date.now(),
  title: 'Test Run',
  distance: 5.5, // 5.5km
  duration: 1800, // 30 minutes
  pace: '5:27',
  timestamp: Date.now(),
  xpEarned: 100,
  status: 'VERIFIED'
});
localStorage.setItem('runera_activities', JSON.stringify(activities));

// Refresh page and check if distance quest is claimable
```

## Expected Behavior

### When Distance < 5km:
- Quest card: Gray border, normal appearance
- Progress bar: Shows partial progress (e.g., 3.0/5.0 km)
- Click: Shows alert "Not enough distance!"
- Debug panel: Shows actual distance

### When Distance >= 5km:
- Quest card: Blue border, gradient background
- Text: "Claim!" with animation
- Progress bar: 100% filled
- Click: Shows success alert and quest disappears
- Debug panel: Shows distance >= 5km

## Data Structure

### Activity Object in localStorage:
```typescript
{
  id: string,           // Run ID from backend
  title: string,        // "Morning Run"
  distance: number,     // 5.23 (in kilometers)
  duration: number,     // 1800 (in seconds)
  pace: string,         // "5:27"
  timestamp: number,    // Date.now()
  xpEarned: number,     // 100 (from backend)
  status: string        // "VERIFIED"
}
```

### Quest Claim Timestamp:
```typescript
localStorage.getItem('runera_distance_quest_claim_time') // "1738368000000"
```

## Testing Checklist

- [ ] Run 5km and post activity
- [ ] Check console logs for distance calculation
- [ ] Check debug panel shows correct distance
- [ ] Verify quest card shows "Claim!" when distance >= 5km
- [ ] Click quest and verify it claims successfully
- [ ] Verify quest disappears after claim
- [ ] Wait 5 minutes and verify quest reappears
- [ ] Run another 5km and verify can claim again

## Next Steps

1. **Test with real data** - User should run and post activity
2. **Check console logs** - Look for any errors or unexpected values
3. **Verify localStorage** - Ensure distance is saved correctly
4. **Remove debug panel** - After confirming it works, remove the debug panel

## Files Modified
- `components/QuestCard.tsx` - Added reactive state, debug logs, and debug panel

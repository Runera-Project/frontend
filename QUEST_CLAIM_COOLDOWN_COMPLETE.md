# Quest Claim Feature with 5-Minute Cooldown - COMPLETE ✅

## Overview
Implemented a complete quest claim system where users can claim rewards for completing daily quests. After claiming, quests disappear and reappear after 5 minutes.

## Features Implemented

### 1. Three Claimable Daily Quests
All three daily quests are now claimable:

#### Quest 1: Run 5 Kilometers
- **Target**: 5km distance
- **Reward**: +50 XP
- **Progress**: Tracks total distance from today's activities
- **Claim Condition**: Must run at least 5km today

#### Quest 2: Complete 3 Activities
- **Target**: 3 activities
- **Reward**: +30 XP
- **Progress**: Counts number of activities completed today
- **Claim Condition**: Must complete at least 3 activities today

#### Quest 3: XP Earned Today
- **Target**: 100 XP
- **Reward**: Bonus XP equal to today's total
- **Progress**: Tracks total XP earned from today's activities
- **Claim Condition**: Must earn at least 100 XP today

### 2. 5-Minute Cooldown System
- When a quest is claimed, it **disappears** from the UI
- Quest **reappears** after exactly 5 minutes
- Cooldown timer runs in the background (checks every second)
- Data persists in localStorage even when quest is hidden

### 3. Visual Feedback
- **Incomplete Quest**: Gray border, normal colors
- **Claimable Quest**: Colored border (blue/green/yellow), animated "Claim!" text
- **Hidden Quest**: Completely removed from UI during cooldown
- **Active Quest Count**: Updates dynamically (e.g., "2 Active" when one is hidden)

## Technical Implementation

### Data Sources
All quest data comes from `localStorage`:

```typescript
// Activities stored in localStorage
const activities = JSON.parse(localStorage.getItem('runera_activities') || '[]');

// Each activity has:
{
  id: string,
  title: string,
  distance: number,      // in km
  duration: number,      // in seconds
  pace: string,
  timestamp: number,
  xpEarned: number,      // 100 XP per verified run
  status: string
}
```

### Cooldown Storage
```typescript
// Claim timestamps stored in localStorage
localStorage.setItem('runera_distance_quest_claim_time', String(Date.now()));
localStorage.setItem('runera_activities_quest_claim_time', String(Date.now()));
localStorage.setItem('runera_xp_quest_claim_time', String(Date.now()));
```

### Quest Visibility Logic
```typescript
// Check if 5 minutes have passed
const checkQuestCooldown = (questKey: string) => {
  const claimTime = localStorage.getItem(`runera_${questKey}_claim_time`);
  if (!claimTime) return true; // Show if never claimed
  
  const timeSinceClaim = Date.now() - parseInt(claimTime);
  const fiveMinutes = 5 * 60 * 1000;
  
  return timeSinceClaim >= fiveMinutes; // Show if 5 minutes passed
};
```

### Real-time Updates
- `useEffect` hook checks cooldowns every second
- Automatically shows quest when cooldown expires
- No page refresh needed

## User Flow

### Scenario 1: Complete and Claim Quest
1. User runs 5km → Distance quest shows "5.0/5.0 km" with "Claim!" button
2. User clicks quest → Alert shows "+50 XP" and "Quest will reappear in 5 minutes"
3. Quest disappears from UI
4. After 5 minutes → Quest reappears automatically
5. User can claim again if they meet the requirements

### Scenario 2: Multiple Claims in One Day
1. User runs 2.5km → Claims distance quest (first time)
2. Quest disappears for 5 minutes
3. User runs another 3km (total 5.5km today)
4. After 5 minutes → Quest reappears
5. User can claim again because they still have 5.5km today

### Scenario 3: Incomplete Quest
1. User runs 3km → Distance quest shows "3.0/5.0 km"
2. User clicks quest → Alert shows "Not enough distance! You need 5km..."
3. Quest stays visible (no cooldown triggered)
4. User can try again after running more

## Integration with Existing Systems

### Works with Streak System
- Streak increments when user posts activity (in `validate/page.tsx`)
- Quest system reads from same localStorage
- No conflicts between systems

### Works with Backend XP
- Backend gives 100 XP per verified run
- Quest system reads `xpEarned` from activities
- XP quest tracks cumulative XP for the day

### Works with Activity Tracking
- Activities saved in `validate/page.tsx` after successful post
- Quest system filters activities by today's date
- Real-time updates as user completes activities

## Testing

### Test Case 1: Claim Distance Quest
```
1. Run 5km and post activity
2. Go to home page
3. Click "Run 5 Kilometers" quest
4. Verify: Alert shows "+50 XP"
5. Verify: Quest disappears
6. Wait 5 minutes
7. Verify: Quest reappears
```

### Test Case 2: Claim Activities Quest
```
1. Complete 3 activities today
2. Go to home page
3. Click "Complete 3 Activities" quest
4. Verify: Alert shows "+30 XP"
5. Verify: Quest disappears
6. Wait 5 minutes
7. Verify: Quest reappears
```

### Test Case 3: Claim XP Quest
```
1. Earn 100+ XP today (1 verified run)
2. Go to home page
3. Click "XP Earned Today" quest
4. Verify: Alert shows "+{todayXP} XP bonus"
5. Verify: Quest disappears
6. Wait 5 minutes
7. Verify: Quest reappears
```

### Test Case 4: Incomplete Quest
```
1. Run 2km (less than 5km)
2. Go to home page
3. Click "Run 5 Kilometers" quest
4. Verify: Alert shows "Not enough distance!"
5. Verify: Quest stays visible (no cooldown)
```

## Files Modified

### `components/QuestCard.tsx`
- Added `useEffect` import for cooldown timer
- Added state for quest visibility (`showDistanceQuest`, `showActivitiesQuest`, `showXpQuest`)
- Added functions to calculate today's distance, activity count, and XP
- Added claim handlers for all three quests
- Added cooldown check logic
- Added interval timer to check cooldowns every second
- Updated quest cards to be conditionally rendered based on visibility
- Updated quest cards to be clickable when claimable

## localStorage Keys Used

```typescript
// Activities
'runera_activities' // Array of activity objects

// Quest claim timestamps
'runera_distance_quest_claim_time'   // Timestamp when distance quest was claimed
'runera_activities_quest_claim_time' // Timestamp when activities quest was claimed
'runera_xp_quest_claim_time'         // Timestamp when XP quest was claimed

// Streak tracking (existing)
'runera_streak'
'runera_longest_streak'
'runera_last_run_date'
```

## Future Enhancements (Optional)

### 1. Backend Integration
- Store quest claims in backend database
- Sync across devices
- Prevent multiple claims from different devices

### 2. Quest Rewards
- Actually add XP to user's total when claimed
- Track total XP earned from quests
- Show quest completion history

### 3. More Quest Types
- Weekly quests (longer cooldown)
- Special event quests
- Achievement-based quests

### 4. Visual Improvements
- Countdown timer showing time until quest reappears
- Animation when quest reappears
- Confetti effect when claiming

## Summary

✅ All three daily quests are claimable
✅ Quests disappear after claim
✅ Quests reappear after 5 minutes
✅ Real-time cooldown checking
✅ Data persists in localStorage
✅ Visual feedback for claimable/incomplete quests
✅ Works with existing streak and XP systems
✅ No page refresh needed

The quest claim feature is now fully functional and ready for testing!

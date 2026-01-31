# Social Feed / Activity Feed Analysis

## Current Status: ❌ NOT IMPLEMENTED

### Summary
Saat ini **TIDAK ADA** fungsi untuk menyimpan dan menampilkan aktivitas lari dari user lain di home page. Semua komponen yang ada hanya menampilkan aktivitas user sendiri.

---

## What Exists Currently

### 1. Database (Backend)
✅ **Model `Run` exists** - Menyimpan semua run activities dari semua user
```prisma
model Run {
  id                 String     @id @default(cuid())
  userId             String
  status             RunStatus  @default(SUBMITTED)
  distanceMeters     Int
  durationSeconds    Int
  startTime          DateTime
  endTime            DateTime
  deviceHash         String?
  avgPaceSeconds     Int?
  submittedAt        DateTime   @default(now())
  ...
}
```

✅ **Data is stored** - Setiap kali user post run, data disimpan ke database
✅ **Includes user info** - Ada relasi ke `User` model via `userId`

### 2. Backend API
❌ **NO social feed endpoint** - Tidak ada endpoint untuk fetch runs dari semua user

**Existing endpoints:**
- `GET /runs?walletAddress=0x...` - Hanya mengembalikan runs dari **satu user** tertentu
- `POST /run/submit` - Submit run baru (disimpan ke database)

**Missing endpoints:**
- `GET /feed` atau `GET /runs/all` - Untuk fetch runs dari semua user
- `GET /runs/following` - Untuk fetch runs dari user yang di-follow
- `GET /runs/public` - Untuk fetch public runs

### 3. Smart Contract
❌ **NO individual run storage** - Smart contract hanya menyimpan aggregate stats

**What's stored on-chain:**
- Profile stats: XP, level, runCount, totalDistance, longestStreak
- Achievement NFTs
- Event participations

**What's NOT stored on-chain:**
- Individual run activities
- Run details (distance, duration, pace per run)
- Social interactions (likes, comments)

### 4. Frontend Components

#### ✅ Components Exist (But Not Used for Social Feed)

**`components/ActivityFeed.tsx`**
- Currently shows **dummy data** only
- Has UI for displaying multiple posts
- NOT connected to backend API
- NOT used in home page

**`components/PostCard.tsx`**
- UI component for displaying one activity post
- Shows: user avatar, name, time, activity title, distance, pace, map preview
- Has like button (not functional)
- Has "Private" badge for other users

**`components/RecentRun.tsx`**
- Shows **user's own** most recent run
- Reads from **localStorage** only
- NOT from backend database
- Currently used in home page

---

## What's Missing for Social Feed

### 1. Backend API Endpoints

#### Option A: Public Feed (All Users)
```javascript
// GET /feed
// Returns recent runs from all users (public)
app.get("/feed", async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const offset = parseInt(req.query.offset) || 0;
  
  const runs = await prisma.run.findMany({
    where: { 
      status: 'VERIFIED' // Only show verified runs
    },
    include: {
      user: {
        select: {
          walletAddress: true,
          level: true,
          tier: true,
          // Don't include sensitive data
        }
      }
    },
    orderBy: { submittedAt: 'desc' },
    take: limit,
    skip: offset,
  });
  
  return res.json(runs);
});
```

#### Option B: Following Feed (Social Graph)
```javascript
// Requires additional tables:
// - Follow (userId, followingUserId)
// - Privacy settings

// GET /feed/following
app.get("/feed/following", async (req, res) => {
  const authUser = await getUserFromAuthHeader(req);
  
  // Get users that current user follows
  const following = await prisma.follow.findMany({
    where: { userId: authUser.id },
    select: { followingUserId: true }
  });
  
  const followingIds = following.map(f => f.followingUserId);
  
  // Get runs from followed users
  const runs = await prisma.run.findMany({
    where: { 
      userId: { in: followingIds },
      status: 'VERIFIED'
    },
    include: { user: true },
    orderBy: { submittedAt: 'desc' },
    take: 20,
  });
  
  return res.json(runs);
});
```

### 2. Database Schema Updates (Optional)

#### For Social Features:
```prisma
model Follow {
  id              String   @id @default(cuid())
  userId          String   // Who is following
  followingUserId String   // Who is being followed
  createdAt       DateTime @default(now())
  
  user      User @relation("Followers", fields: [userId], references: [id])
  following User @relation("Following", fields: [followingUserId], references: [id])
  
  @@unique([userId, followingUserId])
  @@index([userId])
  @@index([followingUserId])
}

model RunLike {
  id        String   @id @default(cuid())
  runId     String
  userId    String
  createdAt DateTime @default(now())
  
  run  Run  @relation(fields: [runId], references: [id])
  user User @relation(fields: [userId], references: [id])
  
  @@unique([runId, userId])
  @@index([runId])
}

model RunComment {
  id        String   @id @default(cuid())
  runId     String
  userId    String
  content   String   @db.VarChar(500)
  createdAt DateTime @default(now())
  
  run  Run  @relation(fields: [runId], references: [id])
  user User @relation(fields: [userId], references: [id])
  
  @@index([runId])
}

// Add to User model:
model User {
  ...
  followers  Follow[] @relation("Following")
  following  Follow[] @relation("Followers")
  runLikes   RunLike[]
  runComments RunComment[]
  isPublic   Boolean  @default(true) // Privacy setting
}

// Add to Run model:
model Run {
  ...
  likes    RunLike[]
  comments RunComment[]
  isPublic Boolean @default(true)
}
```

### 3. Frontend Updates

#### Update `components/ActivityFeed.tsx`:
```typescript
'use client';

import { useEffect, useState } from 'react';
import PostCard from './PostCard';

interface FeedRun {
  id: string;
  user: {
    walletAddress: string;
    level: number;
    tier: number;
  };
  distanceMeters: number;
  durationSeconds: number;
  avgPaceSeconds: number;
  submittedAt: string;
  status: string;
}

export default function ActivityFeed() {
  const [runs, setRuns] = useState<FeedRun[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/feed`);
      const data = await response.json();
      setRuns(data);
    } catch (error) {
      console.error('Failed to fetch feed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading feed...</div>;
  }

  return (
    <div className="px-5">
      <h2 className="mb-4 text-lg font-bold text-gray-900">Activity Feed</h2>
      <div className="flex flex-col gap-3">
        {runs.map((run) => (
          <PostCard
            key={run.id}
            user={{
              name: `${run.user.walletAddress.slice(0, 6)}...${run.user.walletAddress.slice(-4)}`,
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${run.user.walletAddress}`,
              level: run.user.level,
              tier: run.user.tier,
            }}
            time={getTimeAgo(run.submittedAt)}
            activity="Run"
            distance_km={run.distanceMeters / 1000}
            avg_pace={formatPace(run.avgPaceSeconds)}
            map_preview={false}
          />
        ))}
      </div>
    </div>
  );
}
```

#### Use in `app/page.tsx`:
```typescript
import ActivityFeed from '@/components/ActivityFeed';

export default function Home() {
  return (
    <div>
      <QuestCard />
      <RecentRun />
      <ActivityFeed /> {/* Add social feed */}
    </div>
  );
}
```

---

## Implementation Options

### Option 1: Simple Public Feed (Easiest)
**Pros:**
- Simple to implement
- No need for follow system
- Shows all verified runs

**Cons:**
- No privacy control
- May show too much data
- No personalization

**Implementation:**
1. Add `GET /feed` endpoint to backend
2. Update `ActivityFeed.tsx` to fetch from API
3. Add to home page

**Estimated Time:** 2-3 hours

### Option 2: Following-Based Feed (Medium)
**Pros:**
- More personalized
- Better privacy
- Social graph features

**Cons:**
- Requires follow system
- More complex
- Need UI for follow/unfollow

**Implementation:**
1. Add `Follow` model to database
2. Add follow/unfollow endpoints
3. Add `GET /feed/following` endpoint
4. Add follow button to profiles
5. Update `ActivityFeed.tsx`

**Estimated Time:** 1-2 days

### Option 3: Full Social Features (Complex)
**Pros:**
- Complete social experience
- Likes, comments, shares
- Privacy controls
- Notifications

**Cons:**
- Very complex
- Requires significant time
- Need moderation

**Implementation:**
1. All from Option 2
2. Add likes, comments, shares
3. Add privacy settings
4. Add notifications
5. Add moderation tools

**Estimated Time:** 1-2 weeks

---

## Recommendation

### For MVP / Quick Implementation:
**Use Option 1: Simple Public Feed**

**Steps:**
1. Add backend endpoint `GET /feed` (30 min)
2. Update `ActivityFeed.tsx` to fetch real data (30 min)
3. Add to home page (10 min)
4. Test and polish (30 min)

**Total: ~2 hours**

### For Better UX:
**Use Option 2: Following-Based Feed**
- Implement follow system first
- Then add feed based on following
- Add privacy controls

---

## Current Workaround

Since social feed is not implemented, users can only see:
1. **Their own recent run** - via `RecentRun` component (localStorage)
2. **Their own run history** - via `/runs?walletAddress=...` API
3. **Dummy data** - in `ActivityFeed` component (not real data)

To see other users' activities, you would need to:
1. Know their wallet address
2. Call `GET /runs?walletAddress=0x...` for each user
3. Manually aggregate the data

This is not practical for a social feed.

---

## Conclusion

**Answer to your question:**
❌ **NO** - Saat ini TIDAK ADA fungsi di database atau smart contract yang menyimpan dan menampilkan aktivitas lari dari user lain di home page.

**What exists:**
- ✅ Database menyimpan semua runs dari semua user
- ✅ UI components sudah ada (ActivityFeed, PostCard)
- ❌ Backend API untuk social feed belum ada
- ❌ Frontend belum connect ke backend untuk feed
- ❌ Smart contract tidak menyimpan individual runs

**To implement social feed, you need:**
1. Add backend API endpoint for feed
2. Connect frontend to backend API
3. (Optional) Add follow system and privacy controls

# Subreddit Posting Tracking Feature

## Overview
This feature allows VAs to mark individual subreddits as "posted" when working on Subreddit Upvote Tasks. The system tracks completion progress and provides visual feedback to users.

## Features Implemented

### 1. Database Schema Updates
- **New Field**: Added `completed_subreddits` JSONB column to the `tasks` table
- **RLS Policy**: Created policy allowing VAs to update the `completed_subreddits` field of their assigned tasks

### 2. User Interface Components

#### Target Subreddits List (`components/target-subreddits-list.tsx`)
A client-side component that displays the list of target subreddits with interactive buttons:

- **Visual States**:
  - Uncompleted subreddits: Blue background with numbered badge
  - Completed subreddits: Green background with checkmark icon
  
- **Actions**:
  - **Visit**: Opens the subreddit in a new tab
  - **Mark as Posted**: Marks the subreddit as completed
  - **Unmark**: Removes the completion status (appears for completed subreddits)

- **Features**:
  - Loading states during operations
  - Optimistic UI updates
  - Error handling with user feedback

### 3. Server Actions (`app/actions/mark-subreddit-posted.ts`)

Two server actions handle the marking/unmarking operations:

#### `markSubredditAsPosted(taskId, subreddit)`
- Validates user authentication and task ownership
- Adds the subreddit to the `completed_subreddits` array
- Revalidates the page cache
- Returns success/error status

#### `unmarkSubredditAsPosted(taskId, subreddit)`
- Removes a subreddit from the `completed_subreddits` array
- Allows users to correct mistakes
- Maintains the same security checks

### 4. Progress Tracking

The task detail page displays progress in two places:

1. **Header**: Shows "Progress: X/Y subreddits" in the top-right corner
2. **Task Details Card**: Shows a visual progress bar with completion percentage

Both update automatically when subreddits are marked as posted.

## Installation Instructions

### Step 1: Apply Database Migrations

You need to run the SQL migrations to add the new database field and RLS policy.

**Option A: Using Supabase Dashboard**
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Execute the following files in order:
   - `supabase/migrations/add_completed_subreddits.sql`
   - `supabase/migrations/add_va_update_policy.sql`

**Option B: Using Supabase CLI**
```bash
supabase db push
```

### Step 2: Verify Installation

After applying migrations, test the feature:

1. Log in as a VA
2. Open a Subreddit Upvote Task
3. Click "Mark as Posted" on any subreddit
4. Verify:
   - The subreddit card turns green
   - The progress counter updates
   - The progress bar fills accordingly

## User Workflow

### For VAs:
1. Navigate to a Subreddit Upvote Task from the dashboard
2. Click "Visit" to open a subreddit in a new tab
3. Perform the required action (posting, upvoting, etc.)
4. Return to the task page
5. Click "Mark as Posted" to track completion
6. Repeat for all target subreddits
7. Progress is automatically tracked and displayed

### For Admins:
- Admins can view the task progress in the admin panel
- The progress data is stored in the `completed_subreddits` field of the task

## Technical Details

### Data Structure
```typescript
// Task interface
interface Task {
  // ... other fields
  target_subreddits: string[] | null      // e.g., ["askreddit", "programming"]
  completed_subreddits: string[] | null   // e.g., ["askreddit"]
}
```

### Security
- Row Level Security (RLS) ensures VAs can only update their assigned tasks
- Server actions validate ownership before allowing updates
- All operations are authenticated using Supabase auth

### Performance
- Uses Next.js Server Actions for efficient server-client communication
- Implements `revalidatePath` for automatic cache invalidation
- Optimistic updates provide immediate user feedback

## Files Modified/Created

### New Files:
- `components/target-subreddits-list.tsx` - Client component for interactive subreddit list
- `app/actions/mark-subreddit-posted.ts` - Server actions for marking subreddits
- `supabase/migrations/add_completed_subreddits.sql` - Database migration
- `supabase/migrations/add_va_update_policy.sql` - RLS policy migration
- `supabase/migrations/README.md` - Migration documentation

### Modified Files:
- `app/dashboard/task/[id]/page.tsx` - Integrated new component and data fetching
- `lib/supabase.ts` - Updated Task interface with new field

## Future Enhancements

Potential improvements for this feature:

1. **Timestamps**: Track when each subreddit was marked as posted
2. **Notes**: Allow VAs to add notes for each completed subreddit
3. **Undo History**: Implement a history of changes
4. **Bulk Actions**: Add "Mark All as Posted" / "Unmark All" buttons
5. **Filtering**: Show only completed or uncompleted subreddits
6. **Analytics**: Track average time per subreddit completion
7. **Notifications**: Alert admins when a task is fully completed

## Troubleshooting

### Issue: "Failed to update task"
- **Cause**: RLS policy not applied or user not authenticated
- **Solution**: Verify migrations were applied and user is logged in

### Issue: Button doesn't respond
- **Cause**: JavaScript error or network issue
- **Solution**: Check browser console for errors

### Issue: Progress not updating
- **Cause**: Cache not invalidating
- **Solution**: Hard refresh the page (Ctrl+F5) or clear cache

## Support

For issues or questions about this feature, please check:
1. Database migrations are properly applied
2. User has appropriate permissions (VA role)
3. Task is assigned to the user making the update


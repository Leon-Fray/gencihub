# Models System Documentation

## Overview

The Models System allows administrators to manage celebrity models and assign them to Virtual Assistants (VAs). Each model has their own data including a Google Drive link and bio, and VAs can be assigned multiple models.

## Database Schema

### Models Table (`public.models`)

Stores information about celebrity models:

| Column | Type | Description |
|--------|------|-------------|
| `id` | BIGINT | Primary key (auto-increment) |
| `name` | TEXT | Model name (unique) |
| `google_drive_link` | TEXT | Link to model's Google Drive folder |
| `bio` | TEXT | Model biography/description |
| `created_at` | TIMESTAMPTZ | When the model was added |
| `is_active` | BOOLEAN | Whether the model is active (default: true) |

### Model Assignments Table (`public.model_assignments`)

Junction table for many-to-many relationship between VAs and models:

| Column | Type | Description |
|--------|------|-------------|
| `id` | BIGINT | Primary key (auto-increment) |
| `va_id` | UUID | Reference to VA's profile |
| `model_id` | BIGINT | Reference to model |
| `assigned_at` | TIMESTAMPTZ | When the assignment was made |
| `assigned_by` | UUID | Admin who made the assignment |

**Constraint:** Each VA-Model pair is unique (prevents duplicate assignments)

## Initial Models

The system comes pre-configured with 4 models:

1. **Annie** - Talented model known for stunning photoshoots and vibrant personality
2. **Hailey** - Brings elegance and grace to every project
3. **Camila** - Known for versatile looks and professional approach
4. **Talina** - Combines natural beauty with strong social media presence

## Database Setup

To add the models system to your existing database:

### Option 1: Run the Migration (Recommended for existing databases)

```sql
-- Run this SQL file
\i supabase/migrations/add_models_system.sql
```

### Option 2: Fresh Setup

If setting up a new database, run:

```sql
\i supabase/setup.sql
```

This includes all tables including the models system.

## Admin Features

### Models Management Page (`/admin/models`)

The Models page provides:

- **Overview Statistics:**
  - Total models count
  - Active assignments count
  - VAs with models
  - Unassigned VAs

- **Models List:**
  - View all models with their details
  - See how many VAs are assigned to each model
  - Edit model information
  - Access Google Drive links

- **Model Assignments by VA:**
  - See which models are assigned to each VA
  - Quick navigation to manage assignments

### User Management Page (`/admin/users`)

Enhanced with model assignment features:

- **Assigned Models Column:**
  - View models assigned to each VA
  - Color-coded badges for easy identification
  - Remove model assignments with one click

- **Assign Model Button:**
  - Quick assignment dialog for VAs
  - Shows only available (unassigned) models
  - Prevents duplicate assignments

## API/Server Actions

### `getModels()`
Fetches all active models.

```typescript
const models = await getModels()
```

### `getVAModelAssignments(vaId: string)`
Gets all model assignments for a specific VA.

```typescript
const assignments = await getVAModelAssignments(vaId)
```

### `getAllVAsWithModels()`
Gets all VAs with their assigned models.

```typescript
const vasWithModels = await getAllVAsWithModels()
```

### `assignModelToVA(vaId: string, modelId: number, assignedBy: string)`
Assigns a model to a VA.

```typescript
const result = await assignModelToVA(vaId, modelId, currentUser.id)
if (result.success) {
  // Assignment successful
}
```

### `removeModelFromVA(vaId: string, modelId: number)`
Removes a model assignment from a VA.

```typescript
const result = await removeModelFromVA(vaId, modelId)
if (result.success) {
  // Removal successful
}
```

### `createModel(name: string, googleDriveLink: string, bio: string)`
Creates a new model.

```typescript
const result = await createModel('NewModel', 'https://...', 'Bio text')
```

### `updateModel(id: number, name: string, googleDriveLink: string, bio: string)`
Updates an existing model.

```typescript
const result = await updateModel(1, 'UpdatedName', 'https://...', 'New bio')
```

## UI Components

### `<AssignModelDialog />`
Modal dialog for assigning models to VAs. Used in the Users page.

**Props:**
- `vaId`: string - VA's user ID
- `vaName`: string - VA's display name
- `availableModels`: Model[] - Models not yet assigned to this VA
- `currentUser`: { id: string } - Current admin user

### `<CreateModelDialog />`
Modal dialog for creating new models. Used in the Models page.

### `<EditModelDialog />`
Modal dialog for editing existing models. Used in the Models page.

**Props:**
- `model`: Model - The model to edit

### `<RemoveModelButton />`
Button to remove a model assignment. Used inline in the Users page.

**Props:**
- `vaId`: string - VA's user ID
- `modelId`: number - Model ID to remove

## Row Level Security (RLS) Policies

### Models Table

- **VAs can view active models:** VAs can see all models where `is_active = true`
- **Admins can manage models:** Admins have full CRUD access

### Model Assignments Table

- **VAs can view their assigned models:** VAs can see their own assignments
- **Admins can view all assignments:** Admins can see all VA-model assignments
- **Admins can manage assignments:** Admins can create/delete assignments

## Workflow Example

### Assigning a Model to a VA

1. Navigate to **Admin → Users**
2. Find the VA you want to assign a model to
3. Click **"Assign Model"** button in their row
4. Select a model from the dropdown (only shows unassigned models)
5. Click **"Assign Model"** to confirm
6. The model badge appears in the VA's row

### Removing a Model from a VA

1. Navigate to **Admin → Users**
2. Find the VA with the model you want to remove
3. Click the **X** icon next to the model badge
4. Confirm the removal
5. The model badge is removed

### Adding a New Model

1. Navigate to **Admin → Models**
2. Click **"Create Model"** button
3. Fill in the model details:
   - Name
   - Google Drive Link
   - Bio
4. Click **"Create Model"**
5. The new model is now available for assignment

### Editing a Model

1. Navigate to **Admin → Models**
2. Find the model you want to edit
3. Click the **Edit** icon
4. Update the model details
5. Click **"Update Model"**

## Google Drive Links

Each model should have a Google Drive folder link where their content is stored. These links are:

- Displayed in the Models page with a quick access button
- Accessible to admins for content management
- Can be updated at any time via the Edit Model dialog

Update the placeholder Google Drive links with actual folder URLs for each model:

```sql
UPDATE public.models 
SET google_drive_link = 'https://drive.google.com/drive/folders/YOUR_ACTUAL_FOLDER_ID'
WHERE name = 'Annie';
```

## Future Enhancements

Potential features to add:

- [ ] Model performance metrics (posts, engagement)
- [ ] Model content approval workflow
- [ ] Bulk model assignment/removal
- [ ] Model categories/tags
- [ ] Model availability scheduling
- [ ] Content calendar per model
- [ ] Model-specific task templates

## Troubleshooting

### Models not showing up

1. Check if models are active: `SELECT * FROM models WHERE is_active = true;`
2. Verify RLS policies are in place
3. Ensure user has proper admin role

### Can't assign model to VA

1. Check if model is already assigned to that VA
2. Verify the VA role (not admin)
3. Check foreign key constraints

### Google Drive links not working

1. Ensure links are publicly accessible or shared with appropriate users
2. Verify link format is correct
3. Update links via Edit Model dialog

## Support

For issues or questions:
1. Check the database migration files
2. Review RLS policies
3. Check browser console for errors
4. Verify Supabase connection


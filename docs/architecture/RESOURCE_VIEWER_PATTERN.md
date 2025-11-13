# Resource Viewer Pattern

## Overview

This document describes the standardized pattern for viewing resources across all dashboard pages to prevent inconsistencies and ensure maintainability.

## Problem

Previously, each dashboard page implemented its own logic for viewing resources, leading to:
- Inconsistent behavior between pages
- Duplicate code that was hard to maintain
- Bugs where article resources would open in the wrong viewer
- Difficulty ensuring all pages stay in sync when making changes

## Solution

A shared hook `useResourceViewer` centralizes all resource viewing logic.

## Usage

### Import the Hook

```typescript
import { useResourceViewer } from '../../../../hooks/useResourceViewer';
```

### Initialize in Component

```typescript
// For pages that should track views (counselor, patient)
const {
  selectedResource,
  viewingArticle,
  isViewerOpen,
  isArticleViewerOpen,
  handleViewResource,
  handleCloseViewer,
  handleCloseArticleViewer,
  setViewingArticle,
  setIsArticleViewerOpen,
} = useResourceViewer(true); // true = track views

// For pages that shouldn't track views (admin)
const { ... } = useResourceViewer(false); // false = don't track views
```

### Use in Component

```typescript
// When user clicks "View" on a resource
<ResourceCard
  onView={(r) => handleViewResource(r)}
  // ... other props
/>

// Render viewers
{selectedResource && (
  <ResourceViewerModalV2
    resource={selectedResource}
    isOpen={isViewerOpen}
    onClose={handleCloseViewer}
    // ... other props
  />
)}

{viewingArticle && (
  <ArticleViewerV2
    article={viewingArticle}
    isOpen={isArticleViewerOpen}
    onClose={handleCloseArticleViewer}
    // ... other props
  />
)}
```

## How It Works

The hook automatically:
1. **Routes to the correct viewer** based on resource type:
   - `resource.type === 'article'` → Opens `ArticleViewerV2`
   - All other types → Opens `ResourceViewerModalV2`

2. **Tracks views** (if enabled) using `ResourcesApi.trackView()`

3. **Manages state** for both viewers consistently

## Pages Using This Pattern

✅ **Updated:**
- `apps/web/app/dashboard/counselor/resources/page.tsx`
- `apps/web/app/dashboard/admin/resources-review/page.tsx`
- `apps/web/app/dashboard/patient/resources/page.tsx`

## Rules

1. **Always use `useResourceViewer`** for new pages that display resources
2. **Never implement custom `handleViewResource` logic** - use the hook instead
3. **Don't duplicate state** - the hook provides all necessary state
4. **Use the provided handlers** - `handleViewResource`, `handleCloseViewer`, `handleCloseArticleViewer`

## Benefits

- ✅ **Consistency**: All pages behave the same way
- ✅ **Maintainability**: Changes in one place affect all pages
- ✅ **Type Safety**: TypeScript ensures correct usage
- ✅ **Less Code**: No duplicate logic across pages
- ✅ **Bug Prevention**: Impossible to forget article routing logic

## Migration Checklist

When updating an existing page:
- [ ] Import `useResourceViewer` hook
- [ ] Remove local state: `selectedResource`, `viewingArticle`, `isViewerOpen`, `isArticleViewerOpen`
- [ ] Remove local functions: `handleViewResource`, `handleCloseViewer`, `handleCloseArticleViewer`
- [ ] Initialize hook with appropriate `trackViews` parameter
- [ ] Use hook's handlers and state in component
- [ ] Test that articles open in `ArticleViewerV2` and other resources open in `ResourceViewerModalV2`


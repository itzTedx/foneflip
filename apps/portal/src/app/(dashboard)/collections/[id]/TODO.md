# TODO for Collections

## 1. Add "Delete Collection" in the Collection Form (Settings Tab)

- [x] In `CollectionSettings` (`form-sections/collection-settings.tsx`), add a "Delete Collection" button at the bottom (outside or below the last `<Card>`).
- [x] Show this button only if `form.getValues("id")` exists (i.e., edit mode).
- [ ] On click, open a confirmation modal (use your UI library’s modal/dialog).
- [ ] On confirm, call the `deleteCollection(id)` mutation (import from `actions/mutations`).
- [ ] On success:
  - Show a toast: "Collection deleted successfully".
  - Redirect to `/collections`.
- [ ] On error: Show an error toast.
- [ ] Disable the button if the collection is archived or a mutation is in progress.

## 2. UI/UX Improvements

- [ ] Add loading spinners and error states for all actions (create, update, delete, duplicate).
- [ ] Add toast notifications for all major actions.
- [ ] Add inline validation and error messages for all form fields.
- [ ] Make the collection list sortable by drag-and-drop (if not already).
- [ ] Add search and filter to the collections list (by name, status, tags).

## 3. Feature Enhancements

- [ ] Bulk actions: allow selecting multiple collections for delete/archive/status change.
- [ ] Archive/unarchive collections (toggle status between "active" and "archived").
- [ ] Expose "duplicate collection" in the UI (already implemented in backend).
- [ ] Support "draft" mode for collections (already in schema/settings).
- [ ] Allow editing and previewing SEO meta for each collection.
- [ ] Expose custom CTA and banner fields in the UI.

## 4. Settings & Metadata

- [ ] Allow editing all settings fields: featured, layout, showLabel, showBanner, showInNav, tags, internalNotes, customCTA.
- [ ] Add tooltips/help text for each setting.
- [ ] Show and allow changing collection status in the settings tab.

## 5. Performance & Caching

- [ ] Add cache monitoring UI for admins (see README for cache strategy).
- [ ] Add manual cache invalidation controls for admins.

## 6. Developer/Code Quality

- [ ] Add more unit/integration tests for collection actions.
- [ ] Ensure all code is type-safe and uses the latest schema/types.
- [ ] Refactor any duplicated logic in helpers/actions.

## 7. Documentation

- [ ] Update README and in-app docs for new features and workflows.
- [ ] Document caching and cache invalidation for collections.

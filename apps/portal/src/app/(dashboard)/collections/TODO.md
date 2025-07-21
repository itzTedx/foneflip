# TODOs for improving `page.tsx`

1. **Error Handling**
   - [ ] Add error boundaries or try/catch for `getCollections()` to handle API failures gracefully.
   - [ ] Display user-friendly error messages if collections fail to load.

2. **Loading State**
   - [ ] Add a loading spinner or skeleton UI for the initial fetch (not just the Suspense fallback for the sortable list).

3. **Pagination or Infinite Scroll**
   - [ ] Implement pagination or infinite scroll if the number of collections can be large.

4. **Search & Filter**
   - [ ] Add search and filter functionality to help users find specific collections.

5. **Sorting**
   - [ ] Allow sorting collections by name, date created, or other attributes.

6. **Bulk Actions**
   - [ ] Enable bulk selection and actions (delete, move, etc.) for collections.

7. **Accessibility**
   - [ ] Ensure all interactive elements are accessible (keyboard navigation, ARIA labels, etc.).
   - [ ] Improve color contrast and focus states.

8. **Performance**
   - [ ] Optimize data fetching (e.g., use SWR or React Query for caching and revalidation).
   - [ ] Memoize components where appropriate.

9. **Testing**
   - [ ] Add unit and integration tests for the page and its components.

10. **Code Quality**
    - [ ] Move inline components (like `CollectionsEmptyState`) to separate files for better maintainability.
    - [ ] Add TypeScript types/interfaces for collection objects if not already present.
    - [ ] Remove or implement commented-out code (e.g., `<ExportCsvButton />`).

11. **UI/UX Enhancements**
    - [ ] Add tooltips or help text for actions/buttons.
    - [ ] Show collection thumbnails or icons for better visual distinction.
    - [ ] Animate list reordering for better feedback.

12. **Feature Enhancements**
    - [ ] Allow editing and deleting collections directly from the list.
    - [ ] Add confirmation dialogs for destructive actions.

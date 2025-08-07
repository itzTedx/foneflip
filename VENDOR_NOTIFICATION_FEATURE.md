# Vendor Document Submission Notification Feature

## Overview

This feature automatically sends notifications to all admin users when a vendor successfully submits their onboarding documents (trade license and Emirates ID).

## Implementation Details

### Location
- **File**: `apps/portal/src/modules/vendors/actions/mutation.ts`
- **Function**: `updateVendorDocuments`

### How It Works

1. **Document Submission**: When a vendor completes the document upload form and submits their trade license and Emirates ID documents, the `updateVendorDocuments` function is called.

2. **Database Update**: The function:
   - Validates the submitted documents
   - Stores the documents in the database
   - Updates the vendor status to "pending_approval"

3. **Admin Notification**: After successful document storage, the system:
   - Queries the database for all users with "admin" role
   - Sends a notification to each admin user via the job queue
   - Uses the notification type "vendor_document_submission"

### Notification Details

- **Type**: `vendor_document_submission`
- **Message**: `"New vendor document submission from {vendorName} requires review."`
- **Recipients**: All users with "admin" role
- **Delivery**: Real-time via WebSocket + stored in database

### Technical Implementation

```typescript
// Send notifications to all admin users about the new vendor document submission
try {
  const adminUsers = await db.select({ id: users.id }).from(users).where(eq(users.role, "admin"));
  
  for (const adminUser of adminUsers) {
    await enqueue(JobType.Notification, {
      userId: adminUser.id,
      type: "vendor_document_submission",
      message: `New vendor document submission from ${vendor.businessName || vendor.slug} requires review.`,
    });
  }
  
  log.info("Sent notifications to admin users", { 
    vendorId: vendor.id, 
    adminCount: adminUsers.length,
    vendorName: vendor.businessName || vendor.slug 
  });
} catch (notificationError) {
  log.warn("Failed to send admin notifications", { notificationError });
}
```

### Dependencies Added

- `enqueue` and `JobType` from `@ziron/queue` package
- Uses existing notification infrastructure (Redis pub/sub, WebSocket server)

### Error Handling

- If notification sending fails, it logs a warning but doesn't affect the document submission process
- The vendor still gets a success response even if admin notifications fail

### Admin Experience

1. **Real-time Notification**: Admins receive instant notifications via WebSocket
2. **Database Storage**: Notifications are also stored in the database for persistence
3. **Notification UI**: Admins can view notifications in the notification bell component
4. **Action Required**: Admins can then review and approve/reject the vendor

### Testing

To test this feature:

1. Create a vendor account and complete the onboarding process
2. Upload documents in the documents form
3. Submit the form
4. Check that admin users receive notifications
5. Verify notifications appear in the admin notification UI

### Future Enhancements

- Add notification preferences for admins
- Include vendor details in notification metadata
- Add direct links to vendor review page in notifications
- Implement notification grouping for multiple submissions 
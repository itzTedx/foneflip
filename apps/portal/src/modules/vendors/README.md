# Real-Time Invitation Status Updates

This module implements real-time status updates for vendor invitations using WebSocket connections and Redis pub/sub.

## Architecture

### Components

1. **WebSocket Server** (`apps/ws-server/index.ts`)
   - Handles real-time connections for invitation updates
   - Manages invitation watchers (which sockets are watching which invitations)
   - Subscribes to Redis "invitation-updates" channel
   - Provides HTTP API for invitation updates

2. **Client Hook** (`hooks/use-invitation-updates.ts`)
   - `useInvitationUpdates`: Low-level hook for watching specific invitations
   - `useInvitationData`: High-level hook for managing invitation data with real-time updates

3. **Table Component** (`components/table/client.tsx`)
   - Uses `useInvitationData` hook for real-time data
   - Shows connection status indicator
   - Automatically updates when invitation status changes

4. **Background Jobs** (`apps/worker/src/jobs/invitations.ts`)
   - Scheduled job that runs every hour to check for expired invitations
   - Updates expired invitations and publishes real-time updates

### Data Flow

1. **Status Change Triggered** (e.g., invitation accepted, revoked, or expired)
2. **Database Updated** (invitation status changed in database)
3. **Real-time Update Published** (via Redis pub/sub or HTTP API)
4. **WebSocket Server Broadcasts** (to all connected clients watching that invitation)
5. **Client Updates** (table component receives update and re-renders)

## Usage

### Basic Real-Time Table

```tsx
import { useInvitationData } from "../hooks/use-invitation-updates";

function VendorInvitationsTable({ initialData }) {
  const { data, isConnected } = useInvitationData(initialData);
  
  return (
    <div>
      {/* Connection status indicator */}
      <div className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
      
      {/* Your table component using `data` */}
      <Table data={data} />
    </div>
  );
}
```

### Watching Specific Invitations

```tsx
import { useInvitationUpdates } from "../hooks/use-invitation-updates";

function InvitationWatcher({ invitationIds }) {
  const { isConnected, lastUpdate } = useInvitationUpdates({
    invitationIds,
    onUpdate: (update) => {
      console.log("Invitation updated:", update);
      // Handle the update
    },
  });
  
  return (
    <div>
      <p>Connection: {isConnected ? "Connected" : "Disconnected"}</p>
      {lastUpdate && (
        <p>Last update: {lastUpdate.invitationId} - {lastUpdate.status}</p>
      )}
    </div>
  );
}
```

## API Endpoints

### WebSocket Events

- `watch-invitation`: Start watching an invitation for updates
- `unwatch-invitation`: Stop watching an invitation
- `invitation-update`: Receive real-time updates

### HTTP API

- `POST /invitation-update`: Publish an invitation update
  ```json
  {
    "invitationId": "uuid",
    "status": "accepted|revoked|expired|pending",
    "usedAt": "2024-01-01T00:00:00Z",
    "revokedAt": "2024-01-01T00:00:00Z",
    "expiresAt": "2024-01-01T00:00:00Z"
  }
  ```

## Background Jobs

### Expired Invitations Job

- **Schedule**: Every hour (`0 * * * *`)
- **Purpose**: Check for and update expired invitations
- **Actions**:
  1. Find pending invitations where `expiresAt < now()`
  2. Update status to "expired"
  3. Publish real-time update
  4. Send notification to admin

## Configuration

### Environment Variables

- `REDIS_HOST`: Redis server host
- `REDIS_PORT`: Redis server port
- WebSocket server runs on port 4000 by default

### Redis Channels

- `invitation-updates`: Channel for invitation status updates
- `notifications`: Channel for general notifications

## Testing

### Demo Component

Use the `RealTimeDemo` component to test real-time updates:

```tsx
import { RealTimeDemo } from "./components/table/real-time-demo";

<RealTimeDemo invitationIds={invitationIds} />
```

### Manual Testing

1. Start the WebSocket server: `cd apps/ws-server && npm run dev`
2. Start the worker: `cd apps/worker && npm run dev`
3. Open the vendor invitations table
4. Use the demo component to simulate status changes
5. Watch for real-time updates in the table

## Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   - Check if WebSocket server is running on port 4000
   - Verify CORS settings in WebSocket server

2. **No Real-Time Updates**
   - Check Redis connection
   - Verify invitation IDs are being watched
   - Check browser console for WebSocket errors

3. **Background Jobs Not Running**
   - Ensure worker is running
   - Check Redis connection in worker
   - Verify job scheduler configuration

### Debugging

- Enable WebSocket server logging
- Check Redis pub/sub messages
- Monitor worker job execution logs
- Use browser dev tools to inspect WebSocket connections

## Performance Considerations

- WebSocket connections are lightweight
- Redis pub/sub is efficient for broadcasting
- Background jobs run infrequently (hourly)
- Table updates are optimized with React state management
- Connection status is shown to users for transparency

## Security

- WebSocket connections include user authentication
- Invitation updates are scoped to specific invitation IDs
- Background jobs run with appropriate permissions
- All database operations use proper validation 
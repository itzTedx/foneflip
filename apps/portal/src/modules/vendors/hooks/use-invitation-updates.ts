"use client";

import { useEffect, useRef, useState } from "react";

import { io, Socket } from "socket.io-client";

import { InvitationType } from "../types";

interface InvitationUpdate {
  invitationId: string;
  status: "pending" | "accepted" | "expired" | "revoked";
  usedAt?: Date;
  revokedAt?: Date;
  expiresAt?: Date;
}

interface UseInvitationUpdatesOptions {
  userId?: string;
  invitationIds?: string[];
  onUpdate?: (update: InvitationUpdate) => void;
}

export function useInvitationUpdates({ userId, invitationIds = [], onUpdate }: UseInvitationUpdatesOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<InvitationUpdate | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Initialize socket connection
    if (!socketRef.current) {
      socketRef.current = io("http://localhost:4000", {
        transports: ["websocket"],
        query: { userId },
      });

      socketRef.current.on("connect", () => {
        console.log("Invitation updates socket connected");
        setIsConnected(true);
      });

      socketRef.current.on("disconnect", () => {
        console.log("Invitation updates socket disconnected");
        setIsConnected(false);
      });

      socketRef.current.on("invitation-update", (update: InvitationUpdate) => {
        console.log("Received invitation update:", update);
        setLastUpdate(update);
        onUpdate?.(update);
      });
    }

    // Watch specific invitations
    if (socketRef.current && invitationIds.length > 0) {
      invitationIds.forEach((invitationId) => {
        socketRef.current?.emit("watch-invitation", invitationId);
      });
    }

    return () => {
      // Unwatch invitations on cleanup
      if (socketRef.current && invitationIds.length > 0) {
        invitationIds.forEach((invitationId) => {
          socketRef.current?.emit("unwatch-invitation", invitationId);
        });
      }
    };
  }, [userId, invitationIds.join(","), onUpdate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  return {
    isConnected,
    lastUpdate,
    socket: socketRef.current,
  };
}

// Hook for updating invitation data in real-time
export function useInvitationData(initialData: InvitationType[]) {
  const [data, setData] = useState<InvitationType[]>(initialData);

  const { isConnected } = useInvitationUpdates({
    invitationIds: initialData.map((invitation) => invitation.id).filter(Boolean) as string[],
    onUpdate: (update) => {
      setData((prevData) =>
        prevData.map((invitation) =>
          invitation.id === update.invitationId
            ? {
                ...invitation,
                status: update.status,
                usedAt: update.usedAt || invitation.usedAt,
                revokedAt: update.revokedAt || invitation.revokedAt,
                expiresAt: update.expiresAt || invitation.expiresAt,
              }
            : invitation
        )
      );
    },
  });

  return {
    data,
    isConnected,
  };
}

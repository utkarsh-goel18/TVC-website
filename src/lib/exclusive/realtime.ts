export interface RealtimeEventPayload {
  id: string;
  type:
    | "message_created"
    | "notification_created"
    | "task_updated"
    | "application_updated"
    | "member_updated";
  conversation_id?: string;
  recipient_ids?: string[];
  data: unknown;
  timestamp: string;
}

type Listener = (event: RealtimeEventPayload) => void;

class RealtimeHub {
  private listeners: Map<string, { memberId: string; callback: Listener }> =
    new Map();

  subscribe(
    clientId: string,
    memberId: string,
    callback: Listener
  ): () => void {
    this.listeners.set(clientId, { memberId, callback });
    return () => {
      this.listeners.delete(clientId);
    };
  }

  publish(event: RealtimeEventPayload, canMemberReceive?: (memberId: string) => boolean) {
    for (const [, sub] of this.listeners.entries()) {
      if (event.recipient_ids && !event.recipient_ids.includes(sub.memberId)) {
        continue;
      }
      if (canMemberReceive && !canMemberReceive(sub.memberId)) {
        continue;
      }
      try {
        sub.callback(event);
      } catch {
        // Ignore disconnected client
      }
    }
  }

  getOnlineMemberIds(): string[] {
    const ids = new Set<string>();
    for (const [, sub] of this.listeners.entries()) {
      ids.add(sub.memberId);
    }
    return Array.from(ids);
  }
}

const globalForRealtime = globalThis as unknown as {
  tvcRealtimeHub?: RealtimeHub;
};

export const realtimeHub =
  globalForRealtime.tvcRealtimeHub || new RealtimeHub();

if (process.env.NODE_ENV !== "production") {
  globalForRealtime.tvcRealtimeHub = realtimeHub;
}


import { NextRequest } from "next/server";
import { requireActiveMember } from "@/lib/exclusive/auth";
import { realtimeHub } from "@/lib/exclusive/realtime";
import { generateSecureToken } from "@/lib/exclusive/crypto";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = requireActiveMember(req);
  if (!auth.ok) return auth.response;

  const clientId = `sse-${generateSecureToken(8)}`;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (payload: unknown) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(payload)}\n\n`)
          );
        } catch {
          // Stream closed
        }
      };

      send({
        type: "connected",
        memberId: auth.member.id,
        onlineMemberIds: realtimeHub.getOnlineMemberIds(),
        timestamp: new Date().toISOString(),
      });

      const unsubscribe = realtimeHub.subscribe(
        clientId,
        auth.member.id,
        (event) => {
          send(event);
        }
      );

      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch {
          clearInterval(heartbeat);
        }
      }, 20000);

      req.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        unsubscribe();
        try {
          controller.close();
        } catch {
          // Already closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}


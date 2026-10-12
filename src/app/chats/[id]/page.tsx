import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { conversations } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { ChatRoom } from "@/components/chat-room";

export const dynamic = "force-dynamic";
export const metadata = { title: "گفتگو" };

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect("/auth?next=/chats");
  const { id } = await params;

  let adId: string | undefined;
  let allowed = false;
  try {
    const [conv] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id))
      .limit(1);
    if (conv && (conv.buyerId === user.id || conv.sellerId === user.id)) {
      allowed = true;
      adId = conv.listingId;
    }
  } catch {
    allowed = false;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8">
      <ChatRoom conversationId={id} adId={allowed ? adId : undefined} />
    </div>
  );
}

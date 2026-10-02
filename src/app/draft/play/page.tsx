import { redirect } from "next/navigation";

import { isDraftType } from "@/features/draft-room/draft-types";
import type { DraftConfig } from "@/features/draft-room/useDraft";
import { DraftRoom } from "@/features/draft-room/components/DraftRoom";

/**
 * Local (hotseat) draft room. Config is carried in the URL so the room is
 * shareable/reloadable without a backend. Persistence + real rooms arrive in
 * Week 2 at /draft/[roomId].
 */
export default async function PlayPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const name = typeof sp.name === "string" ? sp.name.trim() : "";
  const type = typeof sp.type === "string" ? sp.type : "";
  const a = typeof sp.a === "string" ? sp.a.trim() : "";
  const b = typeof sp.b === "string" ? sp.b.trim() : "";

  if (!name || !a || !b) {
    redirect("/draft/create");
  }
  // Standalone guard so `type` narrows to DraftType below (redirect returns never).
  if (!isDraftType(type)) {
    redirect("/draft/create");
  }

  const config: DraftConfig = { name, draftType: type, managers: [a, b] };
  return <DraftRoom config={config} />;
}

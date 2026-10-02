import { isDraftType, type DraftType } from "@/features/draft-room/draft-types";
import { requireUser, displayNameFor } from "@/features/auth/user";
import { CreateOnlineDraftForm } from "@/features/draft-room/components/CreateOnlineDraftForm";

// Depends on the authenticated user — never prerender.
export const dynamic = "force-dynamic";

export default async function NewDraftPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const user = await requireUser("/draft/new");
  const { type } = await searchParams;
  const initialType: DraftType | undefined = type && isDraftType(type) ? type : undefined;

  return (
    <div className="mx-auto max-w-3xl space-y-lg py-md">
      <header className="space-y-xs">
        <h1 className="font-display-xl text-headline-lg-mobile font-black uppercase italic text-on-surface md:text-headline-lg">
          Create an Online Draft
        </h1>
        <p className="font-sans text-body-lg text-on-surface-variant">
          Set the matchup, then share the link to bring in your opponent.
        </p>
      </header>
      <CreateOnlineDraftForm initialType={initialType} initialName={displayNameFor(user)} />
    </div>
  );
}

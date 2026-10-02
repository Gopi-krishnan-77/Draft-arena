import { isDraftType, type DraftType } from "@/features/draft-room/draft-types";
import { CreateDraftForm } from "@/features/draft-room/components/CreateDraftForm";

export default async function CreateDraftPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const initialType: DraftType | undefined = type && isDraftType(type) ? type : undefined;

  return (
    <div className="mx-auto max-w-3xl space-y-lg py-md">
      <header className="space-y-xs">
        <h1 className="font-display-xl text-headline-lg-mobile font-black uppercase italic text-on-surface md:text-headline-lg">
          Create a Draft
        </h1>
        <p className="font-sans text-body-lg text-on-surface-variant">
          Two managers, eleven picks each, one winner. Set it up and get on the clock.
        </p>
      </header>
      <CreateDraftForm initialType={initialType} />
    </div>
  );
}

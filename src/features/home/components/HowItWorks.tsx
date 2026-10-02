import { Users, ListOrdered, Trophy } from "lucide-react";

const STEPS = [
  {
    icon: Users,
    title: "Set up the duel",
    body: "Name your draft, pick a mode, and add both managers. Two enter — one leaves victorious.",
  },
  {
    icon: ListOrdered,
    title: "Snake draft your XI",
    body: "Take turns in snake order until both squads have eleven. Search fast, pick faster.",
  },
  {
    icon: Trophy,
    title: "Get the verdict",
    body: "The AI breaks down both teams and calls a winner — with receipts. (Coming Week 3.)",
  },
];

export function HowItWorks() {
  return (
    <section className="space-y-md">
      <div>
        <h2 className="font-display text-headline-lg-mobile font-black uppercase italic text-on-surface md:text-headline-lg">
          How it works
        </h2>
        <div className="mt-1 h-1 w-24 bg-primary" />
      </div>

      <div className="grid gap-sm md:grid-cols-3">
        {STEPS.map((step, i) => (
          <div
            key={step.title}
            className="flex flex-col gap-xs rounded-xl border-2 border-ink bg-surface-container-low p-md shadow-hard"
          >
            <div className="flex items-center gap-sm">
              <span className="flex size-10 items-center justify-center rounded-md border-2 border-ink bg-primary text-on-primary">
                <step.icon className="size-5" />
              </span>
              <span className="font-stats-num text-display-xl leading-none text-surface-container-highest">
                {i + 1}
              </span>
            </div>
            <h3 className="font-display text-headline-md font-bold uppercase text-on-surface">
              {step.title}
            </h3>
            <p className="font-sans text-body-md text-on-surface-variant">{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

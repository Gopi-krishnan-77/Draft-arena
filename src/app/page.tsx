import { Hero } from "@/features/home/components/Hero";
import { RecentDrafts } from "@/features/home/components/RecentDrafts";
import { DraftTypeGrid } from "@/features/home/components/DraftTypeGrid";
import { HowItWorks } from "@/features/home/components/HowItWorks";

export default function HomePage() {
  return (
    <div className="space-y-xl py-md">
      <Hero />
      <RecentDrafts />
      <DraftTypeGrid />
      <HowItWorks />
    </div>
  );
}

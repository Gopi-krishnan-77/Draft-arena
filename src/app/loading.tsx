import { PageLoader } from "@/components/shared/PageLoader";

/** Fallback for every route without its own loading state (home, login, create, join…). */
export default function Loading() {
  return <PageLoader />;
}

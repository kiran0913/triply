import { Suspense } from "react";
import { OnboardingForm } from "./OnboardingForm";

export const dynamic = "force-dynamic";

function OnboardingFallback() {
  return (
    <div className="min-h-screen bg-gradient-mesh flex items-center justify-center py-10">
      <div className="w-8 h-8 border-2 border-[#FF6B35] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<OnboardingFallback />}>
      <OnboardingForm />
    </Suspense>
  );
}

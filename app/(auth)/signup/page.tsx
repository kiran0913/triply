import { Suspense } from "react";
import { SignupForm } from "./SignupForm";

export const dynamic = "force-dynamic";

function SignupFallback() {
  return (
    <div className="min-h-screen bg-gradient-mesh flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#FF6B35] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<SignupFallback />}>
      <SignupForm />
    </Suspense>
  );
}

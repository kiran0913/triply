import { Suspense } from "react";
import { ProfilePageContent } from "./ProfilePageContent";

export const dynamic = "force-dynamic";

function ProfileFallback() {
  return (
    <div className="max-w-2xl mx-auto flex items-center justify-center min-h-[300px]">
      <div className="w-8 h-8 border-2 border-[#FF6B35] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileFallback />}>
      <ProfilePageContent />
    </Suspense>
  );
}

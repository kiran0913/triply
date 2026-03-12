"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    router.replace(`/profile/${user.id}`);
  }, [user, loading, router]);

  return (
    <div className="max-w-2xl mx-auto flex items-center justify-center min-h-[200px]">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gray-200" />
        <p className="text-gray-500">Loading your profile...</p>
      </div>
    </div>
  );
}

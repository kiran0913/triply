import Link from "next/link";

export default function PlaceholderPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-surface to-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold text-gray-900">Coming soon</h1>
        <p className="mt-2 text-gray-600">This page is under construction.</p>
        <Link
          href="/"
          className="mt-6 inline-block text-primary-600 font-medium hover:underline"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
}

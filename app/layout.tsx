import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Triply — Travel better, together.",
  description:
    "Triply helps travelers find companions, plan trips with AI, and travel safely.",
  openGraph: {
    title: "Triply — Travel better, together.",
    description:
      "Triply helps travelers find companions, plan trips with AI, and travel safely.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full w-full overflow-x-hidden">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

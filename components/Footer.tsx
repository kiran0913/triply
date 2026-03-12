"use client";

import Link from "next/link";
import { ShieldCheck, MessageCircle, MapPin } from "lucide-react";

export function Footer() {
  const links = [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ];
  const trust = [
    { icon: ShieldCheck, text: "Verified profiles" },
    { icon: MessageCircle, text: "Secure messaging" },
    { icon: MapPin, text: "Trusted destinations" },
  ];
  return (
    <footer className="bg-surface/80 border-t border-gray-100 mt-24">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <span className="font-bold text-xl text-[#FF6B35]">Triply</span>
            <p className="mt-3 text-gray-600 text-sm max-w-xs leading-relaxed">
              Triply is an AI-powered social travel platform that helps people find compatible travel companions, plan trips together, and explore the world safely.
            </p>
            <div className="flex flex-wrap gap-4 mt-6">
              {trust.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-gray-500">
                  <Icon className="w-4 h-4 text-[#FF6B35] flex-shrink-0" />
                  <span className="text-xs font-medium">{text}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Product</h4>
            <div className="flex flex-col gap-3">
              <Link
                href="/explore"
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                Explore Trips
              </Link>
              <Link
                href="/matches"
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                Find Matches
              </Link>
              <a
                href="/#how-it-works"
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                How it Works
              </a>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Company</h4>
            <div className="flex flex-col gap-3">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-sm">
            © 2025 Triply Technologies LLC
          </p>
          <p className="text-gray-400 text-sm">
            Travel better, together.
          </p>
        </div>
      </div>
    </footer>
  );
}

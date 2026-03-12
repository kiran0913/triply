"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Users,
  MessageCircle,
  ShieldCheck,
  Wallet,
  MapPin,
  ChevronRight,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/Button";
import { Footer } from "@/components/Footer";
import { MOCK_TESTIMONIALS } from "@/data/mockData";

const HERO_IMG =
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=600&fit=crop";
const FEATURES = [
  {
    icon: Users,
    title: "Smart Matching",
    desc: "Find travelers who match your style, budget, and dates.",
  },
  {
    icon: MapPin,
    title: "Destination Search",
    desc: "Browse trips by location and discover new adventures.",
  },
  {
    icon: MessageCircle,
    title: "In-App Chat",
    desc: "Plan your trip together with built-in messaging.",
  },
  {
    icon: ShieldCheck,
    title: "Verified Profiles",
    desc: "Travel safer with verified identity badges.",
  },
  {
    icon: Wallet,
    title: "Budget Compatibility",
    desc: "Filter by budget so everyone's on the same page.",
  },
  {
    icon: ShieldCheck,
    title: "Safety Preferences",
    desc: "Share safety preferences and travel with peace of mind.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full bg-white overflow-x-hidden">
      <Navbar variant="light" />
      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-hero" />
          <Image
            src={HERO_IMG}
            alt="Travelers"
            width={1200}
            height={600}
            className="absolute inset-0 w-full h-full object-cover opacity-35 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-900/40 via-transparent to-primary-800/20" />
          <div className="relative max-w-7xl mx-auto px-4 py-28 sm:py-36 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white/95 text-sm font-medium mb-8"
            >
              <Sparkles className="w-4 h-4" /> Trusted by 50,000+ travelers
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.15] tracking-tight max-w-4xl mx-auto"
            >
              Travel better, together.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
              className="mt-6 text-xl text-white/90 max-w-2xl mx-auto leading-relaxed"
            >
              Triply helps you find compatible travel companions, plan trips with AI, and explore the world safely.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button to="/signup" size="lg" className="shadow-premium">
                Get Started Free
              </Button>
              <Button
                to="/explore"
                variant="secondary"
                size="lg"
                className="!bg-white/15 !border-white/30 !text-white hover:!bg-white/25 backdrop-blur-sm"
              >
                Explore Trips
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-20 max-w-5xl mx-auto"
            >
              <div className="rounded-3xl overflow-hidden shadow-premium border border-white/20 bg-white/5 backdrop-blur-sm">
                <Image
                  src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=900&h=500&fit=crop"
                  alt="Travel matching"
                  width={900}
                  height={500}
                  className="w-full h-72 sm:h-96 object-cover"
                />
                <div className="p-5 sm:p-6 bg-white/10 flex items-center justify-center gap-6 text-white/90 text-sm font-medium flex-wrap">
                  <span className="flex items-center gap-2">📍 Map pins</span>
                  <span className="flex items-center gap-2">💬 Chat</span>
                  <span className="flex items-center gap-2">✈️ Trip matching</span>
                  <span className="flex items-center gap-2">✓ Verified</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="py-24 bg-gradient-warm scroll-mt-20"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto">
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight"
              >
                How it Works
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="mt-3 text-gray-600"
              >
                Get started in three simple steps
              </motion.p>
            </div>
            <div className="mt-20 grid md:grid-cols-3 gap-12 relative">
              {["Create Profile", "Discover Matches", "Chat & Plan"].map(
                (step, i) => (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="relative text-center"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-[#FF6B35] text-white flex items-center justify-center mx-auto text-2xl font-bold shadow-md">
                      {i + 1}
                    </div>
                    <h3 className="mt-6 text-xl font-semibold text-gray-900">
                      {step}
                    </h3>
                    <p className="mt-3 text-gray-500 text-sm leading-relaxed">
                      Complete your profile and preferences to find the best
                      matches for your next trip.
                    </p>
                    {i < 2 && (
                      <ChevronRight className="hidden md:block absolute right-0 top-8 w-6 h-6 text-gray-300" />
                    )}
                  </motion.div>
                )
              )}
            </div>
          </div>
        </section>

        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-20">
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight"
              >
                Key Features
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="mt-3 text-gray-600"
              >
                Everything you need to find companions, plan trips, and explore the world safely
              </motion.p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="group rounded-2xl bg-white p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-100 transition-all duration-200"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary-50 text-[#FF6B35] flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                    <f.icon className="w-6 h-6" />
                  </div>
                  <h3 className="mt-5 font-semibold text-gray-900">{f.title}</h3>
                  <p className="mt-2 text-gray-500 text-sm leading-relaxed">
                    {f.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 bg-surface/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-20">
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight"
              >
                Trusted by Travelers
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="mt-3 text-gray-600"
              >
                See what our community says
              </motion.p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {MOCK_TESTIMONIALS.map((t, i) => (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 min-w-0"
                >
                  <div className="flex gap-1 text-amber-400">
                    {Array(t.rating)
                      .fill(null)
                      .map((_, j) => (
                        <span key={j}>★</span>
                      ))}
                  </div>
                  <p className="mt-5 text-gray-700 leading-relaxed">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center font-semibold text-primary-700">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{t.name}</p>
                      <p className="text-sm text-gray-500">{t.location}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 bg-gradient-hero">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl font-bold text-white tracking-tight"
            >
              Ready to travel better, together?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-4 text-white/90"
            >
              Join thousands of travelers on Triply finding their perfect match.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button
                to="/signup"
                size="lg"
                className="!bg-white/20 !border-white/30 !text-white hover:!bg-white/30 shadow-premium"
              >
                Get Started Free
              </Button>
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 text-white font-medium hover:text-white/90 transition-colors"
              >
                Explore trips <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

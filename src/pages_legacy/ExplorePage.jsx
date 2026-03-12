import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Search } from "lucide-react";
import { Button } from "../components/Button";
import { MOCK_TRIPS } from "../data/mockData";

export default function ExplorePage() {
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Explore trips</h1>
        <Button to="/create" className="flex items-center gap-2"><Plus className="w-4 h-4" /> Create trip</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by destination, dates, or style..."
          className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 bg-surface/50 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 focus:bg-white transition-all" />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_TRIPS.map((t) => (
          <motion.div key={t.id} whileHover={{ y: -4 }} className="rounded-2xl bg-white shadow-card border border-gray-100 overflow-hidden hover:shadow-elevated transition-all duration-200">
            <div className="aspect-[16/10] relative">
              <img src={t.image} alt={t.destination} className="w-full h-full object-cover" />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                <h3 className="font-semibold text-white">{t.destination}</h3>
                <p className="text-sm text-white/90">{t.dates} • {t.budget}</p>
              </div>
            </div>
            <div className="p-4">
              <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-lg">{t.style}</span>
              <p className="text-gray-500 text-sm mt-2">Looking for {t.travelers} travel {t.travelers === 1 ? "buddy" : "buddies"}</p>
              <Button to="/matches" variant="secondary" size="sm" className="mt-4 w-full">Find matches</Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

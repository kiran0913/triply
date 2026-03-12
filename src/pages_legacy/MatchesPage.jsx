import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bookmark, MessageCircle, SlidersHorizontal, Grid, List } from "lucide-react";
import { Button } from "../components/Button";
import { MOCK_MATCHES } from "../data/mockData";

export default function MatchesPage() {
  const [matches, setMatches] = useState(MOCK_MATCHES);
  const [current, setCurrent] = useState(0);
  const [view, setView] = useState("cards");
  const [showFilters, setShowFilters] = useState(false);

  const currentMatch = matches[current];
  const pass = () => current < matches.length - 1 && setCurrent(current + 1);
  const save = () => current < matches.length - 1 && setCurrent(current + 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Find Your Perfect Travel Match</h1>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </Button>
          <div className="flex rounded-xl border border-gray-200 overflow-hidden">
            <button onClick={() => setView("cards")} className={`p-2 ${view === "cards" ? "bg-primary-50 text-primary-600" : "text-gray-500"}`}><Grid className="w-4 h-4" /></button>
            <button onClick={() => setView("list")} className={`p-2 ${view === "list" ? "bg-primary-50 text-primary-600" : "text-gray-500"}`}><List className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {showFilters && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="rounded-2xl bg-white p-6 shadow-elevated border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Filters</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {["Destination", "Date range", "Budget", "Gender", "Age range", "Travel style", "Interests", "Verified only", "Language", "Group size"].map((f) => (
              <div key={f}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{f}</label>
                <input type="text" placeholder={`Select ${f.toLowerCase()}`} className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm" />
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {view === "cards" ? (
        <div className="flex flex-col items-center">
          <div className="w-full max-w-md aspect-[3/4] relative">
            <AnimatePresence mode="wait">
              {currentMatch && (
                <motion.div key={currentMatch.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, x: -100 }} className="absolute inset-0 rounded-3xl overflow-hidden shadow-premium bg-white border border-gray-100">
                  <div className="relative h-full">
                    <img src={currentMatch.image} alt={currentMatch.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <div className="flex items-center justify-between mb-2">
                        <h2 className="text-2xl font-bold">{currentMatch.name}, {currentMatch.age}</h2>
                        <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full font-semibold">{currentMatch.matchPercent}% match</span>
                      </div>
                      {currentMatch.verified && <span className="text-xs bg-green-500/80 px-2 py-0.5 rounded-full">Verified</span>}
                      <p className="text-white/90 mt-2">{currentMatch.destination} • {currentMatch.dates}</p>
                      <p className="text-white/90 text-sm">{currentMatch.budget}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {currentMatch.travelStyle.map((s) => <span key={s} className="bg-white/20 px-2 py-1 rounded-lg text-xs">{s}</span>)}
                      </div>
                      <p className="mt-3 text-sm text-white/90">{currentMatch.bio}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {currentMatch.interests.map((i) => <span key={i} className="bg-white/10 px-2 py-0.5 rounded text-xs">{i}</span>)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="flex items-center justify-center gap-5 mt-8">
            <button onClick={pass} className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-all shadow-soft">
              <X className="w-6 h-6" />
            </button>
            <button onClick={save} className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center hover:bg-amber-100 transition-all shadow-soft">
              <Bookmark className="w-6 h-6" />
            </button>
            {currentMatch && (
              <Button to={`/profile/${currentMatch.id}`} className="w-14 h-14 rounded-2xl !p-0 flex items-center justify-center">
                <MessageCircle className="w-6 h-6" />
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {matches.map((m) => (
            <motion.div key={m.id} whileHover={{ y: -2 }} className="rounded-2xl bg-white shadow-card border border-gray-100 overflow-hidden hover:shadow-elevated transition-all duration-200">
              <div className="aspect-[4/3] relative">
                <img src={m.image} alt={m.name} className="w-full h-full object-cover" />
                <span className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl text-sm font-semibold text-primary-600 shadow-soft">{m.matchPercent}% match</span>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">{m.name}, {m.age}</h3>
                  {m.verified && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Verified</span>}
                </div>
                <p className="text-sm text-gray-500">{m.destination} • {m.dates}</p>
                <div className="flex gap-2 mt-4">
                  <Button variant="ghost" size="sm" className="flex-1">Pass</Button>
                  <Button variant="secondary" size="sm" className="flex-1">Save</Button>
                  <Button to={`/profile/${m.id}`} size="sm" className="flex-1">Connect</Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

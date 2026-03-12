import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, MessageCircle } from "lucide-react";
import { Card } from "../components/Card";
import { MOCK_MATCHES, MOCK_TRIPS, MOCK_DESTINATIONS, MOCK_MESSAGES } from "../data/mockData";

export default function DashboardPage() {
  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Welcome back, Jane</h1>
        <p className="text-gray-600 mt-1">Find your perfect travel buddy for your next adventure</p>
      </section>

      <Card className="bg-gradient-to-r from-primary-600 to-primary-500 text-white border-0 shadow-elevated p-6">
        <h2 className="text-lg font-semibold">Upcoming trip plans</h2>
        <p className="text-white/90 text-sm mt-1">Bali, Indonesia — Dec 15–28</p>
        <Link to="/chat" className="inline-flex items-center gap-2 mt-4 text-sm font-medium hover:underline">
          View details <ArrowRight className="w-4 h-4" />
        </Link>
      </Card>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Suggested matches</h2>
          <Link to="/matches" className="text-primary-600 font-medium text-sm hover:underline">View all</Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {MOCK_MATCHES.slice(0, 3).map((m) => (
            <motion.div key={m.id} whileHover={{ y: -2 }} className="rounded-2xl bg-white shadow-card border border-gray-100 overflow-hidden hover:shadow-elevated transition-all duration-200">
              <div className="aspect-[4/3] bg-gray-200 relative">
                <img src={m.image} alt={m.name} className="w-full h-full object-cover" />
                <span className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl text-sm font-semibold text-primary-600 shadow-soft">{m.matchPercent}% match</span>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">{m.name}, {m.age}</h3>
                  {m.verified && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Verified</span>}
                </div>
                <p className="text-sm text-gray-500 mt-1">{m.destination} • {m.dates}</p>
                <Link to={`/profile/${m.id}`} className="mt-3 inline-flex items-center gap-1 text-primary-600 text-sm font-medium hover:underline">
                  View profile <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Popular destinations</h2>
        <div className="grid sm:grid-cols-3 gap-5">
          {MOCK_DESTINATIONS.map((d) => (
            <motion.div key={d.name} whileHover={{ y: -2 }} className="rounded-2xl overflow-hidden shadow-card border border-gray-100 relative group cursor-pointer hover:shadow-elevated transition-all duration-200">
              <img src={d.image} alt={d.name} className="w-full h-32 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="font-semibold">{d.name}</h3>
                <p className="text-sm text-white/90">{d.travelers} travelers</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Recent messages</h2>
          <Link to="/chat" className="text-primary-600 font-medium text-sm hover:underline">View all</Link>
        </div>
        <Card>
          {MOCK_MESSAGES.map((msg) => (
            <Link key={msg.id} to="/chat" className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 -mx-6 px-6 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center font-semibold text-primary-700">{msg.from[0]}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{msg.from}</span>
                  <span className="text-xs text-gray-400">{msg.time}</span>
                </div>
                <p className="text-sm text-gray-500 truncate">{msg.preview}</p>
              </div>
              {msg.unread && <span className="w-2 h-2 rounded-full bg-primary-600" />}
            </Link>
          ))}
        </Card>
      </section>

      <Card className="bg-amber-50/80 border-amber-100 shadow-soft">
        <h3 className="font-semibold text-gray-900">Travel safety tips</h3>
        <p className="text-sm text-gray-600 mt-2">Always meet in public first. Share your itinerary with someone you trust. Verify your match&apos;s profile before meeting.</p>
      </Card>
    </div>
  );
}

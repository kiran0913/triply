import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageCircle, Bookmark, Flag, MapPin, ShieldCheck } from "lucide-react";
import { Button } from "../components/Button";
import { MOCK_MATCHES } from "../data/mockData";

export default function ProfilePage() {
  const { id } = useParams();
  const user = MOCK_MATCHES.find((m) => m.id === id) || MOCK_MATCHES[0];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="rounded-3xl overflow-hidden shadow-elevated border border-gray-100 bg-white">
        <div className="aspect-[4/3] relative">
          <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h1 className="text-2xl font-bold">{user.name}, {user.age}</h1>
            <p className="flex items-center gap-1 text-white/90"><MapPin className="w-4 h-4" /> {user.location}</p>
            {user.verified && (
              <span className="inline-flex items-center gap-1 mt-2 bg-green-500/80 px-3 py-1 rounded-full text-sm font-medium">
                <ShieldCheck className="w-4 h-4" /> Verified
              </span>
            )}
          </div>
        </div>
        <div className="p-6">
          <p className="text-gray-600">{user.bio}</p>
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-gray-900">Travel style</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {user.travelStyle.map((s) => <span key={s} className="px-3 py-1 rounded-xl bg-primary-50 text-primary-700 text-sm font-medium">{s}</span>)}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-500">Destination</span><p className="font-medium">{user.destination}</p></div>
            <div><span className="text-gray-500">Dates</span><p className="font-medium">{user.dates}</p></div>
            <div><span className="text-gray-500">Budget</span><p className="font-medium">{user.budget}</p></div>
            <div><span className="text-gray-500">Interests</span><p className="font-medium">{user.interests.join(", ")}</p></div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button to="/chat" className="flex-1 flex items-center justify-center gap-2"><MessageCircle className="w-4 h-4" /> Message</Button>
            <Button variant="secondary" className="flex items-center gap-2"><Bookmark className="w-4 h-4" /> Save Profile</Button>
            <Button variant="ghost" className="text-gray-500 flex items-center gap-2"><Flag className="w-4 h-4" /> Report</Button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-card border border-gray-100 hover:shadow-elevated transition-all duration-200">
        <h3 className="font-semibold text-gray-900">Reviews & references</h3>
        <p className="text-gray-500 text-sm mt-2">No reviews yet. Connect to leave a reference after your trip.</p>
      </div>
    </div>
  );
}

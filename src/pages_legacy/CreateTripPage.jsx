import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../components/Button";
import { TRAVEL_STYLES, INTERESTS } from "../data/mockData";

export default function CreateTripPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    destination: "", startDate: "", endDate: "", budget: "", style: [], interests: [],
    peopleWanted: "1", description: "", safetyNotes: "", accommodation: "Flexible",
  });

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggle = (k, v) => setForm((f) => ({ ...f, [k]: f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v] }));

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/explore");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-8">Create a trip</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
          <input type="text" value={form.destination} onChange={(e) => update("destination", e.target.value)} placeholder="e.g. Bali, Indonesia" required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start date</label>
            <input type="date" value={form.startDate} onChange={(e) => update("startDate", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End date</label>
            <input type="date" value={form.endDate} onChange={(e) => update("endDate", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Estimated budget</label>
          <input type="text" value={form.budget} onChange={(e) => update("budget", e.target.value)} placeholder="e.g. $1,200"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Travel style</label>
          <div className="flex flex-wrap gap-2">
            {TRAVEL_STYLES.map((s) => (
              <button key={s} type="button" onClick={() => toggle("style", s)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${form.style.includes(s) ? "bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-soft" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>{s}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Interests</label>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((i) => (
              <button key={i} type="button" onClick={() => toggle("interests", i)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${form.interests.includes(i) ? "bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-soft" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>{i}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Number of travel buddies wanted</label>
          <select value={form.peopleWanted} onChange={(e) => update("peopleWanted", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all">
            {[1, 2, 3, 4, "5+"].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={4} placeholder="Describe your trip and what you're looking for"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Safety notes</label>
          <input type="text" value={form.safetyNotes} onChange={(e) => update("safetyNotes", e.target.value)} placeholder="Any safety preferences or requirements"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Accommodation preference</label>
          <select value={form.accommodation} onChange={(e) => update("accommodation", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all">
            {["Flexible", "Private room", "Shared room", "Hostel", "Hotel"].map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <Button type="submit" className="w-full">Create trip</Button>
      </form>
    </div>
  );
}

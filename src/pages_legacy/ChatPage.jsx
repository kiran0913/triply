import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Paperclip, Smile, MapPin, Calendar, Wallet, CheckSquare } from "lucide-react";
import { MOCK_MATCHES } from "../data/mockData";

export default function ChatPage() {
  const [msg, setMsg] = useState("");
  const [messages] = useState([
    { id: 1, from: "them", text: "Hey! Excited about Bali?", time: "10:32" },
    { id: 2, from: "me", text: "Yes! Dec 15 works for me. What about accommodation?", time: "10:35" },
    { id: 3, from: "them", text: "I found a great villa in Ubud. $80/night split?", time: "10:38" },
  ]);

  const selected = MOCK_MATCHES[0];

  return (
    <div className="h-[calc(100vh-12rem)] md:h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-4">
      <div className="flex-shrink-0 lg:w-80 border border-gray-100 bg-white rounded-2xl shadow-card overflow-hidden hidden lg:block">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Conversations</h3>
        </div>
        {MOCK_MATCHES.map((m) => (
          <div key={m.id} className="flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-50">
            <img src={m.image} alt={m.name} className="w-10 h-10 rounded-full object-cover" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{m.name}</p>
              <p className="text-sm text-gray-500 truncate">Last message...</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex-1 flex flex-col min-h-0 bg-white rounded-2xl shadow-elevated border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-gray-100">
          <img src={selected.image} alt={selected.name} className="w-10 h-10 rounded-full object-cover" />
          <div>
            <h3 className="font-semibold text-gray-900">{selected.name}</h3>
            <p className="text-xs text-gray-500">Bali • Dec 15–28</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${m.from === "me" ? "bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-br-md shadow-soft" : "bg-gray-100 text-gray-900 rounded-bl-md"}`}>
                <p>{m.text}</p>
                <p className={`text-xs mt-1 ${m.from === "me" ? "text-white/80" : "text-gray-500"}`}>{m.time}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-100 flex items-center gap-2">
          <button className="p-2 rounded-lg hover:bg-gray-100"><Paperclip className="w-5 h-5 text-gray-500" /></button>
          <input type="text" value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Type a message..."
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all" />
          <button className="p-2 rounded-lg hover:bg-gray-100"><Smile className="w-5 h-5 text-gray-500" /></button>
          <button className="p-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-soft hover:shadow-elevated transition-all"><Send className="w-5 h-5" /></button>
        </div>
      </div>

      <div className="hidden xl:block w-80 flex-shrink-0 bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Trip planning</h3>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-primary-600" />
            <div><p className="text-sm font-medium">Destination</p><p className="text-gray-500">Bali, Indonesia</p></div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-primary-600" />
            <div><p className="text-sm font-medium">Dates</p><p className="text-gray-500">Dec 15 – 28, 2024</p></div>
          </div>
          <div className="flex items-center gap-3">
            <Wallet className="w-5 h-5 text-primary-600" />
            <div><p className="text-sm font-medium">Budget split</p><p className="text-gray-500">$600 each</p></div>
          </div>
          <div>
            <p className="text-sm font-medium mb-2">Accommodation ideas</p>
            <p className="text-gray-500 text-sm">Villa in Ubud — $80/night</p>
          </div>
          <div>
            <p className="text-sm font-medium mb-2 flex items-center gap-2"><CheckSquare className="w-4 h-4" /> Checklist</p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>☐ Flights booked</li>
              <li>☐ Accommodation confirmed</li>
              <li>☐ Activities planned</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

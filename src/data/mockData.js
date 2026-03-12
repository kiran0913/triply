export const MOCK_MATCHES = [
  { id: "1", name: "Sarah K.", age: 28, location: "San Francisco", destination: "Bali", dates: "Dec 15–28", budget: "$1,200", travelStyle: ["Adventure", "Cultural"], bio: "Love hiking and local food. First time in Southeast Asia!", interests: ["Hiking", "Food", "Photography"], matchPercent: 94, verified: true, image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop" },
  { id: "2", name: "James M.", age: 26, location: "London", destination: "Tokyo", dates: "Jan 10–22", budget: "£1,500", travelStyle: ["Budget", "Cultural"], bio: "Solo backpacker. Into street food and hidden gems.", interests: ["Food", "Museums", "Nightlife"], matchPercent: 88, verified: false, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop" },
  { id: "3", name: "Emma L.", age: 24, location: "Sydney", destination: "New Zealand", dates: "Feb 1–14", budget: "AUD 2,000", travelStyle: ["Adventure", "Backpacking"], bio: "Hiking enthusiast. Looking for road trip buddies.", interests: ["Hiking", "Road Trips", "Photography"], matchPercent: 91, verified: true, image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop" },
];

export const MOCK_TRIPS = [
  { id: "t1", destination: "Bali, Indonesia", dates: "Dec 15–28", budget: "$1,200", style: "Adventure", travelers: 2, image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&h=400&fit=crop" },
  { id: "t2", destination: "Tokyo, Japan", dates: "Jan 10–22", budget: "£1,500", style: "Cultural", travelers: 3, image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&h=400&fit=crop" },
  { id: "t3", destination: "Reykjavik, Iceland", dates: "Mar 5–12", budget: "€1,800", style: "Adventure", travelers: 2, image: "https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=600&h=400&fit=crop" },
];

export const MOCK_DESTINATIONS = [
  { name: "Bali", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&fit=crop", travelers: 12 },
  { name: "Tokyo", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop", travelers: 8 },
  { name: "Barcelona", image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400&h=300&fit=crop", travelers: 15 },
];

export const MOCK_MESSAGES = [
  { id: "m1", from: "Sarah K.", preview: "Hey! Excited about Bali?", time: "2m ago", unread: true },
  { id: "m2", from: "James M.", preview: "Found a great hostel in Shibuya", time: "1h ago", unread: false },
];

export const MOCK_TESTIMONIALS = [
  { name: "Alex T.", location: "NYC", text: "Found my perfect travel buddy for Japan. We had an amazing time!", rating: 5 },
  { name: "Maria S.", location: "Madrid", text: "Safe, fun, and so easy to use. Highly recommend!", rating: 5 },
  { name: "David L.", location: "Berlin", text: "Met two travel buddies through the app. Best trip ever.", rating: 5 },
];

export const TRAVEL_STYLES = ["Adventure", "Luxury", "Budget", "Backpacking", "Cultural", "Relaxed"];
export const INTERESTS = ["Hiking", "Beaches", "Food", "Nightlife", "Museums", "Photography", "Shopping", "Road Trips"];

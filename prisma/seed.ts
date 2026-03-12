import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {

  // Create hashed password
  const hashedPassword = await bcrypt.hash("password123", 12);

  /*
  =============================
  CREATE USERS
  =============================
  */

  const user0 = await prisma.user.upsert({
    where: { email: "jane@example.com" },
    update: { emailVerified: new Date(), profileCompleted: true, photoVerified: true, verificationLevel: "verified" },
    create: {
      email: "jane@example.com",
      password: hashedPassword,
      name: "Jane",
      profilePhoto:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
      bio: "Love exploring new places and meeting fellow travelers.",
      location: "New York",
      budgetRange: "Medium",
      interests: ["Hiking", "Food", "Photography", "Cultural"],
      travelStyle: ["Adventure", "Cultural"],
      languages: ["English"],
      verified: true,
      emailVerified: new Date(),
      profileCompleted: true,
      photoVerified: true,
      verificationLevel: "verified",
    },
  });

  const user1 = await prisma.user.upsert({
    where: { email: "sarah@example.com" },
    update: { emailVerified: new Date(), profileCompleted: true, photoVerified: true, verificationLevel: "verified" },
    create: {
      email: "sarah@example.com",
      password: hashedPassword,
      name: "Sarah K.",
      profilePhoto:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
      bio: "Love hiking and local food. First time in Southeast Asia!",
      location: "San Francisco",
      budgetRange: "Medium",
      interests: ["Hiking", "Food", "Photography"],
      travelStyle: ["Adventure", "Cultural"],
      languages: ["English"],
      verified: true,
      emailVerified: new Date(),
      profileCompleted: true,
      photoVerified: true,
      verificationLevel: "verified",
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "james@example.com" },
    update: { emailVerified: new Date(), profileCompleted: true, photoVerified: true, verificationLevel: "basic" },
    create: {
      email: "james@example.com",
      password: hashedPassword,
      name: "James M.",
      profilePhoto:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      bio: "Solo backpacker. Into street food and hidden gems.",
      location: "London",
      budgetRange: "Budget",
      interests: ["Food", "Museums", "Nightlife"],
      travelStyle: ["Budget", "Cultural"],
      languages: ["English"],
      verified: false,
      emailVerified: new Date(),
      profileCompleted: true,
      photoVerified: true,
      verificationLevel: "basic",
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: "emma@example.com" },
    update: { emailVerified: new Date(), profileCompleted: true, photoVerified: true, verificationLevel: "verified" },
    create: {
      email: "emma@example.com",
      password: hashedPassword,
      name: "Emma L.",
      profilePhoto:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
      bio: "Hiking enthusiast. Looking for road trip buddies.",
      location: "Sydney",
      budgetRange: "Medium",
      interests: ["Hiking", "Road Trips", "Photography"],
      travelStyle: ["Adventure", "Backpacking"],
      languages: ["English"],
      verified: true,
      emailVerified: new Date(),
      profileCompleted: true,
      photoVerified: true,
      verificationLevel: "verified",
    },
  });

  /*
  =============================
  CREATE TRIPS
  =============================
  */

  const trip1 = await prisma.trip.create({
    data: {
      title: "Bali Adventure",
      destination: "Bali, Indonesia",
      startDate: new Date("2026-12-15"),
      endDate: new Date("2026-12-28"),
      budget: "$1,200",
      travelStyle: "Adventure",
      description: "Exploring Ubud and beaches",
      hostUserId: user1.id,
      status: "OPEN",
      members: {
        create: {
          userId: user1.id,
          role: "HOST",
        },
      },
    },
  });

  const trip2 = await prisma.trip.create({
    data: {
      title: "Tokyo Cultural Trip",
      destination: "Tokyo, Japan",
      startDate: new Date("2027-01-10"),
      endDate: new Date("2027-01-22"),
      budget: "£1,500",
      travelStyle: "Cultural",
      description: "Street food and temples",
      hostUserId: user2.id,
      status: "OPEN",
      members: {
        create: {
          userId: user2.id,
          role: "HOST",
        },
      },
    },
  });

  /*
  =============================
  CREATE MATCHES
  =============================
  */

  await prisma.match.createMany({
    data: [
      { user1Id: user0.id, user2Id: user1.id, matchScore: 94 },
      { user1Id: user0.id, user2Id: user2.id, matchScore: 88 },
      { user1Id: user0.id, user2Id: user3.id, matchScore: 91 },
    ],
    skipDuplicates: true,
  });

  /*
  =============================
  CREATE CONVERSATION
  =============================
  */

  const conv = await prisma.conversation.create({
    data: {
      user1Id: user0.id,
      user2Id: user1.id,
      lastMessageAt: new Date(),
    },
  });

  /*
  =============================
  CREATE MESSAGES
  =============================
  */

  await prisma.message.create({
    data: {
      conversationId: conv.id,
      senderId: user1.id,
      content: "Hey! Excited about Bali?",
      read: false,
    },
  });

  await prisma.message.create({
    data: {
      conversationId: conv.id,
      senderId: user0.id,
      content: "Yes! Dec 15 works for me. What about accommodation?",
      read: true,
    },
  });

  /*
  =============================
  FINISH
  =============================
  */

  console.log("Seed completed successfully:", {
    users: [user0.email, user1.email, user2.email, user3.email],
    trips: [trip1.title, trip2.title],
    matches: 3,
    messages: 2,
  });
}

/*
=================================
RUN SCRIPT
=================================
*/

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().optional(),
});

export const createTripSchema = z.object({
  title: z.string().min(1, "Title is required"),
  destination: z.string().min(1, "Destination is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  budget: z.string().optional(),
  travelStyle: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(["DRAFT", "OPEN", "CLOSED"]).optional(),
});

export const updateUserSchema = z.object({
  name: z.string().optional(),
  profilePhoto: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  languages: z.array(z.string()).optional(),
  travelStyle: z.array(z.string()).optional(),
  budgetRange: z.string().optional(),
  interests: z.array(z.string()).optional(),
});

export const reportSchema = z.object({
  reportedUserId: z.string().min(1, "Reported user is required"),
  reason: z.string().optional(),
});

export const messageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty"),
});

export const reviewSchema = z.object({
  reviewedUserId: z.string().min(1, "Reviewed user is required"),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().optional(),
  tripId: z.string().optional(),
});

export const aiTripPlanSchema = z.object({
  destination: z.string().min(1, "Destination is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  budget: z.string().optional(),
  travelStyle: z.string().optional(),
  interests: z.array(z.string()).optional(),
});

export const itineraryItemSchema = z.object({
  dayNumber: z.coerce.number().int().min(1),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  costEstimate: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  position: z.coerce.number().int().min(0).optional(),
});

export const itineraryCommentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty"),
});

export const copilotMessageSchema = z.object({
  tripId: z.string().min(1, "Trip ID is required"),
  message: z.string().min(1, "Message cannot be empty").max(2000),
});

export const createStorySchema = z.object({
  tripId: z.string().min(1, "Trip ID is required"),
  title: z.string().min(1, "Title is required").max(120),
  content: z.string().min(1, "Content is required").max(5000),
  photos: z.array(z.string().url()).max(10).optional(),
  highlights: z.array(z.string().max(100)).max(20).optional(),
});

export const storyCommentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(1000),
});

export const assistantMessageSchema = z.object({
  message: z.string().min(1, "Message cannot be empty").max(2000),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .max(20)
    .optional(),
});

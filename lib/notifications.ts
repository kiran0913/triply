import { prisma } from "@/lib/prisma";

type CreateNotificationParams = {
  userId: string;
  type: "message" | "trip_join" | "profile_saved";
  title: string;
  body?: string;
  link?: string;
};

export async function createNotification(params: CreateNotificationParams) {
  try {
    await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        body: params.body ?? null,
        link: params.link ?? null,
      },
    });
  } catch (e) {
    console.error("Create notification error:", e);
  }
}

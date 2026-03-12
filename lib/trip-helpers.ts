import { prisma } from "./prisma";

export async function isTripMember(tripId: string, userId: string): Promise<boolean> {
  const m = await prisma.tripMember.findUnique({
    where: { tripId_userId: { tripId, userId } },
  });
  return !!m;
}

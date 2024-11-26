import { prisma } from "@/lib/globals";
import { hostSchema } from "@/lib/schema";
import { notFound } from "next/navigation";
import { RoomList } from "../../_components/RoomList";

export default async function HostRooms({ params }: { params: Promise<{ host: string }> }) {
    const host = hostSchema.safeParse((await params).host.toUpperCase()).data ?? notFound();
    const rooms = await prisma.room.findMany({
        where: { host },
        include: { jobCreator: true },
        orderBy: { jobCreatedAt: "desc" },
    });
    return <RoomList rooms={rooms} />;
}
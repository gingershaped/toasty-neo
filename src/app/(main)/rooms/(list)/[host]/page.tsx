import { prisma } from "@/lib/globals";
import { hostSchema } from "@/lib/schema";
import { notFound } from "next/navigation";
import { RoomList } from "../../_components/RoomList";
import { Host } from "@prisma/client";

export async function generateStaticParams() {
    return Object.keys(Host).map((host) => ({ host: host.toLowerCase() }));
}

export default async function HostRooms({ params }: { params: Promise<{ host: string }> }) {
    const host = hostSchema.safeParse((await params).host.toUpperCase()).data ?? notFound();
    const rooms = await prisma.room.findMany({
        where: { host },
        include: { jobCreator: true },
        orderBy: { jobCreatedAt: "desc" },
    });
    return <RoomList rooms={rooms} />;
}
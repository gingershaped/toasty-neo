import { prisma } from "@/lib/globals";
import { RoomList } from "../_components/RoomList";

export default async function AllRooms() {
    const rooms = await prisma.room.findMany({
        include: { jobCreator: true },
        orderBy: { jobCreatedAt: "desc" },
    });
    return <RoomList rooms={rooms} />;
}
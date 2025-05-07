import { g } from "@/lib/globals";
import { RoomList } from "../_components/RoomList";

export default async function AllRooms() {
    const rooms = await g.prisma.room.findMany({
        include: { jobCreator: true },
        orderBy: { jobCreatedAt: "desc" },
    });
    return <RoomList rooms={rooms} />;
}
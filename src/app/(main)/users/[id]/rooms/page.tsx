import prisma from "@/lib/db";
import { getUser, UserParams } from "../user";
import { RoomList } from "@/app/(main)/rooms/_components/RoomList";

export default async function UserRooms({ params }: { params: UserParams }) {
    const targetUser = await getUser(params);
    const rooms = await prisma.room.findMany({
        where: { jobCreatorId: targetUser.networkId },
        include: { jobCreator: true },
        orderBy: { jobCreatedAt: "desc" },
    });
    return <RoomList rooms={rooms} />;
}
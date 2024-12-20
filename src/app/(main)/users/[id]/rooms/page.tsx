import { prisma } from "@/lib/globals";
import { getUser, UserParams } from "../user";
import { RoomList } from "@/app/(main)/rooms/_components/RoomList";
import { readUserSession } from "@/lib/auth/session";
import Link from "next/link";

export default async function UserRooms({ params }: { params: UserParams }) {
    const currentUser = await readUserSession();
    const targetUser = await getUser(params);
    const rooms = await prisma.room.findMany({
        where: { jobCreatorId: targetUser.networkId },
        include: { jobCreator: true },
        orderBy: { jobCreatedAt: "desc" },
    });
    if (rooms.length > 0) {
        return <RoomList rooms={rooms} />;
    } else if (targetUser.networkId == currentUser?.networkId) {
        return <div className="text-muted text-center">
            You have not added any rooms. <Link href="/rooms/add">Add a room</Link>
        </div>;
    } else {
        return <div className="text-muted text-center">
            This user has not added any rooms.
        </div>;
    }
}
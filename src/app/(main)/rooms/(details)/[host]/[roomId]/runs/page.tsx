"use server";

import { RunList } from "@/app/(main)/rooms/(details)/[host]/[roomId]/runs/RunList";
import { getRoom, RoomParams } from "../room";
import { fetchRuns } from "./actions";

export default async function RoomRuns({ params }: { params: RoomParams }) {
    const room = await getRoom(params);
    const initialRuns = await fetchRuns(room.host, room.roomId, null);
    
    return <RunList host={room.host} roomId={room.roomId} initialRuns={initialRuns} />;
}
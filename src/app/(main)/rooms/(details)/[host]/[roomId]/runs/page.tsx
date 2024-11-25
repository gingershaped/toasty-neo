"use server";

import { RunList } from "@/app/(main)/rooms/_components/RunList";
import { RoomParams, getRoom } from "../room";

export default async function RoomRuns({ params }: { params: RoomParams }) {
    const room = await getRoom(params, { runs: true });
    
    return <RunList runs={room.runs} />;
}
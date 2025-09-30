"use server";

import { UserLink } from "@/app/_components/UserLink";
import { getRoom, RoomParams } from "./room";
import { HOST_ADDRESSES, TIME_FORMAT } from "@/lib/util";
import dayjs from "dayjs";
import { readUserSession } from "@/lib/auth/session";
import RoomDetailsForm from "./RoomDetailsForm";
import Link from "next/link";
import { userEditLevel } from "../../../_utils/server";

export default async function RoomDetails({ params }: { params: RoomParams }) {
    const user = await readUserSession();
    const room = await getRoom(params, { jobCreator: true, runs: true });
    const editLevel = await userEditLevel(user, room);

    const lastAntifreeze = room.runs.findLast(({ result }) => result == "ANTIFREEZED")?.checkedAt;
    const lastChecked = room.runs.at(-1)?.checkedAt;

    return <div>
        <div className="container-flow mb-3 text-center text-break">
            <div className="row row-cols-2 row-cols-md-4 gy-1 gx-0">
                <div className="col">
                    <span className="text-secondary-emphasis">added by&nbsp;</span><wbr />
                    <span className="text-nowrap"><UserLink user={room.jobCreator} /></span>
                </div>
                <div className="col">
                    <Link href={new URL(`/rooms/info/${room.roomId}`, HOST_ADDRESSES[room.host]).toString()} target="_blank">view in chat</Link>
                </div>
                <div className="col">
                    <span className="text-secondary-emphasis">last antifreeze&nbsp;</span><wbr />
                    <span className="text-nowrap">{lastAntifreeze != null ? dayjs(lastAntifreeze).format(TIME_FORMAT) : "never"}</span>
                </div>
                <div className="col">
                    <span className="text-secondary-emphasis">last checked&nbsp;</span><wbr />
                    <span className="text-nowrap">{lastChecked != null ? dayjs(lastChecked).format(TIME_FORMAT) : "never"}</span>
                </div>
            </div>
        </div>
        {(room.state == "ERRORED" && lastChecked != null) && (
            <>
                <div className="alert alert-danger">
                    <b>Antifreezing is paused</b> because an error occured during the last antifreeze run on {dayjs(lastChecked).format(TIME_FORMAT)}.
                </div>
            </>
        )}
        <RoomDetailsForm room={room} editLevel={editLevel} />
    </div>;
}
"use server";

import { UserLink } from "@/app/_components/UserLink";
import { getRoom, RoomParams, TIME_FORMAT } from "./room";
import dayjs from "dayjs";
import { readUserSession } from "@/lib/auth/session";
import RoomDetailsForm from "./RoomDetailsForm";
import { userOwnedRooms } from "@/lib/chat";
import { userCanEdit, userCanModerate } from "@/lib/auth/utils";

export default async function RoomDetails({ params }: { params: RoomParams }) {
    const user = await readUserSession();
    const room = await getRoom(params, { jobCreator: true, runs: true });
    const editable = user != null && userCanEdit(user) && ((await userOwnedRooms(room.host, user.networkId)).some(({ id }) => parseInt(id) == room.roomId) || userCanModerate(user));
    const lastAntifreeze = room.runs.findLast(({ result }) => result == "ANTIFREEZED")?.checkedAt;
    const lastChecked = room.runs.at(-1)?.checkedAt;

    return <div>
        <div className="d-flex flex-column flex-sm-row justify-content-evenly mb-3">
            <div>
                <span className="text-secondary-emphasis">added by&nbsp;</span>
                <UserLink className="float-end" user={room.jobCreator} />
            </div>
            <div>
                <span className="text-secondary-emphasis">last antifreeze&nbsp;</span>
                <span className="float-end">{lastAntifreeze != null ? dayjs(lastAntifreeze).format(TIME_FORMAT) : "never"}</span>
            </div>
            <div>
                <span className="text-secondary-emphasis">last checked&nbsp;</span>
                <span className="float-end">{lastAntifreeze != null ? dayjs(lastChecked).format(TIME_FORMAT) : "never"}</span>
            </div>
        </div>
        {(room.state == "ERRORED" && lastChecked != null) && (
            <div className="alert alert-danger">
                <b>Antifreezing is paused</b> because an error occured during the last antifreeze run on {dayjs(lastChecked).format(TIME_FORMAT)}.
            </div>
        )}
        <RoomDetailsForm room={room} canEdit={editable} isModerator={user != null && userCanModerate(user)} />
    </div>;
}
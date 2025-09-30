import { type Room } from "@/lib/generated/prisma";
import { RoomEditLevel } from "../_utils/common";

export type RoomEditFormProps = {
    room?: Room,
    editLevel: RoomEditLevel,
};

export function RoomEditForm({ room, editLevel }: RoomEditFormProps) {
    const disabled = editLevel === RoomEditLevel.READONLY;

    return <>
        <div className="mb-3">
            <label htmlFor="room-message" className="form-label">Antifreeze message to send</label>
            <div className="btn-toolbar gap-2">
                <div className="input-group flex-grow-1">
                    <input type="text" className="form-control" id="room-message" name="message" maxLength={128} defaultValue={room?.antifreezeMessage ?? "---"} disabled={disabled} />
                </div>
                {room && (
                    <div className="btn-group" role="group" aria-label="Room state">
                        <input type="radio" className="btn-check" name="state" value="active" id="room-state-active" defaultChecked={room.state === "ACTIVE"} disabled={disabled} />
                        <label className="btn btn-outline-primary" htmlFor="room-state-active">Active</label>

                        <input type="radio" className="btn-check" name="state" value="paused" id="room-state-paused" defaultChecked={room.state !== "ACTIVE"} disabled={disabled} />
                        <label className={`btn btn-outline-${room.state === "ERRORED" ? "danger" : "secondary"} border-start-0`} htmlFor="room-state-paused">Paused</label>
                    </div>
                )}
            </div>
            <div className="mt-3">
                Available substitutions:
                <ul className="my-1">
                    <li><code>{"{days}"}</code> - Days since last antifreeze run</li>
                </ul>
                If the message <code>---</code> is used, it will not be shown in the transcript.
            </div>
        </div>
        
        {editLevel >= RoomEditLevel.MODERATOR && (
            <div className="border border-danger rounded p-2">
                <h5>Moderator options</h5>
                <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" role="switch" id="locked" name="locked" defaultChecked={room?.locked ?? false} />
                    <label className="form-check-label" htmlFor="locked">Locked</label>
                </div>
            </div>
        )}
    </>;
}
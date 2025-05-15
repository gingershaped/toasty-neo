import { Prisma } from "@/lib/generated/prisma/client";
import Link from "next/link";
import { UserLink } from "../../../_components/UserLink";

type Room = Prisma.RoomGetPayload<{ include: { jobCreator: true } }>;

type RoomEntryProps = {
    room: Room,
};

export function RoomEntry({ room }: RoomEntryProps) {
    return <div className="list-group-item d-flex align-items-sm-center flex-column flex-sm-row">
        <div className="me-auto d-block">
            <div className="d-flex flex-wrap">
                <Link href={`/rooms/${room.host.toLowerCase()}/${room.roomId}`} className="me-2">{room.name}</Link>
                <span>
                    {room.state == "ERRORED" && <span className="badge text-bg-danger me-2">errored</span>}
                    {room.locked && <span className="badge text-bg-secondary">locked</span>}
                </span>
            </div>
            <div className="text-muted">
                {room.host}#{room.roomId}
            </div>
        </div>
        <div>
            <span className="text-muted">added by</span>&nbsp;<UserLink user={room.jobCreator} />
        </div>
    </div>;
}

type RoomListProps = {
    rooms: Room[],
};

export function RoomList({ rooms }: RoomListProps) {
    return <div className="list-group">
        {rooms.map((room) => (
            <RoomEntry key={room.roomId} room={room} />
        ))}
    </div>;
}
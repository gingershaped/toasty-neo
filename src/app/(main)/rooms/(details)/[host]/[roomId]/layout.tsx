import { TabbedHeader } from "@/app/_components/Navigation";
import { getRoom, RoomParams } from "./room";
import { ReactNode } from "react";
import Link from "next/link";
import { HOST_ADDRESSES } from "@/lib/util";

export default async function RoomDetails({ params, children }: { params: RoomParams, children: ReactNode }) {
    const room = await getRoom(params);
    return <div className="row justify-content-center">
        <div className="col-lg-7">
            <TabbedHeader
                base={`/rooms/${room.host.toLowerCase()}/${room.roomId}`}
                nav={{
                    "": "Details",
                    "runs": "Runs",
                }}
            >
                <div className="d-flex flex-column flex-sm-row align-items-sm-end flex-grow-1 border-bottom-sm m-0 pb-2 pb-sm-1">
                    <h1 className="me-auto">
                        {room.name}
                    </h1>
                    <Link
                        href={new URL(`/rooms/info/${room.roomId}`, HOST_ADDRESSES[room.host]).toString()}
                        target="_blank"
                        className="mb-sm-1 me-sm-3"
                        style={{ width: "fit-content" }}
                    >View in chat</Link>
                </div>
            </TabbedHeader>
            {children}
        </div>
    </div>;
}
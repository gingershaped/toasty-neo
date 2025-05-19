import { TabbedHeader } from "@/app/_components/Navigation";
import { getRoom, RoomParams } from "./room";
import { ReactNode } from "react";

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
                {room.name}
            </TabbedHeader>
            {children}
        </div>
    </div>;
}
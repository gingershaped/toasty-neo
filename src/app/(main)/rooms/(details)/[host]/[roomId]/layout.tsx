import { Navigation } from "@/app/_components/Navigation";
import { getRoom, RoomParams } from "./room";
import { ReactNode } from "react";

export default async function RoomDetails({ params, children }: { params: RoomParams, children: ReactNode }) {
    const room = await getRoom(params);
    return <div className="row justify-content-center">
        <div className="col-lg-7">
            <div className="d-flex align-items-end mb-3">
                <h1 className="flex-grow-1 border-bottom m-0 pb-1">{room.name}</h1>
                <Navigation base={`/rooms/${room.host.toLowerCase()}/${room.roomId}`} style="tabs">
                    {{
                        "": "Details",
                        "runs": "Runs",
                    }}
                </Navigation>
            </div>
            {children}
        </div>
    </div>;
}
"use client";

import { Host } from "@prisma/client";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { fetchOwnedRooms } from "../add/actions";

export type OwnedRoomsListProps = {
    isModerator: boolean,
};

export function OwnedRoomsList({ isModerator }: OwnedRoomsListProps) {
    const [host, setHost] = useState<Host>(Host.SE);
    const [searchQuery, setSearchQuery] = useState("");
    const { data: ownedRooms, error: ownedRoomsError, isLoading: loadingOwnedRooms } = useSWR(host, fetchOwnedRooms);

    const filteredRooms = useMemo(() => ownedRooms?.filter(({ name }) => searchQuery.length == 0 || name.toLowerCase().includes(searchQuery)), [ownedRooms, searchQuery]);

    return <>
        <select className="form-select mb-2" name="host" onChange={(e) => setHost(e.target.value as Host)}>
            <option value={Host.SE}>Stack Exchange</option>
            <option value={Host.MSE}>Meta Stack Exchange</option>
            <option value={Host.SO}>Stack Overflow</option>
        </select>
        <input type="search" className="form-control mb-2" placeholder="Filter rooms" value={searchQuery} onInput={(e) => setSearchQuery(e.currentTarget.value)} />
        <div className="border rounded overflow-y-auto flex-grow-1" style={{ containerType: "size" }}>
            {ownedRoomsError != null && <div className="text-danger text-center">Failed to fetch rooms</div>}
            {loadingOwnedRooms && (
                <div className="w-100 text-center mt-3">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            )}
            {filteredRooms != undefined && <>
                {(filteredRooms.length == 0 && !isModerator) && <div className="w-100 text-center text-secondary-emphasis">no rooms</div>}
                <ul className="list-group list-group-flush rounded">
                    {isModerator && <li className="list-group-item hstack">
                        <input className="form-check-input my-0 me-2 align-self-center" type="radio" name="roomId" value="custom" required />
                        <input className="form-control" type="number" name="roomCustomId" placeholder="Enter a room ID" />
                    </li>}
                    {filteredRooms.map(({ id, name }) => (
                        <li key={id} className="list-group-item hstack">
                            <input
                                className="form-check-input me-2"
                                type="radio"
                                name="roomId"
                                value={id}
                                id={`room-${id}`}
                                required
                            />
                            <label htmlFor={`room-${id}`}>{name}</label>
                        </li>
                    ))}    
                </ul>
            </>}
        </div>
        <div className="form-text">only rooms you are an owner of are listed</div>
    </>;
}
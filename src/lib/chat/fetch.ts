"use server";

import { Host } from "@prisma/client";
import parse from "node-html-parser";
import { Credentials } from "./credentials";
import { environ } from "../environ";
import { HOST_ADDRESSES } from "../util";

export async function fetchChatId(host: Host, networkId: number) {
    return parseInt(new URL((await fetch(new URL(`/accounts/${networkId}`, HOST_ADDRESSES[host]))).url).pathname.split("/")[2]);
}

export async function fetchUserOwnedRooms(host: Host, networkId: number) {
    const root = parse(await fetch(new URL(`/users/${await fetchChatId(host, networkId)}`, HOST_ADDRESSES[host]), { cache: "force-cache", next: { revalidate: 60 } }).then((r) => r.text()));
    return root.getElementById("user-owningcards")
        ?.querySelectorAll(".roomcard")
        ?.filter((element) => !element.classList.contains("frozen"))
        ?.map((element) => ({ id: element.id.slice(5), name: element.querySelector(".room-name")!.attrs["title"] }))
        ?? [];
}

export async function fetchRoomName(host: Host, roomId: number) {
    const response = await fetch(new URL(`/rooms/info/${roomId}`, HOST_ADDRESSES[host]));
    if (response.status != 200) {
        return null;
    }
    return parse(await response.text())
        .querySelector(".subheader")!
        .querySelector("h1")!
        .textContent;
}

export async function credentialsForHost(host: Host) {
    return await Credentials.loadOrAuthenticate(
        `credentials-${host}.credentials`,
        environ.SE_EMAIL,
        environ.SE_PASSWORD,
        host,
    );
}
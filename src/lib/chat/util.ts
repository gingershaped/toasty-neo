import { Host } from "@prisma/client";
import parse from "node-html-parser";

export const HOSTS: Record<Host, URL> = {
    "MSE": new URL("https://chat.meta.stackexchange.com"),
    "SE": new URL("https://chat.stackexchange.com"),
    "SO": new URL("https://chat.stackoverflow.com"),
};

export async function fetchChatId(host: Host, networkId: number) {
    return parseInt(new URL((await fetch(new URL(`/accounts/${networkId}`, HOSTS[host]))).url).pathname.split("/")[2]);
}

export async function userOwnedRooms(host: Host, networkId: number) {
    const root = parse(await fetch(new URL(`/users/${await fetchChatId(host, networkId)}`, HOSTS[host]), { cache: "force-cache", next: { revalidate: 60 } }).then((r) => r.text()));
    return root.getElementById("user-owningcards")
        ?.querySelectorAll(".roomcard")
        ?.filter((element) => !element.classList.contains("frozen"))
        ?.map((element) => ({ id: element.id.slice(5), name: element.querySelector(".room-name")!.attrs["title"] }))
        ?? [];
}

export async function roomName(host: Host, roomId: number) {
    const response = await fetch(new URL(`/rooms/info/${roomId}`, HOSTS[host]));
    if (response.status != 200) {
        return null;
    }
    return parse(await response.text())
        .querySelector(".subheader")!
        .querySelector("h1")!
        .textContent;
}
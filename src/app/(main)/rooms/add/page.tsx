import { isModerator, readUserSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { AddRoomForm } from "./AddRoomForm";

export default async function NewRoom() {
    const user = await readUserSession() ?? redirect("/auth/login");
    return <AddRoomForm isModerator={isModerator(user)} />;
}
import { readUserSession } from "@/app/auth/session";
import { redirect } from "next/navigation";
import { AddRoomForm } from "./AddRoomForm";

export default async function NewRoom() {
    const user = await readUserSession() ?? redirect("/auth/login");
    const isModerator = ["MODERATOR", "DEVELOPER"].includes(user.role);

    return <AddRoomForm isModerator={isModerator} />;
}
import { readUserSession } from "@/lib/auth/session";
import { canModerate } from "@/lib/auth/utils";
import { redirect } from "next/navigation";
import { RoomAddForm } from "./RoomAddForm";

export default async function NewRoom() {
    const user = await readUserSession() ?? redirect("/auth/login");
    return <RoomAddForm isModerator={canModerate(user.role)} />;
}
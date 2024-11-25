import { readUserSession } from "@/lib/auth/session";
import { userCanModerate } from "@/lib/auth/utils";
import { redirect } from "next/navigation";
import { RoomAddForm } from "./RoomAddForm";
import { checkPermissions } from "@/lib/auth/check";

export default async function NewRoom() {
    const user = await readUserSession() ?? redirect("/auth/login");
    await checkPermissions(user);
    return <RoomAddForm isModerator={userCanModerate(user)} />;
}
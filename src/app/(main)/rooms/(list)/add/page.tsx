import { readUserSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { RoomAddForm } from "./RoomAddForm";
import { checkPermissions } from "@/lib/auth/check";
import { userEditLevel } from "../../_utils/server";

export default async function NewRoom() {
    const user = await readUserSession() ?? redirect("/auth/login");
    await checkPermissions(user);
    const editLevel = await userEditLevel(user, null);
    return <RoomAddForm editLevel={editLevel} />;
}
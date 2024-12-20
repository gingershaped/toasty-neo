import { prisma } from "@/lib/globals";
import { readUserSession } from "../../lib/auth/session";
import Link from "next/link";
import { LoadingLink } from "../_components/LoadingButton";

export default async function Index() {
    const user = await readUserSession();
    const roomCount = await prisma.room.count();
    return <div className="row justify-content-center">
        <div className="col-sm-7">
            <section className="w-100 bg-body-tertiary rounded p-3">
                <h1>Toasty Antifreeze</h1>
                <hr />
                <p>
                    Currently antifreezing <b>{roomCount}</b> rooms across <b>3</b> hosts. Add yours today!
                </p>
                <p>
                    {user == null ? (
                        <LoadingLink href="/auth/login" variant="primary">
                            Log in with Stack Exchange
                        </LoadingLink>
                    ) : (
                        <Link href="/rooms/add" className="btn btn-primary">Add a room</Link>
                    )}
                </p>
            </section>
        </div>
    </div>;
}
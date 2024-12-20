import { TabbedHeader } from "@/app/_components/Navigation";
import { ReactNode } from "react";

export default async function RoomsLayout({ children }: { children: ReactNode }) {
    return <div className="row justify-content-center">
        <div className="col-lg-10">
            <TabbedHeader
                base="/rooms"
                nav={{
                    "": "All",
                    "se": "SE",
                    "mse": "MSE",
                    "so": "SO",
                    "add": "Add room",
                }}
            >
                Rooms
            </TabbedHeader>
            {children}
        </div>
    </div>;
}
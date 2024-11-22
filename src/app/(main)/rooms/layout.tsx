import { Navigation } from "@/app/_components/Navigation";
import { ReactNode } from "react";

export default async function RoomsLayout({ children }: { children: ReactNode }) {
    return <div className="row justify-content-center">
        <div className="col-lg-10">
            <div className="d-flex align-items-end mb-3">
                <h1 className="flex-grow-1 border-bottom m-0 pb-1">Rooms</h1>
                <Navigation base="/rooms" style="tabs">
                    {{
                        "": "All",
                        "se": "SE",
                        "mse": "MSE",
                        "so": "SO",
                        "add": "Add room",
                    }}
                </Navigation>
            </div>
            {children}
        </div>
    </div>;
}
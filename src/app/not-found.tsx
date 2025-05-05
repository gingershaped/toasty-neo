import Image from "next/image";
import MainLayout from "./(main)/layout";
import notFound from "@/app/_resources/404.jpg";

export default function NotFound() {
    return <MainLayout>
        <div className="position-relative" style={{ height: "50vh" }}>
            <Image src={notFound} alt="404 Not Found" fill style={{ objectFit: "contain" }} priority />
        </div>
    </MainLayout>;
}
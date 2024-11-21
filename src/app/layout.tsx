import "bootstrap-icons/font/bootstrap-icons.css";
import "./_styles/style.scss";
import { ReactNode } from "react";
import Script from "next/script";

export default async function RootLayout({ children }: { children: ReactNode }) {
    return <html lang="en">
        <Script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" />
        <body data-bs-theme="dark">
            {children}
        </body>
    </html>;
}
/** @format */

import { Link } from "@tanstack/react-router";
import { NavUser } from "@/components/nav-user";

export function Navbar() {
    return (
        <header className="sticky top-0 left-0 right-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link
                    to="/"
                    className="flex shrink-0 items-center gap-2 transition-opacity hover:opacity-80"
                >
                    <img
                        src="/brand/logo.webp"
                        alt="Reciparoo"
                        className="h-14 w-auto"
                    />
                    <img
                        src="/brand/text.webp"
                        alt=""
                        className="h-8 w-auto"
                    />
                </Link>

                <NavUser />
            </div>
        </header>
    );
}

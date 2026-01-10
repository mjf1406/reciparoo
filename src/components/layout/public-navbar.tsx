/** @format */

import { Link } from "@tanstack/react-router";
import { ThemeSwitch } from "@/components/themes/theme-switch";

export function PublicNavbar() {
    return (
        <header className="sticky top-0 left-0 right-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Spacer for centering */}
                <div className="flex-1" />

                {/* Logo - Centered */}
                <Link
                    to="/"
                    className="flex shrink-0 items-center transition-opacity hover:opacity-80"
                >
                    <img
                        src="/logo-with-text.webp"
                        alt="Reciparoo"
                        className="h-16 w-auto"
                    />
                </Link>

                {/* Right side - Theme Switch */}
                <div className="flex flex-1 items-center justify-end">
                    <ThemeSwitch />
                </div>
            </div>
        </header>
    );
}

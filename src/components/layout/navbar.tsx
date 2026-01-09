/** @format */

import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { NavUser } from "@/components/nav-user";
import { BookOpen, Calendar, ShoppingCart, Package, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

interface NavbarProps {
    homeId?: string;
}

const navLinks = [
    { label: "Recipes", icon: BookOpen, path: "recipes" },
    { label: "Calendar", icon: Calendar, path: "calendar" },
    { label: "Groceries", icon: ShoppingCart, path: "groceries" },
    { label: "Pantry", icon: Package, path: "pantry" },
];

export function Navbar({ homeId }: NavbarProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();

    const isActive = (path: string) => {
        return location.pathname.includes(`/${path}`);
    };

    const handleNavClick = (path: string) => {
        if (homeId) {
            // Navigate to the path - routes will be created later
            window.location.href = `/home/${homeId}/${path}`;
        }
        setMobileMenuOpen(false);
    };

    return (
        <header className="sticky top-0 left-0 right-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Logo */}
                <Link
                    to={homeId ? "/home/$homeId" : "/"}
                    params={homeId ? { homeId } : undefined}
                    className="flex shrink-0 items-center transition-opacity hover:opacity-80"
                >
                    <img
                        src="/logo-with-text.webp"
                        alt="Reciparoo"
                        className="h-16 w-auto"
                    />
                </Link>

                {/* Desktop Navigation Links */}
                {homeId && (
                    <nav className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <button
                                key={link.path}
                                onClick={() => handleNavClick(link.path)}
                                className={cn(
                                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                    isActive(link.path)
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:text-accent hover:underline"
                                )}
                            >
                                <link.icon className="h-4 w-4" />
                                <span>{link.label}</span>
                            </button>
                        ))}
                    </nav>
                )}

                {/* Right side: Mobile menu + User Menu */}
                <div className="flex items-center gap-2">
                    {/* Mobile Menu Button */}
                    {homeId && (
                        <Sheet
                            open={mobileMenuOpen}
                            onOpenChange={setMobileMenuOpen}
                        >
                            <SheetTrigger
                                render={
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="md:hidden"
                                    >
                                        <Menu className="h-5 w-5" />
                                        <span className="sr-only">
                                            Toggle menu
                                        </span>
                                    </Button>
                                }
                            />
                            <SheetContent
                                side="left"
                                className="w-64"
                            >
                                <SheetHeader>
                                    <SheetTitle>Navigation</SheetTitle>
                                </SheetHeader>
                                <nav className="mt-6 flex flex-col gap-2">
                                    {navLinks.map((link) => (
                                        <button
                                            key={link.path}
                                            onClick={() =>
                                                handleNavClick(link.path)
                                            }
                                            className={cn(
                                                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors text-left w-full",
                                                isActive(link.path)
                                                    ? "bg-primary text-primary-foreground"
                                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                            )}
                                        >
                                            <link.icon className="h-5 w-5" />
                                            <span>{link.label}</span>
                                        </button>
                                    ))}
                                </nav>
                            </SheetContent>
                        </Sheet>
                    )}

                    {/* User Menu */}
                    <NavUser />
                </div>
            </div>
        </header>
    );
}

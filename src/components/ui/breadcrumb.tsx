import * as React from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
    label: string;
    to?: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
    className?: string;
    role?: "owner" | "admin" | "member" | "viewer" | null;
}

export function Breadcrumb({ items, className, role }: BreadcrumbProps) {
    const roleLabel = role ? role.charAt(0).toUpperCase() + role.slice(1) : null;

    return (
        <nav
            aria-label="Breadcrumb"
            className={cn("flex items-center space-x-1 text-sm text-muted-foreground", className)}
        >
            {items.map((item, index) => {
                const isLast = index === items.length - 1;
                
                return (
                    <React.Fragment key={index}>
                        {item.to && !isLast ? (
                            <Link
                                to={item.to}
                                className="hover:text-foreground transition-colors"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <span
                                className={cn(
                                    isLast && "text-foreground font-medium"
                                )}
                            >
                                {item.label}
                            </span>
                        )}
                        {!isLast && (
                            <ChevronRight className="h-4 w-4 mx-1" />
                        )}
                    </React.Fragment>
                );
            })}
            {roleLabel && (
                <>
                <ChevronRight className="h-4 w-4 mx-1" />
                <span className="text-muted-foreground/70 italic">
                    as {roleLabel}
                </span>
                </>
            )}
        </nav>
    );
}

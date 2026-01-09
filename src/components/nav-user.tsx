/** @format */

"use client";

import { useNavigate } from "@tanstack/react-router";
import {
    BadgeCheck,
    Bell,
    ChevronsUpDown,
    CreditCard,
    LogOut,
    Sparkles,
} from "lucide-react";

import { db } from "@/lib/db/db";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthContext } from "@/components/auth/auth-provider";
import { ThemeSwitch } from "@/components/themes/theme-switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

type User =
    | {
          created_at: Date | null | string;
          email: string;
          id: string;
          imageURL: string | null;
          avatarURL: string | null;
          isGuest: boolean;
          refresh_token: string | null;
          updated_at: Date | null | string;
          type: string;
          firstName: string | null;
          lastName: string | null;
          plan: string;
      }
    | null
    | undefined;

export function NavUser({
    user: userProp,
    isLoading: isLoadingProp,
}: {
    user?: User;
    isLoading?: boolean;
}) {
    const { user: contextUser, isLoading: contextLoading } = useAuthContext();
    const user = userProp ?? contextUser;
    const isLoading = isLoadingProp ?? contextLoading;

    if (isLoading) {
        return (
            <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="hidden h-4 w-24 sm:block" />
            </div>
        );
    }

    return (
        <>
            <db.SignedIn>
                <NavUserSignedIn user={user} />
            </db.SignedIn>
            <db.SignedOut>
                <NavUserSignedOut />
            </db.SignedOut>
        </>
    );
}

function NavUserSignedIn({ user: userProp }: { user?: User }) {
    const { user: contextUser } = useAuthContext();
    const navigate = useNavigate();
    const user = userProp ?? contextUser;
    const displayName =
        user?.firstName && user?.lastName
            ? `${user.firstName} ${user.lastName}`
            : user?.email || "User";
    const avatarUrl = user?.avatarURL || user?.imageURL || undefined;
    // Normalize empty strings to undefined
    const normalizedAvatarUrl =
        avatarUrl && avatarUrl.trim() !== "" ? avatarUrl : undefined;
    const initials =
        user?.firstName && user?.lastName
            ? `${user.firstName[0]}${user.lastName[0]}`
            : user?.email?.[0]?.toUpperCase() || "U";

    const handleSignOut = async () => {
        try {
            await db.auth.signOut();
            navigate({ to: "/" });
        } catch (err) {
            console.error("Error signing out:", err);
        }
    };

    const handleNavigate = (path: string) => {
        navigate({ to: path });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                render={
                    <Button
                        variant="ghost"
                        className="flex items-center gap-2 px-2"
                    >
                        <Avatar
                            className="h-8 w-8"
                            key={normalizedAvatarUrl || "no-avatar"}
                        >
                            <AvatarImage
                                src={normalizedAvatarUrl}
                                alt={displayName}
                            />
                            <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <span className="hidden max-w-32 truncate text-sm font-medium sm:block">
                            {displayName}
                        </span>
                        <ChevronsUpDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
                    </Button>
                }
            />
            <DropdownMenuContent
                className="min-w-56 rounded-lg"
                align="end"
                sideOffset={8}
            >
                <DropdownMenuGroup>
                    <DropdownMenuLabel className="p-0 font-normal">
                        <div className="flex items-center gap-2 px-2 py-1.5 text-left text-sm">
                            <Avatar
                                className="h-8 w-8"
                                key={normalizedAvatarUrl || "no-avatar"}
                            >
                                <AvatarImage
                                    src={normalizedAvatarUrl}
                                    alt={displayName}
                                />
                                <AvatarFallback>{initials}</AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">
                                    {displayName}
                                </span>
                                {user?.email && (
                                    <span className="truncate text-xs text-muted-foreground">
                                        {user.email}
                                    </span>
                                )}
                                {user?.isGuest && (
                                    <span className="truncate text-xs text-muted-foreground">
                                        Guest Account
                                    </span>
                                )}
                            </div>
                        </div>
                    </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <div className="px-2 py-2">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-sm text-muted-foreground">
                            Theme
                        </span>
                        <ThemeSwitch />
                    </div>
                </div>
                {user && user.isGuest && (
                    <>
                        <DropdownMenuSeparator />
                        <div className="px-2 py-2">
                            <p className="mb-2 text-xs text-muted-foreground">
                                Sign in to save your data permanently
                            </p>
                        </div>
                        <DropdownMenuSeparator />
                    </>
                )}
                {user && !user.isGuest && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Upgrade to Pro
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem
                                onClick={() => handleNavigate("/")}
                            >
                                <BadgeCheck className="mr-2 h-4 w-4" />
                                Account
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <CreditCard className="mr-2 h-4 w-4" />
                                Billing
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Bell className="mr-2 h-4 w-4" />
                                Notifications
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                    </>
                )}
                <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function NavUserSignedOut() {
    const navigate = useNavigate();

    return (
        <div className="flex items-center gap-2">
            <ThemeSwitch />
            <Button
                variant="outline"
                size="sm"
                onClick={() => navigate({ to: "/" })}
            >
                Sign In
            </Button>
        </div>
    );
}

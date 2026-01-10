/** @format */

"use client";

import { useState } from "react";
import { Users, Loader2 } from "lucide-react";
import { db } from "@/lib/db/db";
import { useAuthContext } from "@/components/auth/auth-provider";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { InstaQLEntity } from "@instantdb/react";
import type { AppSchema } from "@/instant.schema";

type Home = InstaQLEntity<
    AppSchema,
    "homes",
    {
        owner: {};
        admins: {};
        homeMembers: {};
        viewers: {};
    }
>;

type User = InstaQLEntity<AppSchema, "$users">;

type MemberRole = "owner" | "admin" | "member" | "viewer";

interface MemberInfo {
    user: User;
    role: MemberRole;
}

interface ManageMembersCardProps {
    homeId: string;
}

export function ManageMembersCard({ homeId }: ManageMembersCardProps) {
    const { user: currentUser } = useAuthContext();
    const [changingRoles, setChangingRoles] = useState<Set<string>>(new Set());

    const { data } = db.useQuery({
        homes: {
            $: {
                where: { id: homeId },
            },
            owner: {},
            admins: {},
            homeMembers: {},
            viewers: {},
        },
    });

    const home = data?.homes?.[0] as Home | undefined;

    if (!home) {
        return null;
    }

    // Collect all members with their roles
    const members: MemberInfo[] = [];

    // Add owner
    if (home.owner) {
        members.push({
            user: home.owner as User,
            role: "owner",
        });
    }

    // Add admins
    if (home.admins) {
        home.admins.forEach((admin) => {
            members.push({
                user: admin as User,
                role: "admin",
            });
        });
    }

    // Add members
    if (home.homeMembers) {
        home.homeMembers.forEach((member) => {
            members.push({
                user: member as User,
                role: "member",
            });
        });
    }

    // Add viewers
    if (home.viewers) {
        home.viewers.forEach((viewer) => {
            members.push({
                user: viewer as User,
                role: "viewer",
            });
        });
    }

    const handleRoleChange = async (
        userId: string,
        newRole: MemberRole,
        currentRole: MemberRole
    ) => {
        // Prevent changing owner role
        if (currentRole === "owner") {
            alert("Cannot change the owner's role.");
            return;
        }

        setChangingRoles((prev) => new Set(prev).add(userId));

        try {
            const transactions = [];

            // Unlink from current role
            if (currentRole === "admin") {
                transactions.push(
                    db.tx.homes[homeId].unlink({ admins: userId })
                );
            } else if (currentRole === "member") {
                transactions.push(
                    db.tx.homes[homeId].unlink({ homeMembers: userId })
                );
            } else if (currentRole === "viewer") {
                transactions.push(
                    db.tx.homes[homeId].unlink({ viewers: userId })
                );
            }

            // Link to new role
            if (newRole === "admin") {
                transactions.push(
                    db.tx.homes[homeId].link({ admins: userId })
                );
            } else if (newRole === "member") {
                transactions.push(
                    db.tx.homes[homeId].link({ homeMembers: userId })
                );
            } else if (newRole === "viewer") {
                transactions.push(
                    db.tx.homes[homeId].link({ viewers: userId })
                );
            }

            db.transact(transactions);

            // Wait a moment for the transaction to complete
            await new Promise((resolve) => setTimeout(resolve, 100));
        } catch (error) {
            console.error("Error changing role:", error);
            alert("Failed to change role. Please try again.");
        } finally {
            setChangingRoles((prev) => {
                const next = new Set(prev);
                next.delete(userId);
                return next;
            });
        }
    };

    const getRoleBadgeVariant = (role: MemberRole) => {
        switch (role) {
            case "owner":
                return "default";
            case "admin":
                return "secondary";
            case "member":
                return "outline";
            case "viewer":
                return "ghost";
            default:
                return "outline";
        }
    };

    const getUserDisplayName = (user: User) => {
        if (user.firstName || user.lastName) {
            return `${user.firstName || ""} ${user.lastName || ""}`.trim();
        }
        return user.email || "Unknown User";
    };

    const getUserInitials = (user: User) => {
        if (user.firstName && user.lastName) {
            return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
        }
        if (user.firstName) {
            return user.firstName[0].toUpperCase();
        }
        if (user.email) {
            return user.email[0].toUpperCase();
        }
        return "?";
    };

    const isOwnerOrAdmin =
        home.owner?.id === currentUser?.id ||
        home.admins?.some((admin) => admin.id === currentUser?.id);

    // Only show if user is owner or admin
    if (!isOwnerOrAdmin) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <div>
                        <CardTitle>Manage Members</CardTitle>
                        <CardDescription>
                            View and manage member roles for this home
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {members.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                        <p>No members found.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {members.map((member) => {
                            const isChanging = changingRoles.has(member.user.id);
                            const isCurrentUserOwner = home.owner?.id === currentUser?.id;
                            const isCurrentUserAdmin = home.admins?.some(
                                (admin) => admin.id === currentUser?.id
                            );
                            // Only owners can change admin roles
                            // Admins can change member/viewer roles
                            // Owners can change any role (except their own)
                            const canChangeRole =
                                member.role !== "owner" &&
                                (isCurrentUserOwner ||
                                    (isCurrentUserAdmin && member.role !== "admin"));

                            return (
                                <div
                                    key={member.user.id}
                                    className="flex items-center justify-between rounded-lg border p-4"
                                >
                                    <div className="flex items-center gap-3 flex-1">
                                        <Avatar>
                                            <AvatarImage
                                                src={
                                                    member.user.avatarURL ||
                                                    member.user.imageURL
                                                }
                                                alt={getUserDisplayName(
                                                    member.user
                                                )}
                                            />
                                            <AvatarFallback>
                                                {getUserInitials(member.user)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium truncate">
                                                {getUserDisplayName(member.user)}
                                            </div>
                                            <div className="text-sm text-muted-foreground truncate">
                                                {member.user.email}
                                            </div>
                                        </div>
                                        {member.role === "owner" && (
                                            <Badge
                                                variant={getRoleBadgeVariant(
                                                    member.role
                                                )}
                                            >
                                                {member.role.charAt(0).toUpperCase() +
                                                    member.role.slice(1)}
                                            </Badge>
                                        )}
                                    </div>
                                    {canChangeRole && (
                                        <div className="ml-4">
                                            {isChanging ? (
                                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                            ) : (
                                                <Select
                                                    value={member.role}
                                                    onValueChange={(value) =>
                                                        handleRoleChange(
                                                            member.user.id,
                                                            value as MemberRole,
                                                            member.role
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger className="w-32">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="viewer">
                                                            Viewer
                                                        </SelectItem>
                                                        <SelectItem value="member">
                                                            Member
                                                        </SelectItem>
                                                        <SelectItem value="admin">
                                                            Admin
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

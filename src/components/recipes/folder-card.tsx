/** @format */

"use client";

import { Folder, FileText, ImageIcon } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { FolderActionMenu } from "./folder-action-menu";
import { useAuthContext } from "@/components/auth/auth-provider";
import { useNavigate } from "@tanstack/react-router";
import type { InstaQLEntity } from "@instantdb/react";
import type { AppSchema } from "@/instant.schema";

type FolderWithRelations = InstaQLEntity<
    AppSchema,
    "folders",
    {
        home: {
            owner: {};
            admins: {};
            homeMembers: {};
            viewers: {};
        };
        parentFolder: {};
        subfolders: {};
        recipes: {};
    }
>;

interface FolderCardProps {
    folder: FolderWithRelations | any; // Allow flexible type for Date objects
}

export function FolderCard({ folder }: FolderCardProps) {
    const { user } = useAuthContext();
    const navigate = useNavigate();

    const recipes = folder.recipes || [];
    const recipeCount = recipes.length;
    const subfolderCount = folder.subfolders?.length || 0;

    // Get first 9 recipes with images for the grid
    const recipesWithImages = recipes
        .filter((r: any) => r.imageURL)
        .slice(0, 9);

    // Fill remaining slots with placeholders if we have fewer than 9 images
    const gridSlots = 9;
    const emptySlots = Math.max(0, gridSlots - recipesWithImages.length);

    const handleCardClick = () => {
        const home = folder.home;
        if (home?.id && folder.id) {
            navigate({
                to: "/home/$homeId/recipes",
                params: { homeId: home.id },
                search: { folder: folder.id },
            });
        }
    };

    return (
        <Card
            className="transition-all hover:shadow-lg hover:scale-[1.02] flex flex-col relative cursor-pointer overflow-hidden"
            onClick={handleCardClick}
        >
            {/* Folder Action Menu */}
            <div
                className="absolute top-4 right-4 z-10"
                onClick={(e) => e.stopPropagation()}
            >
                <FolderActionMenu folder={folder} userId={user?.id} />
            </div>

            <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                    <Folder className="w-5 h-5 text-primary flex-shrink-0" />
                    <CardTitle className="text-lg line-clamp-1">
                        {folder.name}
                    </CardTitle>
                </div>
                {folder.description && (
                    <CardDescription className="line-clamp-2 text-xs mt-1">
                        {folder.description}
                    </CardDescription>
                )}
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                    <div className="flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5" />
                        <span>
                            {recipeCount} recipe{recipeCount !== 1 ? "s" : ""}
                        </span>
                    </div>
                    {subfolderCount > 0 && (
                        <div className="flex items-center gap-1">
                            <Folder className="h-3.5 w-3.5" />
                            <span>
                                {subfolderCount} subfolder
                                {subfolderCount !== 1 ? "s" : ""}
                            </span>
                        </div>
                    )}
                </div>
            </CardHeader>

            {/* Recipe Image Grid - 3x3 square images with names */}
            <CardContent className="pt-0 pb-4">
                <div className="w-full bg-muted/30 rounded-lg overflow-hidden">
                    {recipesWithImages.length > 0 ? (
                        <div className="grid grid-cols-3 gap-1 p-1">
                            {recipesWithImages.map((recipe: any, index: number) => (
                                <div
                                    key={recipe.id || index}
                                    className="flex flex-col overflow-hidden"
                                >
                                    <div className="aspect-square relative overflow-hidden bg-muted rounded">
                                        <img
                                            src={recipe.imageURL}
                                            alt={recipe.name || "Recipe"}
                                            className="absolute inset-0 w-full h-full object-cover"
                                        />
                                    </div>
                                    <span
                                        className="text-[10px] text-muted-foreground truncate mt-0.5 px-0.5"
                                        title={recipe.name}
                                    >
                                        {recipe.name || "Untitled"}
                                    </span>
                                </div>
                            ))}
                            {/* Empty placeholder slots */}
                            {Array.from({ length: emptySlots }).map((_, index) => (
                                <div
                                    key={`empty-${index}`}
                                    className="flex flex-col overflow-hidden"
                                >
                                    <div className="aspect-square bg-muted/50 flex items-center justify-center rounded">
                                        <ImageIcon className="w-4 h-4 text-muted-foreground/30" />
                                    </div>
                                    <span className="text-[10px] text-transparent mt-0.5 px-0.5">
                                        &nbsp;
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="aspect-square flex items-center justify-center">
                            <Folder className="w-16 h-16 text-muted-foreground/30" />
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

/** @format */

"use client";

import { ImageSkeleton } from "./image-skeleton";
import { cn } from "@/lib/utils";

interface UnderConstructionImageProps {
    className?: string;
    alt?: string;
}

export function UnderConstructionImage({
    className,
    alt = "Under Construction image",
}: UnderConstructionImageProps) {
    return (
        <ImageSkeleton
            src="/under-construction.webp"
            alt={alt}
            width="500px"
            height="500px"
            className={cn("max-w-md mb-6 mx-auto", className)}
        />
    );
}

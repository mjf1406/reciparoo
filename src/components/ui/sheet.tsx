/** @format */

"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

function Sheet({ ...props }: DialogPrimitive.Root.Props) {
    return <DialogPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
    return <DialogPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({ ...props }: DialogPrimitive.Close.Props) {
    return <DialogPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal({ ...props }: DialogPrimitive.Portal.Props) {
    return <DialogPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetOverlay({
    className,
    ...props
}: DialogPrimitive.Backdrop.Props) {
    return (
        <DialogPrimitive.Backdrop
            data-slot="sheet-overlay"
            className={cn(
                "data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 bg-black/80 duration-100 supports-backdrop-filter:backdrop-blur-xs fixed inset-0 isolate z-50",
                className
            )}
            {...props}
        />
    );
}

interface SheetContentProps extends DialogPrimitive.Popup.Props {
    side?: "top" | "right" | "bottom" | "left";
    showCloseButton?: boolean;
}

function SheetContent({
    side = "right",
    className,
    children,
    showCloseButton = true,
    ...props
}: SheetContentProps) {
    return (
        <SheetPortal>
            <SheetOverlay />
            <DialogPrimitive.Popup
                data-slot="sheet-content"
                className={cn(
                    "bg-background data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 ring-foreground/10 fixed z-50 gap-4 p-6 shadow-lg ring-1 duration-100 outline-none",
                    side === "top" &&
                        "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top rounded-b-xl",
                    side === "bottom" &&
                        "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom rounded-t-xl",
                    side === "left" &&
                        "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm rounded-r-xl",
                    side === "right" &&
                        "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm rounded-l-xl",
                    className
                )}
                {...props}
            >
                {children}
                {showCloseButton && (
                    <DialogPrimitive.Close
                        data-slot="sheet-close"
                        render={
                            <Button
                                variant="ghost"
                                className="absolute top-2 right-2"
                                size="icon-sm"
                            />
                        }
                    >
                        <XIcon />
                        <span className="sr-only">Close</span>
                    </DialogPrimitive.Close>
                )}
            </DialogPrimitive.Popup>
        </SheetPortal>
    );
}

function SheetHeader({
    className,
    ...props
}: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="sheet-header"
            className={cn("gap-2 flex flex-col", className)}
            {...props}
        />
    );
}

function SheetFooter({
    className,
    ...props
}: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="sheet-footer"
            className={cn(
                "bg-muted/50 -mx-6 -mb-6 rounded-b-xl border-t p-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
                className
            )}
            {...props}
        />
    );
}

function SheetTitle({
    className,
    ...props
}: DialogPrimitive.Title.Props) {
    return (
        <DialogPrimitive.Title
            data-slot="sheet-title"
            className={cn("text-lg font-semibold leading-none", className)}
            {...props}
        />
    );
}

function SheetDescription({
    className,
    ...props
}: DialogPrimitive.Description.Props) {
    return (
        <DialogPrimitive.Description
            data-slot="sheet-description"
            className={cn(
                "text-muted-foreground text-sm",
                className
            )}
            {...props}
        />
    );
}

export {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetOverlay,
    SheetPortal,
    SheetTitle,
    SheetTrigger,
};

/** @format */

"use client";

import * as React from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface CredenzaProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
}

function Credenza({ open, onOpenChange, children }: CredenzaProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {children}
        </Dialog>
    );
}

function CredenzaContent({
    className,
    children,
    ...props
}: React.ComponentProps<typeof DialogContent>) {
    return (
        <DialogContent className={className} {...props}>
            {children}
        </DialogContent>
    );
}

function CredenzaHeader({
    children,
    ...props
}: React.ComponentProps<typeof DialogHeader>) {
    return <DialogHeader {...props}>{children}</DialogHeader>;
}

function CredenzaTitle({
    children,
    ...props
}: React.ComponentProps<typeof DialogTitle>) {
    return <DialogTitle {...props}>{children}</DialogTitle>;
}

function CredenzaDescription({
    children,
    ...props
}: React.ComponentProps<typeof DialogDescription>) {
    return <DialogDescription {...props}>{children}</DialogDescription>;
}

function CredenzaBody({
    children,
    className,
    ...props
}: React.ComponentProps<"div">) {
    return (
        <div className={className} {...props}>
            {children}
        </div>
    );
}

function CredenzaFooter({
    children,
    className,
    ...props
}: React.ComponentProps<typeof DialogFooter>) {
    return (
        <DialogFooter className={className} {...props}>
            {children}
        </DialogFooter>
    );
}

export {
    Credenza,
    CredenzaBody,
    CredenzaContent,
    CredenzaDescription,
    CredenzaFooter,
    CredenzaHeader,
    CredenzaTitle,
};

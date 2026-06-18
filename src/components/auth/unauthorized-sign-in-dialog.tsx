/** @format */

"use client";

import { ShieldAlert } from "lucide-react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UNAUTHORIZED_MESSAGE } from "@/lib/auth/unauthorized";

interface UnauthorizedSignInDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function UnauthorizedSignInDialog({
    open,
    onOpenChange,
}: UnauthorizedSignInDialogProps) {
    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
        >
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                        <ShieldAlert className="h-6 w-6 text-destructive" />
                    </div>
                    <DialogTitle className="text-center text-lg">
                        Unauthorized
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        {UNAUTHORIZED_MESSAGE}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="sm:justify-center">
                    <DialogClose render={<Button className="min-w-24" />}>
                        OK
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

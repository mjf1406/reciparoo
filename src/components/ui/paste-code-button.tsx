/** @format */

"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Clipboard, Check } from "lucide-react";

interface PasteCodeButtonProps {
    onPaste: (code: string) => void;
    codeLength: number;
    codeType?: "numeric" | "alphanumeric";
    disabled?: boolean;
}

export function PasteCodeButton({
    onPaste,
    codeLength,
    codeType = "numeric",
    disabled = false,
}: PasteCodeButtonProps) {
    const [copied, setCopied] = React.useState(false);

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            // Validate the pasted text
            const trimmed = text.trim();
            if (codeType === "numeric") {
                if (/^\d+$/.test(trimmed) && trimmed.length === codeLength) {
                    onPaste(trimmed);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                }
            } else {
                if (trimmed.length === codeLength) {
                    onPaste(trimmed);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                }
            }
        } catch (err) {
            console.error("Failed to read clipboard:", err);
        }
    };

    return (
        <Button
            type="button"
            variant="outline"
            onClick={handlePaste}
            disabled={disabled}
            className="w-full"
        >
            {copied ? (
                <>
                    <Check className="mr-2 h-4 w-4" />
                    Code Pasted
                </>
            ) : (
                <>
                    <Clipboard className="mr-2 h-4 w-4" />
                    Paste Code
                </>
            )}
        </Button>
    );
}

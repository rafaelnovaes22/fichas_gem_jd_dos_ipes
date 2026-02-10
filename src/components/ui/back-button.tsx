"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
    className?: string;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    label?: string;
}

export function BackButton({ className, variant = "outline", label = "Voltar" }: BackButtonProps) {
    const router = useRouter();

    const handleBack = () => {
        router.back();
    };

    return (
        <Button
            variant={variant}
            size="sm"
            className={`flex items-center gap-2 ${className}`}
            onClick={handleBack}
        >
            <ArrowLeft className="h-4 w-4" />
            {label}
        </Button>
    );
}

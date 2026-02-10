"use client";

import dynamic from "next/dynamic";
import { type ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

// Import dynamically with SSR disabled
const FichaPDFButtonBase = dynamic(
    () => import("./FichaPDFButton").then((mod) => mod.FichaPDFButton),
    {
        ssr: false,
        loading: () => (
            <Button variant="outline" disabled className="h-10 md:h-9">
                <Download className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Carregando PDF...</span>
                <span className="sm:hidden">PDF</span>
            </Button>
        ),
    }
);

export function FichaPDFButton(props: ComponentProps<typeof FichaPDFButtonBase>) {
    return <FichaPDFButtonBase {...props} />;
}

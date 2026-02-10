"use client";

import { useState } from "react";
import { PDFDownloadLink, pdf } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import { Printer, Download, Loader2 } from "lucide-react";
import { FichaPDFDocument } from "./FichaPDF";

interface Aula {
    id: string;
    numeroAula: number;
    data: Date | null;
    anotacoes: string | null;
    presenca: boolean;
    ausencia: boolean;
    justificativa: string | null;
    vistoInstrutor: boolean;
    instrutor: { usuario: { nome: string } } | null;
    topicoMsa: { numero: string; titulo: string; fase: { nome: string } } | null;
}

interface Avaliacao {
    id: string;
    numeroAvaliacao: number;
    data: Date | null;
    nota: number | null;
    anotacoes: string | null;
    presenca: boolean;
    ausencia: boolean;
    justificativa: string | null;
    vistoInstrutor: boolean;
    instrutor: { usuario: { nome: string } } | null;
}

interface FichaPDFButtonProps {
    ficha: {
        id: string;
        tipoAula: string;
        nivel: string | null;
        livro: string | null;
        mediaFinal: number | null;
        apto: boolean | null;
        encarregadoLocal: string | null;
        aluno: {
            nome: string;
            congregacao: string;
            instrumento: { nome: string };
            fase: { nome: string };
            instrutor: { usuario: { nome: string } };
            instrutor2?: { usuario: { nome: string } } | null;
        };
    };
    aulas: Aula[];
    avaliacoes: Avaliacao[];
    variant?: "default" | "outline" | "ghost";
    size?: "default" | "sm" | "lg" | "icon";
}

const tipoAulaLabel: Record<string, string> = {
    SOLFEJO: "Solfejo",
    TEORIA_MUSICAL: "Teoria_Musical",
    PRATICA_INSTRUMENTO: "Pratica_Instrumento",
    HINARIO: "Hinario",
};

export function FichaPDFButton({
    ficha,
    aulas,
    avaliacoes,
    variant = "outline",
    size = "default",
}: FichaPDFButtonProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isClient, setIsClient] = useState(false);

    // Evitar erro de hidratação e erro do PDFDownloadLink no servidor
    useState(() => {
        setIsClient(true);
    });

    const fileName = `Ficha_${tipoAulaLabel[ficha.tipoAula] || ficha.tipoAula}_${ficha.aluno.nome.replace(/\s+/g, "_")}.pdf`;

    const handlePrint = async () => {
        setIsGenerating(true);
        try {
            const blob = await pdf(
                <FichaPDFDocument ficha={ficha} aulas={aulas} avaliacoes={avaliacoes} />
            ).toBlob();

            const url = URL.createObjectURL(blob);
            const printWindow = window.open(url, "_blank");
            if (printWindow) {
                printWindow.onload = () => {
                    printWindow.print();
                };
            }
        } catch (error) {
            console.error("Erro ao gerar PDF:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="flex gap-2">
            {isClient ? (
                <PDFDownloadLink
                    document={<FichaPDFDocument ficha={ficha} aulas={aulas} avaliacoes={avaliacoes} />}
                    fileName={fileName}
                >
                    {({ loading }) => (
                        <Button
                            variant={variant}
                            size={size}
                            disabled={loading || isGenerating}
                            className="h-10 md:h-9"
                        >
                            {loading || isGenerating ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Gerando...
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4 mr-2" />
                                    <span className="hidden sm:inline">Baixar PDF</span>
                                    <span className="sm:hidden">PDF</span>
                                </>
                            )}
                        </Button>
                    )}
                </PDFDownloadLink>
            ) : (
                <Button
                    variant={variant}
                    size={size}
                    disabled={true}
                    className="h-10 md:h-9"
                >
                    <Download className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Carregando...</span>
                    <span className="sm:hidden">PDF</span>
                </Button>
            )}

            <Button
                variant="outline"
                size={size}
                onClick={handlePrint}
                disabled={isGenerating}
                className="h-10 md:h-9"
            >
                {isGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <>
                        <Printer className="w-4 h-4 mr-2 hidden sm:inline" />
                        <Printer className="w-4 h-4 sm:hidden" />
                        <span className="hidden sm:inline">Imprimir</span>
                    </>
                )}
            </Button>
        </div>
    );
}

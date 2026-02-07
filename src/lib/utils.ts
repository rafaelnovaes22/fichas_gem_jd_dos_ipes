import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { NivelProgramaMinimo, FaseOrquestra } from "@prisma/client";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function diaSemanaLabel(diaSemana: string | null | undefined): string {
    if (!diaSemana) return "Não definido";

    const labels: Record<string, string> = {
        DOMINGO: "Domingo",
        SEGUNDA: "Segunda-feira",
        TERCA: "Terça-feira",
        QUARTA: "Quarta-feira",
        QUINTA: "Quinta-feira",
        SEXTA: "Sexta-feira",
        SABADO: "Sábado",
    };

    return labels[diaSemana] || diaSemana;
}

export function faseOrquestraToNivel(
    faseOrquestra: FaseOrquestra
): NivelProgramaMinimo | null {
    switch (faseOrquestra) {
        case FaseOrquestra.ENSAIO:
            return null;
        case FaseOrquestra.RJM:
            return NivelProgramaMinimo.RJM;
        case FaseOrquestra.CULTO:
        case FaseOrquestra.TROCA_INSTRUMENTO_CULTO:
            return NivelProgramaMinimo.CULTO;
        case FaseOrquestra.OFICIALIZACAO:
        case FaseOrquestra.TROCA_INSTRUMENTO_OFICIALIZACAO:
        case FaseOrquestra.OFICIALIZADO:
            return NivelProgramaMinimo.OFICIALIZACAO;
        default:
            return null;
    }
}

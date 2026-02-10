import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NivelProgramaMinimo, TipoConteudoPM } from "@prisma/client";

interface ProgramaMinimoData {
    instrumento: string;
    categoria: string;
    nivel: NivelProgramaMinimo;
    itens: {
        tipo: TipoConteudoPM;
        descricao: string;
        alternativas?: string;
        obrigatorio: boolean;
        ordem: number;
    }[];
}

const programaMinimoData: ProgramaMinimoData[] = [
    // === CORDAS ===
    // VIOLINO
    {
        instrumento: "Violino",
        categoria: "Cordas",
        nivel: NivelProgramaMinimo.RJM,
        itens: [
            {
                tipo: TipoConteudoPM.METODO_INSTRUMENTO,
                descricao: "N. LAOUREX Vol. 1 até pág. 35",
                alternativas: "Schimoll até pág. 46 (lição 113) + H. SITT Vol 1 até lição 8 OU MÉTODO FACILITADO - Ed. Britten - até pág. 40",
                obrigatorio: true,
                ordem: 1,
            },
            {
                tipo: TipoConteudoPM.HINARIO,
                descricao: "Hinos 431 a 480 soprano no natural",
                obrigatorio: true,
                ordem: 2,
            },
        ],
    },
    {
        instrumento: "Violino",
        categoria: "Cordas",
        nivel: NivelProgramaMinimo.CULTO,
        itens: [
            {
                tipo: TipoConteudoPM.METODO_INSTRUMENTO,
                descricao: "N. LAOUREX Vol. 1 completo + Vol. 3 até pág. 15",
                alternativas: "Schimoll até pág. 67 (lição 182) + H. SITT Vol 1 até lição 14 OU MÉTODO FACILITADO - Ed. Britten - até pág. 55",
                obrigatorio: true,
                ordem: 1,
            },
            {
                tipo: TipoConteudoPM.HINARIO,
                descricao: "Hinário completo soprano 8ª acima",
                obrigatorio: true,
                ordem: 2,
            },
        ],
    },
    {
        instrumento: "Violino",
        categoria: "Cordas",
        nivel: NivelProgramaMinimo.OFICIALIZACAO,
        itens: [
            {
                tipo: TipoConteudoPM.METODO_INSTRUMENTO,
                descricao: "N. LAOUREX Vol. 1 completo + Vol. 3 até pág. 24 e da pág. 44 a 53",
                alternativas: "MÉTODO Schimoll completo + H. SITT Op.32 Vol. 1 completo OU MÉTODO FACILITADO - Ed. Britten - Completo",
                obrigatorio: true,
                ordem: 1,
            },
            {
                tipo: TipoConteudoPM.HINARIO,
                descricao: "Hinário completo soprano 8ª acima e contralto natural",
                obrigatorio: true,
                ordem: 2,
            },
        ],
    },
    // VIOLA
    {
        instrumento: "Viola",
        categoria: "Cordas",
        nivel: NivelProgramaMinimo.RJM,
        itens: [
            {
                tipo: TipoConteudoPM.METODO_INSTRUMENTO,
                descricao: "BEGINNING STRINGS até lição VI + BERTA VOLMER vol. 1 até pág. 31",
                alternativas: "MÉTODO FACILITADO - Ed. Britten - até pág. 40",
                obrigatorio: true,
                ordem: 1,
            },
        ],
    },
    {
        instrumento: "Viola",
        categoria: "Cordas",
        nivel: NivelProgramaMinimo.CULTO,
        itens: [
            {
                tipo: TipoConteudoPM.METODO_INSTRUMENTO,
                descricao: "BERTA VOLMER vol. 1 até pág. 62 + MÉTODO A TUNE A DAY C.P. Herfurth Vol. 3 até pág 16",
                alternativas: "MÉTODO FACILITADO - Ed. Britten - até pág. 55",
                obrigatorio: true,
                ordem: 1,
            },
        ],
    },
    {
        instrumento: "Viola",
        categoria: "Cordas",
        nivel: NivelProgramaMinimo.OFICIALIZACAO,
        itens: [
            {
                tipo: TipoConteudoPM.METODO_INSTRUMENTO,
                descricao: "BERTA VOLMER vol. 1 completo + A TUNE A DAY C.P. Herfurth Vol. 3 completo",
                alternativas: "MÉTODO FACILITADO - Ed. Britten - completo",
                obrigatorio: true,
                ordem: 1,
            },
        ],
    },
    // VIOLONCELO
    {
        instrumento: "Violoncelo",
        categoria: "Cordas",
        nivel: NivelProgramaMinimo.RJM,
        itens: [
            {
                tipo: TipoConteudoPM.METODO_INSTRUMENTO,
                descricao: "BEGINNING STRINGS até lição VI + DOTZAUER vol. 1 até pág. 34 (lição 80)",
                alternativas: "MÉTODO FACILITADO - Ed. Britten - até pág. 40",
                obrigatorio: true,
                ordem: 1,
            },
        ],
    },
    {
        instrumento: "Violoncelo",
        categoria: "Cordas",
        nivel: NivelProgramaMinimo.CULTO,
        itens: [
            {
                tipo: TipoConteudoPM.METODO_INSTRUMENTO,
                descricao: "DOTZAUER vol. 1 completo + DOTZAUER vol. 2 até pág. 03 (lição 111)",
                alternativas: "MÉTODO FACILITADO - Ed. Britten - até pág. 52",
                obrigatorio: true,
                ordem: 1,
            },
        ],
    },
    {
        instrumento: "Violoncelo",
        categoria: "Cordas",
        nivel: NivelProgramaMinimo.OFICIALIZACAO,
        itens: [
            {
                tipo: TipoConteudoPM.METODO_INSTRUMENTO,
                descricao: "DOTZAUER vol. 1 completo + DOTZAUER vol. 2 até pág. 19 (lição 154)",
                alternativas: "MÉTODO FACILITADO - Ed. Britten - Completo",
                obrigatorio: true,
                ordem: 1,
            },
        ],
    },

    // === MADEIRAS ===
    // FLAUTA TRANSVERSAL
    {
        instrumento: "Flauta Transversal",
        categoria: "Madeiras",
        nivel: NivelProgramaMinimo.RJM,
        itens: [
            {
                tipo: TipoConteudoPM.METODO_INSTRUMENTO,
                descricao: "Rubank Elementary - Completo",
                alternativas: "PARÉS até lição 41 OU GALLI até pág. 41 OU MÉTODO PRÁTICO - Almeida Dias - até fase 13",
                obrigatorio: true,
                ordem: 1,
            },
        ],
    },
    {
        instrumento: "Flauta Transversal",
        categoria: "Madeiras",
        nivel: NivelProgramaMinimo.CULTO,
        itens: [
            {
                tipo: TipoConteudoPM.METODO_INSTRUMENTO,
                descricao: "Rubank Intermediate - até a pg. 29",
                alternativas: "PARÉS até lição 62 OU GALLI completo OU MÉTODO PRÁTICO - Almeida Dias - até fase 25",
                obrigatorio: true,
                ordem: 1,
            },
        ],
    },
    {
        instrumento: "Flauta Transversal",
        categoria: "Madeiras",
        nivel: NivelProgramaMinimo.OFICIALIZACAO,
        itens: [
            {
                tipo: TipoConteudoPM.METODO_INSTRUMENTO,
                descricao: "Rubank Intermediate - Completo",
                alternativas: "PARÉS até lição 62 OU GALLI completo OU MÉTODO PRÁTICO - Almeida Dias - até fase 25",
                obrigatorio: true,
                ordem: 1,
            },
        ],
    },
    // OBOÉ
    {
        instrumento: "Oboé",
        categoria: "Madeiras",
        nivel: NivelProgramaMinimo.RJM,
        itens: [
            {
                tipo: TipoConteudoPM.METODO_INSTRUMENTO,
                descricao: "RUBANK Elementary Method for Oboe - Completo",
                alternativas: "GIAMPIERI até pág. 21",
                obrigatorio: true,
                ordem: 1,
            },
        ],
    },
    {
        instrumento: "Oboé",
        categoria: "Madeiras",
        nivel: NivelProgramaMinimo.CULTO,
        itens: [
            {
                tipo: TipoConteudoPM.METODO_INSTRUMENTO,
                descricao: "RUBANK Intermediate Method for Oboe até pág. 16",
                alternativas: "GIAMPIERI até pág. 30",
                obrigatorio: true,
                ordem: 1,
            },
        ],
    },
    {
        instrumento: "Oboé",
        categoria: "Madeiras",
        nivel: NivelProgramaMinimo.OFICIALIZACAO,
        itens: [
            {
                tipo: TipoConteudoPM.METODO_INSTRUMENTO,
                descricao: "RUBANK Intermediate Method for Oboe até pág. 30",
                alternativas: "GIAMPIERI até pág. 50",
                obrigatorio: true,
                ordem: 1,
            },
        ],
    },
    // FAGOTE
    {
        instrumento: "Fagote",
        categoria: "Madeiras",
        nivel: NivelProgramaMinimo.RJM,
        itens: [
            {
                tipo: TipoConteudoPM.METODO_INSTRUMENTO,
                descricao: "WEISSENBORN até Módulo 12",
                alternativas: "GIAMPIERI até pág. 14",
                obrigatorio: true,
                ordem: 1,
            },
        ],
    },
    {
        instrumento: "Fagote",
        categoria: "Madeiras",
        nivel: NivelProgramaMinimo.CULTO,
        itens: [
            {
                tipo: TipoConteudoPM.METODO_INSTRUMENTO,
                descricao: "WEISSENBORN até Módulo 15",
                alternativas: "GIAMPIERI até pág. 18",
                obrigatorio: true,
                ordem: 1,
            },
        ],
    },
    {
        instrumento: "Fagote",
        categoria: "Madeiras",
        nivel: NivelProgramaMinimo.OFICIALIZACAO,
        itens: [
            {
                tipo: TipoConteudoPM.METODO_INSTRUMENTO,
                descricao: "WEISSENBORN até Módulo 20",
                alternativas: "GIAMPIERI até pág. 23",
                obrigatorio: true,
                ordem: 1,
            },
        ],
    },
    // CLARINETE
    {
        instrumento: "Clarinete",
        categoria: "Madeiras",
        nivel: NivelProgramaMinimo.RJM,
        itens: [
            {
                tipo: TipoConteudoPM.METODO_INSTRUMENTO,
                descricao: "GIAMPIERI até pág. 28",
                alternativas: "DOMINGOS PECCI até pág. 29 OU GALPER - Book 1 Lição 26 - Até exercício 110",
                obrigatorio: true,
                ordem: 1,
            },
        ],
    },
    {
        instrumento: "Clarinete",
        categoria: "Madeiras",
        nivel: NivelProgramaMinimo.CULTO,
        itens: [
            {
                tipo: TipoConteudoPM.METODO_INSTRUMENTO,
                descricao: "GIAMPIERI até pág. 41",
                alternativas: "DOMINGOS PECCI até pág. 36",
                obrigatorio: true,
                ordem: 1,
            },
        ],
    },
    {
        instrumento: "Clarinete",
        categoria: "Madeiras",
        nivel: NivelProgramaMinimo.OFICIALIZACAO,
        itens: [
            {
                tipo: TipoConteudoPM.METODO_INSTRUMENTO,
                descricao: "GIAMPIERI até pág. 63",
                alternativas: "DOMINGOS PECCI completo OU GALPER - Book 1 Completo + Book 2 até Pág. 29",
                obrigatorio: true,
                ordem: 1,
            },
        ],
    },
    // CLARINETE ALTO
    {
        instrumento: "Clarinete Alto",
        categoria: "Madeiras",
        nivel: NivelProgramaMinimo.RJM,
        itens: [
            {
                tipo: TipoConteudoPM.METODO_INSTRUMENTO,
                descricao: "GIAMPIERI até pág. 28",
                alternativas: "GALPER - Book 1 Lição 26 - Até exercício 110",
                obrigatorio: true,
                ordem: 1,
            },
        ],
    },
    {
        instrumento: "Clarinete Alto",
        categoria: "Madeiras",
        nivel: NivelProgramaMinimo.CULTO,
        itens: [
            {
                tipo: TipoConteudoPM.METODO_INSTRUMENTO,
                descricao: "GIAMPIERI até pág. 36",
                alternativas: "GALPER - Book 1 Completo + Book 2 até Pág. 18",
                obrigatorio: true,
                ordem: 1,
            },
        ],
    },
    {
        instrumento: "Clarinete Alto",
        categoria: "Madeiras",
        nivel: NivelProgramaMinimo.OFICIALIZACAO,
        itens: [
            {
                tipo: TipoConteudoPM.METODO_INSTRUMENTO,
                descricao: "GIAMPIERI até pág. 50",
                alternativas: "GALPER - Book 1 Completo + Book 2 até Pág. 29",
                obrigatorio: true,
                ordem: 1,
            },
        ],
    },
    // CLARINETE BAIXO
    {
        instrumento: "Clarinete Baixo",
        categoria: "Madeiras",
        nivel: NivelProgramaMinimo.RJM,
        itens: [
            {
                tipo: TipoConteudoPM.METODO_INSTRUMENTO,
                descricao: "GIAMPIERI até pág. 28",
                alternativas: "GALPER - Book 1 Lição 26 - Até exercício 110",
                obrigatorio: true,
                ordem: 1,
            },
        ],
    },
    {
        instrumento: "Clarinete Baixo",
        categoria: "Madeiras",
        nivel: NivelProgramaMinimo.CULTO,
        itens: [
            {
                tipo: TipoConteudoPM.METODO_INSTRUMENTO,
                descricao: "GIAMPIERI até pág. 36",
                alternativas: "GALPER - Book 1 Completo + Book 2 até Pág. 18",
                obrigatorio: true,
                ordem: 1,
            },
        ],
    },
    {
        instrumento: "Clarinete Baixo",
        categoria: "Madeiras",
        nivel: NivelProgramaMinimo.OFICIALIZACAO,
        itens: [
            {
                tipo: TipoConteudoPM.METODO_INSTRUMENTO,
                descricao: "GIAMPIERI até pág. 50",
                alternativas: "GALPER - Book 1 Completo + Book 2 até Pág. 29",
                obrigatorio: true,
                ordem: 1,
            },
        ],
    },

    // === SAXOFONES ===
    // SAXOFONE SOPRANO
    {
        instrumento: "Saxofone Soprano",
        categoria: "Saxofones",
        nivel: NivelProgramaMinimo.RJM,
        itens: [
            {
                tipo: TipoConteudoPM.METODO_INSTRUMENTO,
                descricao: "GIAMPIERI até pg.21",
                alternativas: "AMADEU RUSSO até pg.25 OU MÉTODO PRÁTICO - Almeida Dias - até fase 13",
                obrigatorio: true,
                ordem: 1,
            },
        ],
    },
    {
        instrumento: "Saxofone Soprano",
        categoria: "Saxofones",
        nivel: NivelProgramaMinimo.CULTO,
        itens: [
            {
                tipo: TipoConteudoPM.METODO_INSTRUMENTO,
                descricao: "GIAMPIERI até pg.36",
                alternativas: "AMADEU RUSSO até pg.36 OU MÉTODO PRÁTICO - Almeida Dias - até fase 20",
                obrigatorio: true,
                ordem: 1,
            },
        ],
    },
    {
        instrumento: "Saxofone Soprano",
        categoria: "Saxofones",
        nivel: NivelProgramaMinimo.OFICIALIZACAO,
        itens: [
            {
                tipo: TipoConteudoPM.METODO_INSTRUMENTO,
                descricao: "GIAMPIERI até pg.50",
                alternativas: "AMADEU RUSSO até pg.47 OU MÉTODO PRÁTICO - Almeida Dias - até fase 25",
                obrigatorio: true,
                ordem: 1,
            },
        ],
    },
    // SAXOFONE ALTO
    {
        instrumento: "Saxofone Alto",
        categoria: "Saxofones",
        nivel: NivelProgramaMinimo.RJM,
        itens: [
            {
                tipo: TipoConteudoPM.METODO_INSTRUMENTO,
                descricao: "GIAMPIERI até pg.21",
                alternativas: "AMADEU RUSSO até pg.25 OU MÉTODO PRÁTICO - Almeida Dias - até fase 13",
                obrigatorio: true,
                ordem: 1,
            },
        ],
    },
    {
        instrumento: "Saxofone Alto",
        categoria: "Saxofones",
        nivel: NivelProgramaMinimo.CULTO,
        itens: [
            {
                tipo: TipoConteudoPM.METODO_INSTRUMENTO,
                descricao: "GIAMPIERI até pg.36",
                alternativas: "AMADEU RUSSO até pg.36 OU MÉTODO PRÁTICO - Almeida Dias - até fase 20",
                obrigatorio: true,
                ordem: 1,
            },
        ],
    },
    {
        instrumento: "Saxofone Alto",
        categoria: "Saxofones",
        nivel: NivelProgramaMinimo.OFICIALIZACAO,
        itens: [
            {
                tipo: TipoConteudoPM.METODO_INSTRUMENTO,
                descricao: "GIAMPIERI até pg.50",
                alternativas: "AMADEU RUSSO até pg.47 OU MÉTODO PRÁTICO - Almeida Dias - até fase 25",
                obrigatorio: true,
                ordem: 1,
            },
        ],
    },
    // SAXOFONE TENOR
    {
        instrumento: "Saxofone Tenor",
        categoria: "Saxofones",
        nivel: NivelProgramaMinimo.RJM,
        itens: [
            {
                tipo: TipoConteudoPM.METODO_INSTRUMENTO,
                descricao: "GIAMPIERI até pg.21",
                alternativas: "AMADEU RUSSO até pg.25 OU MÉTODO PRÁTICO - Almeida Dias - até fase 13",
                obrigatorio: true,
                ordem: 1,
            },
        ],
    },
    {
        instrumento: "Saxofone Tenor",
        categoria: "Saxofones",
        nivel: NivelProgramaMinimo.CULTO,
        itens: [
            {
                tipo: TipoConteudoPM.METODO_INSTRUMENTO,
                descricao: "GIAMPIERI até pg.36",
                alternativas: "AMADEU RUSSO até pg.36 OU MÉTODO PRÁTICO - Almeida Dias - até fase 20",
                obrigatorio: true,
                ordem: 1,
            },
        ],
    },
    {
        instrumento: "Saxofone Tenor",
        categoria: "Saxofones",
        nivel: NivelProgramaMinimo.OFICIALIZACAO,
        itens: [
            {
                tipo: TipoConteudoPM.METODO_INSTRUMENTO,
                descricao: "GIAMPIERI até pg.50",
                alternativas: "AMADEU RUSSO até pg.47 OU MÉTODO PRÁTICO - Almeida Dias - até fase 25",
                obrigatorio: true,
                ordem: 1,
            },
        ],
    },
    // SAXOFONE BARÍTONO
    {
        instrumento: "Saxofone Barítono",
        categoria: "Saxofones",
        nivel: NivelProgramaMinimo.RJM,
        itens: [
            {
                tipo: TipoConteudoPM.METODO_INSTRUMENTO,
                descricao: "GIAMPIERI até pg.21",
                alternativas: "AMADEU RUSSO até pg.25 OU MÉTODO PRÁTICO - Almeida Dias - até fase 13",
                obrigatorio: true,
                ordem: 1,
            },
        ],
    },
    {
        instrumento: "Saxofone Barítono",
        categoria: "Saxofones",
        nivel: NivelProgramaMinimo.CULTO,
        itens: [
            {
                tipo: TipoConteudoPM.METODO_INSTRUMENTO,
                descricao: "GIAMPIERI até pg.36",
                alternativas: "AMADEU RUSSO até pg.36 OU MÉTODO PRÁTICO - Almeida Dias - até fase 20",
                obrigatorio: true,
                ordem: 1,
            },
        ],
    },
    {
        instrumento: "Saxofone Barítono",
        categoria: "Saxofones",
        nivel: NivelProgramaMinimo.OFICIALIZACAO,
        itens: [
            {
                tipo: TipoConteudoPM.METODO_INSTRUMENTO,
                descricao: "GIAMPIERI até pg.50",
                alternativas: "AMADEU RUSSO até pg.47 OU MÉTODO PRÁTICO - Almeida Dias - até fase 25",
                obrigatorio: true,
                ordem: 1,
            },
        ],
    },

    // === METAIS ===
    // TROMPETE
    {
        instrumento: "Trompete",
        categoria: "Metais",
        nivel: NivelProgramaMinimo.RJM,
        itens: [
            {
                tipo: TipoConteudoPM.METODO_INSTRUMENTO,
                descricao: "Método ARBANS até pág.20",
                obrigatorio: true,
                ordem: 1,
            },
        ],
    },
    {
        instrumento: "Trompete",
        categoria: "Metais",
        nivel: NivelProgramaMinimo.CULTO,
        itens: [
            {
                tipo: TipoConteudoPM.METODO_INSTRUMENTO,
                descricao: "Método ARBANS até pág.40",
                obrigatorio: true,
                ordem: 1,
            },
        ],
    },
    {
        instrumento: "Trompete",
        categoria: "Metais",
        nivel: NivelProgramaMinimo.OFICIALIZACAO,
        itens: [
            {
                tipo: TipoConteudoPM.METODO_INSTRUMENTO,
                descricao: "Método ARBANS completo",
                obrigatorio: true,
                ordem: 1,
            },
        ],
    },
    // TROMBONE
    {
        instrumento: "Trombone",
        categoria: "Metais",
        nivel: NivelProgramaMinimo.RJM,
        itens: [
            {
                tipo: TipoConteudoPM.METODO_INSTRUMENTO,
                descricao: "Método RUBANK Vol.1 até pág.20",
                obrigatorio: true,
                ordem: 1,
            },
        ],
    },
    {
        instrumento: "Trombone",
        categoria: "Metais",
        nivel: NivelProgramaMinimo.CULTO,
        itens: [
            {
                tipo: TipoConteudoPM.METODO_INSTRUMENTO,
                descricao: "Método RUBANK Vol.1 até pág.40",
                obrigatorio: true,
                ordem: 1,
            },
        ],
    },
    {
        instrumento: "Trombone",
        categoria: "Metais",
        nivel: NivelProgramaMinimo.OFICIALIZACAO,
        itens: [
            {
                tipo: TipoConteudoPM.METODO_INSTRUMENTO,
                descricao: "Método RUBANK Vol.1 e Vol.2 completo",
                obrigatorio: true,
                ordem: 1,
            },
        ],
    },
    // TUBA
    {
        instrumento: "Tuba",
        categoria: "Metais",
        nivel: NivelProgramaMinimo.RJM,
        itens: [
            {
                tipo: TipoConteudoPM.METODO_INSTRUMENTO,
                descricao: "Método RUBANK Vol.1 até pág.16",
                obrigatorio: true,
                ordem: 1,
            },
        ],
    },
    {
        instrumento: "Tuba",
        categoria: "Metais",
        nivel: NivelProgramaMinimo.CULTO,
        itens: [
            {
                tipo: TipoConteudoPM.METODO_INSTRUMENTO,
                descricao: "Método RUBANK Vol.1 até pág.32",
                obrigatorio: true,
                ordem: 1,
            },
        ],
    },
    {
        instrumento: "Tuba",
        categoria: "Metais",
        nivel: NivelProgramaMinimo.OFICIALIZACAO,
        itens: [
            {
                tipo: TipoConteudoPM.METODO_INSTRUMENTO,
                descricao: "Método RUBANK Vol.1 e Vol.2 completo",
                obrigatorio: true,
                ordem: 1,
            },
        ],
    },
    // EUFÔNIO (Bombardino)
    {
        instrumento: "Eufônio (Bombardino)",
        categoria: "Metais",
        nivel: NivelProgramaMinimo.RJM,
        itens: [
            {
                tipo: TipoConteudoPM.METODO_INSTRUMENTO,
                descricao: "Método RUBANK Vol.1 até pág.20",
                obrigatorio: true,
                ordem: 1,
            },
        ],
    },
    {
        instrumento: "Eufônio (Bombardino)",
        categoria: "Metais",
        nivel: NivelProgramaMinimo.CULTO,
        itens: [
            {
                tipo: TipoConteudoPM.METODO_INSTRUMENTO,
                descricao: "Método RUBANK Vol.1 até pág.40",
                obrigatorio: true,
                ordem: 1,
            },
        ],
    },
    {
        instrumento: "Eufônio (Bombardino)",
        categoria: "Metais",
        nivel: NivelProgramaMinimo.OFICIALIZACAO,
        itens: [
            {
                tipo: TipoConteudoPM.METODO_INSTRUMENTO,
                descricao: "Método RUBANK Vol.1 e Vol.2 completo",
                obrigatorio: true,
                ordem: 1,
            },
        ],
    },
    // TROMPA
    {
        instrumento: "Trompa",
        categoria: "Metais",
        nivel: NivelProgramaMinimo.RJM,
        itens: [
            {
                tipo: TipoConteudoPM.METODO_INSTRUMENTO,
                descricao: "Método RUBANK Vol.1 até pág.20",
                obrigatorio: true,
                ordem: 1,
            },
        ],
    },
    {
        instrumento: "Trompa",
        categoria: "Metais",
        nivel: NivelProgramaMinimo.CULTO,
        itens: [
            {
                tipo: TipoConteudoPM.METODO_INSTRUMENTO,
                descricao: "Método RUBANK Vol.1 até pág.40",
                obrigatorio: true,
                ordem: 1,
            },
        ],
    },
    {
        instrumento: "Trompa",
        categoria: "Metais",
        nivel: NivelProgramaMinimo.OFICIALIZACAO,
        itens: [
            {
                tipo: TipoConteudoPM.METODO_INSTRUMENTO,
                descricao: "Método RUBANK Vol.1 e Vol.2 completo",
                obrigatorio: true,
                ordem: 1,
            },
        ],
    },

    // === TECLAS ===
    // ÓRGÃO
    {
        instrumento: "Órgão",
        categoria: "Teclas",
        nivel: NivelProgramaMinimo.RJM,
        itens: [
            {
                tipo: TipoConteudoPM.METODO_INSTRUMENTO,
                descricao: "Método Órgão CCB até fase 13",
                obrigatorio: true,
                ordem: 1,
            },
        ],
    },
    {
        instrumento: "Órgão",
        categoria: "Teclas",
        nivel: NivelProgramaMinimo.CULTO,
        itens: [
            {
                tipo: TipoConteudoPM.METODO_INSTRUMENTO,
                descricao: "Método Órgão CCB até fase 25",
                obrigatorio: true,
                ordem: 1,
            },
        ],
    },
    {
        instrumento: "Órgão",
        categoria: "Teclas",
        nivel: NivelProgramaMinimo.OFICIALIZACAO,
        itens: [
            {
                tipo: TipoConteudoPM.METODO_INSTRUMENTO,
                descricao: "Método Órgão CCB completo",
                obrigatorio: true,
                ordem: 1,
            },
        ],
    },
];

export async function POST() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
        }

        // Limpar dados existentes
        await prisma.programaMinimoItem.deleteMany();
        await prisma.programaMinimo.deleteMany();

        // Buscar instrumentos existentes
        const instrumentos = await prisma.instrumento.findMany();
        const instrumentoMap = new Map(instrumentos.map(i => [i.nome.toLowerCase(), i.id]));

        // Criar instrumentos que não existem
        const instrumentosNecessarios = [
            ...new Map(programaMinimoData.map(p => [p.instrumento, p.categoria])).entries()
        ];

        for (const [nome, categoria] of instrumentosNecessarios) {
            const nomeLower = nome.toLowerCase();
            if (!instrumentoMap.has(nomeLower)) {
                const novoInstrumento = await prisma.instrumento.create({
                    data: { nome, categoria },
                });
                instrumentoMap.set(nomeLower, novoInstrumento.id);
            }
        }

        // Itens comuns a TODOS os instrumentos por nível
        const itensComuns: Record<NivelProgramaMinimo, { tipo: TipoConteudoPM; descricao: string; obrigatorio: boolean; ordem: number }[]> = {
            [NivelProgramaMinimo.RJM]: [
                {
                    tipo: TipoConteudoPM.TEORIA,
                    descricao: "Método Simplificado de Aprendizagem Musical (MSA) – 2023 – Até FASE 12",
                    obrigatorio: true,
                    ordem: 10,
                },
                {
                    tipo: TipoConteudoPM.SOLFEJO,
                    descricao: "Hinos 431 a 480",
                    obrigatorio: true,
                    ordem: 11,
                },
                {
                    tipo: TipoConteudoPM.HINARIO,
                    descricao: "431 a 480 – Voz principal",
                    obrigatorio: true,
                    ordem: 12,
                },
            ],
            [NivelProgramaMinimo.CULTO]: [
                {
                    tipo: TipoConteudoPM.TEORIA,
                    descricao: "Método Simplificado de Aprendizagem Musical (MSA) – 2023 – Até Fase 16",
                    obrigatorio: true,
                    ordem: 10,
                },
                {
                    tipo: TipoConteudoPM.SOLFEJO,
                    descricao: "Todos os Hinos",
                    obrigatorio: true,
                    ordem: 11,
                },
                {
                    tipo: TipoConteudoPM.HINARIO,
                    descricao: "Completo – Voz principal + Voz alternativa",
                    obrigatorio: true,
                    ordem: 12,
                },
            ],
            [NivelProgramaMinimo.OFICIALIZACAO]: [
                {
                    tipo: TipoConteudoPM.TEORIA,
                    descricao: "Método Simplificado de Aprendizagem Musical (MSA) – 2023 – Completo com Revisão",
                    obrigatorio: true,
                    ordem: 10,
                },
                {
                    tipo: TipoConteudoPM.SOLFEJO,
                    descricao: "Todos os Hinos",
                    obrigatorio: true,
                    ordem: 11,
                },
                {
                    tipo: TipoConteudoPM.HINARIO,
                    descricao: "Completo – Voz principal + Voz alternativa",
                    obrigatorio: true,
                    ordem: 12,
                },
            ],
        };

        // Criar programas mínimos
        let count = 0;
        for (const programa of programaMinimoData) {
            const instrumentoId = instrumentoMap.get(programa.instrumento.toLowerCase());
            if (!instrumentoId) continue;

            // Itens específicos do instrumento
            const itensEspecificos = programa.itens.map(item => ({
                tipo: item.tipo,
                descricao: item.descricao,
                alternativas: item.alternativas || null,
                obrigatorio: item.obrigatorio,
                ordem: item.ordem,
            }));

            // Itens comuns (TEORIA + SOLFEJO para todos, HINÁRIO para todos exceto Violino)
            const isViolino = programa.instrumento.toLowerCase() === "violino";
            const comuns = itensComuns[programa.nivel]
                .filter(item => !(isViolino && item.tipo === TipoConteudoPM.HINARIO))
                .map(item => ({
                    tipo: item.tipo,
                    descricao: item.descricao,
                    alternativas: null,
                    obrigatorio: item.obrigatorio,
                    ordem: item.ordem,
                }));

            await prisma.programaMinimo.create({
                data: {
                    instrumentoId,
                    nivel: programa.nivel,
                    itens: {
                        create: [...itensEspecificos, ...comuns],
                    },
                },
            });
            count++;
        }

        return NextResponse.json({
            success: true,
            message: `Programa Mínimo populado com sucesso! ${count} registros criados.`,
        });
    } catch (error) {
        console.error("Erro ao popular Programa Mínimo:", error);
        return NextResponse.json(
            { error: "Erro interno ao popular dados" },
            { status: 500 }
        );
    }
}

import { PrismaClient, NivelProgramaMinimo, TipoConteudoPM } from "@prisma/client";

const prisma = new PrismaClient();

// Programa Mínimo para Músicos 2023 - Baseado na tabela oficial da CCB
interface ProgramaMinimoData {
  instrumento: string;
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
  // VIOLINO
  {
    instrumento: "Violino",
    nivel: NivelProgramaMinimo.RJM,
    itens: [
      {
        tipo: TipoConteudoPM.METODO_INSTRUMENTO,
        descricao: "N. LAOURENÇO Vol.1 até pág.35",
        alternativas: "Schimoll até pág.46",
        obrigatorio: true,
        ordem: 1,
      },
      {
        tipo: TipoConteudoPM.METODO_INSTRUMENTO,
        descricao: "H. SITT Vol.1 até lição 6",
        alternativas: "MÉTODO FACILITADO Ed. Britten até pág.40",
        obrigatorio: true,
        ordem: 2,
      },
      {
        tipo: TipoConteudoPM.TEORIA,
        descricao: "MSA até Fase 12",
        obrigatorio: true,
        ordem: 3,
      },
      {
        tipo: TipoConteudoPM.HINARIO,
        descricao: "Hinos 431 a 480",
        obrigatorio: true,
        ordem: 4,
      },
      {
        tipo: TipoConteudoPM.SOLFEJO,
        descricao: "431 a 480 Voz principal",
        obrigatorio: true,
        ordem: 5,
      },
    ],
  },
  {
    instrumento: "Violino",
    nivel: NivelProgramaMinimo.CULTO,
    itens: [
      {
        tipo: TipoConteudoPM.METODO_INSTRUMENTO,
        descricao: "N. LAOURENÇO Vol.1 completo + Vol.3 até pág.15",
        alternativas: "Schimoll até pág.67",
        obrigatorio: true,
        ordem: 1,
      },
      {
        tipo: TipoConteudoPM.METODO_INSTRUMENTO,
        descricao: "H. SITT Vol.1 até lição 14",
        alternativas: "MÉTODO FACILITADO Ed. Britten até pág.55",
        obrigatorio: true,
        ordem: 2,
      },
      {
        tipo: TipoConteudoPM.TEORIA,
        descricao: "MSA até Fase 16",
        obrigatorio: true,
        ordem: 3,
      },
      {
        tipo: TipoConteudoPM.HINARIO,
        descricao: "Todos os Hinos",
        obrigatorio: true,
        ordem: 4,
      },
      {
        tipo: TipoConteudoPM.SOLFEJO,
        descricao: "Completo Voz principal + Voz alternativa",
        obrigatorio: true,
        ordem: 5,
      },
    ],
  },
  {
    instrumento: "Violino",
    nivel: NivelProgramaMinimo.OFICIALIZACAO,
    itens: [
      {
        tipo: TipoConteudoPM.METODO_INSTRUMENTO,
        descricao: "N. LAOURENÇO Vol.1 completo + Vol.3 até pág.24 + da pág.44 a 53",
        alternativas: "MÉTODO Schimoll completo",
        obrigatorio: true,
        ordem: 1,
      },
      {
        tipo: TipoConteudoPM.METODO_INSTRUMENTO,
        descricao: "H. SITT Op.32 Vol.1 completo",
        alternativas: "MÉTODO FACILITADO Ed. Britten Completo",
        obrigatorio: true,
        ordem: 2,
      },
      {
        tipo: TipoConteudoPM.TEORIA,
        descricao: "MSA Completo com Revisão",
        obrigatorio: true,
        ordem: 3,
      },
      {
        tipo: TipoConteudoPM.HINARIO,
        descricao: "Todos os Hinos",
        obrigatorio: true,
        ordem: 4,
      },
      {
        tipo: TipoConteudoPM.SOLFEJO,
        descricao: "Completo Voz principal + Voz alternativa",
        obrigatorio: true,
        ordem: 5,
      },
    ],
  },
  // VIOLA
  {
    instrumento: "Viola",
    nivel: NivelProgramaMinimo.RJM,
    itens: [
      {
        tipo: TipoConteudoPM.METODO_INSTRUMENTO,
        descricao: "Método Premier Vol.1 até pág.44",
        obrigatorio: true,
        ordem: 1,
      },
      {
        tipo: TipoConteudoPM.TEORIA,
        descricao: "MSA até Fase 12",
        obrigatorio: true,
        ordem: 2,
      },
      {
        tipo: TipoConteudoPM.HINARIO,
        descricao: "Hinos 431 a 480",
        obrigatorio: true,
        ordem: 3,
      },
      {
        tipo: TipoConteudoPM.SOLFEJO,
        descricao: "431 a 480 Voz principal",
        obrigatorio: true,
        ordem: 4,
      },
    ],
  },
  {
    instrumento: "Viola",
    nivel: NivelProgramaMinimo.CULTO,
    itens: [
      {
        tipo: TipoConteudoPM.METODO_INSTRUMENTO,
        descricao: "Método Premier Vol.1 completo",
        obrigatorio: true,
        ordem: 1,
      },
      {
        tipo: TipoConteudoPM.TEORIA,
        descricao: "MSA até Fase 16",
        obrigatorio: true,
        ordem: 2,
      },
      {
        tipo: TipoConteudoPM.HINARIO,
        descricao: "Todos os Hinos",
        obrigatorio: true,
        ordem: 3,
      },
      {
        tipo: TipoConteudoPM.SOLFEJO,
        descricao: "Completo Voz principal + Voz alternativa",
        obrigatorio: true,
        ordem: 4,
      },
    ],
  },
  {
    instrumento: "Viola",
    nivel: NivelProgramaMinimo.OFICIALIZACAO,
    itens: [
      {
        tipo: TipoConteudoPM.METODO_INSTRUMENTO,
        descricao: "Método Premier Vol.1 e Vol.2 completo",
        obrigatorio: true,
        ordem: 1,
      },
      {
        tipo: TipoConteudoPM.TEORIA,
        descricao: "MSA Completo com Revisão",
        obrigatorio: true,
        ordem: 2,
      },
      {
        tipo: TipoConteudoPM.HINARIO,
        descricao: "Todos os Hinos",
        obrigatorio: true,
        ordem: 3,
      },
      {
        tipo: TipoConteudoPM.SOLFEJO,
        descricao: "Completo Voz principal + Voz alternativa",
        obrigatorio: true,
        ordem: 4,
      },
    ],
  },
  // VIOLONCELO
  {
    instrumento: "Violoncelo",
    nivel: NivelProgramaMinimo.RJM,
    itens: [
      {
        tipo: TipoConteudoPM.METODO_INSTRUMENTO,
        descricao: "Método Schimoll até pág.38",
        obrigatorio: true,
        ordem: 1,
      },
      {
        tipo: TipoConteudoPM.TEORIA,
        descricao: "MSA até Fase 12",
        obrigatorio: true,
        ordem: 2,
      },
      {
        tipo: TipoConteudoPM.HINARIO,
        descricao: "Hinos 431 a 480",
        obrigatorio: true,
        ordem: 3,
      },
      {
        tipo: TipoConteudoPM.SOLFEJO,
        descricao: "431 a 480 Voz principal",
        obrigatorio: true,
        ordem: 4,
      },
    ],
  },
  {
    instrumento: "Violoncelo",
    nivel: NivelProgramaMinimo.CULTO,
    itens: [
      {
        tipo: TipoConteudoPM.METODO_INSTRUMENTO,
        descricao: "Método Schimoll até pág.78",
        obrigatorio: true,
        ordem: 1,
      },
      {
        tipo: TipoConteudoPM.TEORIA,
        descricao: "MSA até Fase 16",
        obrigatorio: true,
        ordem: 2,
      },
      {
        tipo: TipoConteudoPM.HINARIO,
        descricao: "Todos os Hinos",
        obrigatorio: true,
        ordem: 3,
      },
      {
        tipo: TipoConteudoPM.SOLFEJO,
        descricao: "Completo Voz principal + Voz alternativa",
        obrigatorio: true,
        ordem: 4,
      },
    ],
  },
  {
    instrumento: "Violoncelo",
    nivel: NivelProgramaMinimo.OFICIALIZACAO,
    itens: [
      {
        tipo: TipoConteudoPM.METODO_INSTRUMENTO,
        descricao: "Método Schimoll completo + CCB MÉTODO Preparatório",
        obrigatorio: true,
        ordem: 1,
      },
      {
        tipo: TipoConteudoPM.TEORIA,
        descricao: "MSA Completo com Revisão",
        obrigatorio: true,
        ordem: 2,
      },
      {
        tipo: TipoConteudoPM.HINARIO,
        descricao: "Todos os Hinos",
        obrigatorio: true,
        ordem: 3,
      },
      {
        tipo: TipoConteudoPM.SOLFEJO,
        descricao: "Completo Voz principal + Voz alternativa",
        obrigatorio: true,
        ordem: 4,
      },
    ],
  },
  // FLAUTA
  {
    instrumento: "Flauta",
    nivel: NivelProgramaMinimo.RJM,
    itens: [
      {
        tipo: TipoConteudoPM.METODO_INSTRUMENTO,
        descricao: "Método BONADE Vol.1 até lição 4",
        obrigatorio: true,
        ordem: 1,
      },
      {
        tipo: TipoConteudoPM.TEORIA,
        descricao: "MSA até Fase 12",
        obrigatorio: true,
        ordem: 2,
      },
      {
        tipo: TipoConteudoPM.HINARIO,
        descricao: "Hinos 431 a 480",
        obrigatorio: true,
        ordem: 3,
      },
      {
        tipo: TipoConteudoPM.SOLFEJO,
        descricao: "431 a 480 Voz principal",
        obrigatorio: true,
        ordem: 4,
      },
    ],
  },
  {
    instrumento: "Flauta",
    nivel: NivelProgramaMinimo.CULTO,
    itens: [
      {
        tipo: TipoConteudoPM.METODO_INSTRUMENTO,
        descricao: "Método BONADE Vol.1 até lição 8",
        obrigatorio: true,
        ordem: 1,
      },
      {
        tipo: TipoConteudoPM.TEORIA,
        descricao: "MSA até Fase 16",
        obrigatorio: true,
        ordem: 2,
      },
      {
        tipo: TipoConteudoPM.HINARIO,
        descricao: "Todos os Hinos",
        obrigatorio: true,
        ordem: 3,
      },
      {
        tipo: TipoConteudoPM.SOLFEJO,
        descricao: "Completo Voz principal + Voz alternativa",
        obrigatorio: true,
        ordem: 4,
      },
    ],
  },
  {
    instrumento: "Flauta",
    nivel: NivelProgramaMinimo.OFICIALIZACAO,
    itens: [
      {
        tipo: TipoConteudoPM.METODO_INSTRUMENTO,
        descricao: "Método BONADE Vol.1 e Vol.2 completo",
        obrigatorio: true,
        ordem: 1,
      },
      {
        tipo: TipoConteudoPM.TEORIA,
        descricao: "MSA Completo com Revisão",
        obrigatorio: true,
        ordem: 2,
      },
      {
        tipo: TipoConteudoPM.HINARIO,
        descricao: "Todos os Hinos",
        obrigatorio: true,
        ordem: 3,
      },
      {
        tipo: TipoConteudoPM.SOLFEJO,
        descricao: "Completo Voz principal + Voz alternativa",
        obrigatorio: true,
        ordem: 4,
      },
    ],
  },
  // CLARINETA
  {
    instrumento: "Clarineta",
    nivel: NivelProgramaMinimo.RJM,
    itens: [
      {
        tipo: TipoConteudoPM.METODO_INSTRUMENTO,
        descricao: "Método ENDRESEN Vol.1 até pág.30",
        obrigatorio: true,
        ordem: 1,
      },
      {
        tipo: TipoConteudoPM.TEORIA,
        descricao: "MSA até Fase 12",
        obrigatorio: true,
        ordem: 2,
      },
      {
        tipo: TipoConteudoPM.HINARIO,
        descricao: "Hinos 431 a 480",
        obrigatorio: true,
        ordem: 3,
      },
      {
        tipo: TipoConteudoPM.SOLFEJO,
        descricao: "431 a 480 Voz principal",
        obrigatorio: true,
        ordem: 4,
      },
    ],
  },
  {
    instrumento: "Clarineta",
    nivel: NivelProgramaMinimo.CULTO,
    itens: [
      {
        tipo: TipoConteudoPM.METODO_INSTRUMENTO,
        descricao: "Método ENDRESEN Vol.1 até pág.60",
        obrigatorio: true,
        ordem: 1,
      },
      {
        tipo: TipoConteudoPM.TEORIA,
        descricao: "MSA até Fase 16",
        obrigatorio: true,
        ordem: 2,
      },
      {
        tipo: TipoConteudoPM.HINARIO,
        descricao: "Todos os Hinos",
        obrigatorio: true,
        ordem: 3,
      },
      {
        tipo: TipoConteudoPM.SOLFEJO,
        descricao: "Completo Voz principal + Voz alternativa",
        obrigatorio: true,
        ordem: 4,
      },
    ],
  },
  {
    instrumento: "Clarineta",
    nivel: NivelProgramaMinimo.OFICIALIZACAO,
    itens: [
      {
        tipo: TipoConteudoPM.METODO_INSTRUMENTO,
        descricao: "Método ENDRESEN Vol.1 e Vol.2 completo",
        obrigatorio: true,
        ordem: 1,
      },
      {
        tipo: TipoConteudoPM.TEORIA,
        descricao: "MSA Completo com Revisão",
        obrigatorio: true,
        ordem: 2,
      },
      {
        tipo: TipoConteudoPM.HINARIO,
        descricao: "Todos os Hinos",
        obrigatorio: true,
        ordem: 3,
      },
      {
        tipo: TipoConteudoPM.SOLFEJO,
        descricao: "Completo Voz principal + Voz alternativa",
        obrigatorio: true,
        ordem: 4,
      },
    ],
  },
  // SAXOFONE
  {
    instrumento: "Saxofone",
    nivel: NivelProgramaMinimo.RJM,
    itens: [
      {
        tipo: TipoConteudoPM.METODO_INSTRUMENTO,
        descricao: "Método RUBANK Vol.1 até pág.24",
        obrigatorio: true,
        ordem: 1,
      },
      {
        tipo: TipoConteudoPM.TEORIA,
        descricao: "MSA até Fase 12",
        obrigatorio: true,
        ordem: 2,
      },
      {
        tipo: TipoConteudoPM.HINARIO,
        descricao: "Hinos 431 a 480",
        obrigatorio: true,
        ordem: 3,
      },
      {
        tipo: TipoConteudoPM.SOLFEJO,
        descricao: "431 a 480 Voz principal",
        obrigatorio: true,
        ordem: 4,
      },
    ],
  },
  {
    instrumento: "Saxofone",
    nivel: NivelProgramaMinimo.CULTO,
    itens: [
      {
        tipo: TipoConteudoPM.METODO_INSTRUMENTO,
        descricao: "Método RUBANK Vol.1 até pág.48",
        obrigatorio: true,
        ordem: 1,
      },
      {
        tipo: TipoConteudoPM.TEORIA,
        descricao: "MSA até Fase 16",
        obrigatorio: true,
        ordem: 2,
      },
      {
        tipo: TipoConteudoPM.HINARIO,
        descricao: "Todos os Hinos",
        obrigatorio: true,
        ordem: 3,
      },
      {
        tipo: TipoConteudoPM.SOLFEJO,
        descricao: "Completo Voz principal + Voz alternativa",
        obrigatorio: true,
        ordem: 4,
      },
    ],
  },
  {
    instrumento: "Saxofone",
    nivel: NivelProgramaMinimo.OFICIALIZACAO,
    itens: [
      {
        tipo: TipoConteudoPM.METODO_INSTRUMENTO,
        descricao: "Método RUBANK Vol.1 e Vol.2 completo",
        obrigatorio: true,
        ordem: 1,
      },
      {
        tipo: TipoConteudoPM.TEORIA,
        descricao: "MSA Completo com Revisão",
        obrigatorio: true,
        ordem: 2,
      },
      {
        tipo: TipoConteudoPM.HINARIO,
        descricao: "Todos os Hinos",
        obrigatorio: true,
        ordem: 3,
      },
      {
        tipo: TipoConteudoPM.SOLFEJO,
        descricao: "Completo Voz principal + Voz alternativa",
        obrigatorio: true,
        ordem: 4,
      },
    ],
  },
  // TROMPETE
  {
    instrumento: "Trompete",
    nivel: NivelProgramaMinimo.RJM,
    itens: [
      {
        tipo: TipoConteudoPM.METODO_INSTRUMENTO,
        descricao: "Método ARBANS até pág.20",
        obrigatorio: true,
        ordem: 1,
      },
      {
        tipo: TipoConteudoPM.TEORIA,
        descricao: "MSA até Fase 12",
        obrigatorio: true,
        ordem: 2,
      },
      {
        tipo: TipoConteudoPM.HINARIO,
        descricao: "Hinos 431 a 480",
        obrigatorio: true,
        ordem: 3,
      },
      {
        tipo: TipoConteudoPM.SOLFEJO,
        descricao: "431 a 480 Voz principal",
        obrigatorio: true,
        ordem: 4,
      },
    ],
  },
  {
    instrumento: "Trompete",
    nivel: NivelProgramaMinimo.CULTO,
    itens: [
      {
        tipo: TipoConteudoPM.METODO_INSTRUMENTO,
        descricao: "Método ARBANS até pág.40",
        obrigatorio: true,
        ordem: 1,
      },
      {
        tipo: TipoConteudoPM.TEORIA,
        descricao: "MSA até Fase 16",
        obrigatorio: true,
        ordem: 2,
      },
      {
        tipo: TipoConteudoPM.HINARIO,
        descricao: "Todos os Hinos",
        obrigatorio: true,
        ordem: 3,
      },
      {
        tipo: TipoConteudoPM.SOLFEJO,
        descricao: "Completo Voz principal + Voz alternativa",
        obrigatorio: true,
        ordem: 4,
      },
    ],
  },
  {
    instrumento: "Trompete",
    nivel: NivelProgramaMinimo.OFICIALIZACAO,
    itens: [
      {
        tipo: TipoConteudoPM.METODO_INSTRUMENTO,
        descricao: "Método ARBANS completo",
        obrigatorio: true,
        ordem: 1,
      },
      {
        tipo: TipoConteudoPM.TEORIA,
        descricao: "MSA Completo com Revisão",
        obrigatorio: true,
        ordem: 2,
      },
      {
        tipo: TipoConteudoPM.HINARIO,
        descricao: "Todos os Hinos",
        obrigatorio: true,
        ordem: 3,
      },
      {
        tipo: TipoConteudoPM.SOLFEJO,
        descricao: "Completo Voz principal + Voz alternativa",
        obrigatorio: true,
        ordem: 4,
      },
    ],
  },
  // TROMBONE
  {
    instrumento: "Trombone",
    nivel: NivelProgramaMinimo.RJM,
    itens: [
      {
        tipo: TipoConteudoPM.METODO_INSTRUMENTO,
        descricao: "Método RUBANK Vol.1 até pág.20",
        obrigatorio: true,
        ordem: 1,
      },
      {
        tipo: TipoConteudoPM.TEORIA,
        descricao: "MSA até Fase 12",
        obrigatorio: true,
        ordem: 2,
      },
      {
        tipo: TipoConteudoPM.HINARIO,
        descricao: "Hinos 431 a 480",
        obrigatorio: true,
        ordem: 3,
      },
      {
        tipo: TipoConteudoPM.SOLFEJO,
        descricao: "431 a 480 Voz principal",
        obrigatorio: true,
        ordem: 4,
      },
    ],
  },
  {
    instrumento: "Trombone",
    nivel: NivelProgramaMinimo.CULTO,
    itens: [
      {
        tipo: TipoConteudoPM.METODO_INSTRUMENTO,
        descricao: "Método RUBANK Vol.1 até pág.40",
        obrigatorio: true,
        ordem: 1,
      },
      {
        tipo: TipoConteudoPM.TEORIA,
        descricao: "MSA até Fase 16",
        obrigatorio: true,
        ordem: 2,
      },
      {
        tipo: TipoConteudoPM.HINARIO,
        descricao: "Todos os Hinos",
        obrigatorio: true,
        ordem: 3,
      },
      {
        tipo: TipoConteudoPM.SOLFEJO,
        descricao: "Completo Voz principal + Voz alternativa",
        obrigatorio: true,
        ordem: 4,
      },
    ],
  },
  {
    instrumento: "Trombone",
    nivel: NivelProgramaMinimo.OFICIALIZACAO,
    itens: [
      {
        tipo: TipoConteudoPM.METODO_INSTRUMENTO,
        descricao: "Método RUBANK Vol.1 e Vol.2 completo",
        obrigatorio: true,
        ordem: 1,
      },
      {
        tipo: TipoConteudoPM.TEORIA,
        descricao: "MSA Completo com Revisão",
        obrigatorio: true,
        ordem: 2,
      },
      {
        tipo: TipoConteudoPM.HINARIO,
        descricao: "Todos os Hinos",
        obrigatorio: true,
        ordem: 3,
      },
      {
        tipo: TipoConteudoPM.SOLFEJO,
        descricao: "Completo Voz principal + Voz alternativa",
        obrigatorio: true,
        ordem: 4,
      },
    ],
  },
  // TUBA
  {
    instrumento: "Tuba",
    nivel: NivelProgramaMinimo.RJM,
    itens: [
      {
        tipo: TipoConteudoPM.METODO_INSTRUMENTO,
        descricao: "Método RUBANK Vol.1 até pág.16",
        obrigatorio: true,
        ordem: 1,
      },
      {
        tipo: TipoConteudoPM.TEORIA,
        descricao: "MSA até Fase 12",
        obrigatorio: true,
        ordem: 2,
      },
      {
        tipo: TipoConteudoPM.HINARIO,
        descricao: "Hinos 431 a 480",
        obrigatorio: true,
        ordem: 3,
      },
      {
        tipo: TipoConteudoPM.SOLFEJO,
        descricao: "431 a 480 Voz principal",
        obrigatorio: true,
        ordem: 4,
      },
    ],
  },
  {
    instrumento: "Tuba",
    nivel: NivelProgramaMinimo.CULTO,
    itens: [
      {
        tipo: TipoConteudoPM.METODO_INSTRUMENTO,
        descricao: "Método RUBANK Vol.1 até pág.32",
        obrigatorio: true,
        ordem: 1,
      },
      {
        tipo: TipoConteudoPM.TEORIA,
        descricao: "MSA até Fase 16",
        obrigatorio: true,
        ordem: 2,
      },
      {
        tipo: TipoConteudoPM.HINARIO,
        descricao: "Todos os Hinos",
        obrigatorio: true,
        ordem: 3,
      },
      {
        tipo: TipoConteudoPM.SOLFEJO,
        descricao: "Completo Voz principal + Voz alternativa",
        obrigatorio: true,
        ordem: 4,
      },
    ],
  },
  {
    instrumento: "Tuba",
    nivel: NivelProgramaMinimo.OFICIALIZACAO,
    itens: [
      {
        tipo: TipoConteudoPM.METODO_INSTRUMENTO,
        descricao: "Método RUBANK Vol.1 e Vol.2 completo",
        obrigatorio: true,
        ordem: 1,
      },
      {
        tipo: TipoConteudoPM.TEORIA,
        descricao: "MSA Completo com Revisão",
        obrigatorio: true,
        ordem: 2,
      },
      {
        tipo: TipoConteudoPM.HINARIO,
        descricao: "Todos os Hinos",
        obrigatorio: true,
        ordem: 3,
      },
      {
        tipo: TipoConteudoPM.SOLFEJO,
        descricao: "Completo Voz principal + Voz alternativa",
        obrigatorio: true,
        ordem: 4,
      },
    ],
  },
  // EUFÔNIO
  {
    instrumento: "Eufônio",
    nivel: NivelProgramaMinimo.RJM,
    itens: [
      {
        tipo: TipoConteudoPM.METODO_INSTRUMENTO,
        descricao: "Método RUBANK Vol.1 até pág.20",
        obrigatorio: true,
        ordem: 1,
      },
      {
        tipo: TipoConteudoPM.TEORIA,
        descricao: "MSA até Fase 12",
        obrigatorio: true,
        ordem: 2,
      },
      {
        tipo: TipoConteudoPM.HINARIO,
        descricao: "Hinos 431 a 480",
        obrigatorio: true,
        ordem: 3,
      },
      {
        tipo: TipoConteudoPM.SOLFEJO,
        descricao: "431 a 480 Voz principal",
        obrigatorio: true,
        ordem: 4,
      },
    ],
  },
  {
    instrumento: "Eufônio",
    nivel: NivelProgramaMinimo.CULTO,
    itens: [
      {
        tipo: TipoConteudoPM.METODO_INSTRUMENTO,
        descricao: "Método RUBANK Vol.1 até pág.40",
        obrigatorio: true,
        ordem: 1,
      },
      {
        tipo: TipoConteudoPM.TEORIA,
        descricao: "MSA até Fase 16",
        obrigatorio: true,
        ordem: 2,
      },
      {
        tipo: TipoConteudoPM.HINARIO,
        descricao: "Todos os Hinos",
        obrigatorio: true,
        ordem: 3,
      },
      {
        tipo: TipoConteudoPM.SOLFEJO,
        descricao: "Completo Voz principal + Voz alternativa",
        obrigatorio: true,
        ordem: 4,
      },
    ],
  },
  {
    instrumento: "Eufônio",
    nivel: NivelProgramaMinimo.OFICIALIZACAO,
    itens: [
      {
        tipo: TipoConteudoPM.METODO_INSTRUMENTO,
        descricao: "Método RUBANK Vol.1 e Vol.2 completo",
        obrigatorio: true,
        ordem: 1,
      },
      {
        tipo: TipoConteudoPM.TEORIA,
        descricao: "MSA Completo com Revisão",
        obrigatorio: true,
        ordem: 2,
      },
      {
        tipo: TipoConteudoPM.HINARIO,
        descricao: "Todos os Hinos",
        obrigatorio: true,
        ordem: 3,
      },
      {
        tipo: TipoConteudoPM.SOLFEJO,
        descricao: "Completo Voz principal + Voz alternativa",
        obrigatorio: true,
        ordem: 4,
      },
    ],
  },
];

async function seedProgramaMinimo() {
  console.log("🌱 Iniciando seed do Programa Mínimo...");

  // Limpar dados existentes
  await prisma.programaMinimoItem.deleteMany();
  await prisma.programaMinimo.deleteMany();
  console.log("🗑️ Dados anteriores removidos");

  // Buscar instrumentos existentes
  const instrumentos = await prisma.instrumento.findMany();
  const instrumentoMap = new Map(instrumentos.map(i => [i.nome.toLowerCase(), i.id]));

  for (const programa of programaMinimoData) {
    const instrumentoId = instrumentoMap.get(programa.instrumento.toLowerCase());

    if (!instrumentoId) {
      console.warn(`⚠️ Instrumento não encontrado: ${programa.instrumento}`);
      continue;
    }

    // Criar ProgramaMinimo
    const programaMinimo = await prisma.programaMinimo.create({
      data: {
        instrumentoId,
        nivel: programa.nivel,
        itens: {
          create: programa.itens.map(item => ({
            tipo: item.tipo,
            descricao: item.descricao,
            alternativas: item.alternativas || null,
            obrigatorio: item.obrigatorio,
            ordem: item.ordem,
          })),
        },
      },
    });

    console.log(`✅ Programa Mínimo criado: ${programa.instrumento} - ${programa.nivel}`);
  }

  console.log("🎉 Seed do Programa Mínimo concluído!");
}

// Executar diretamente
seedProgramaMinimo()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

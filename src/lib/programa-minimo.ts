import { NivelProgramaMinimo, FaseOrquestra } from "@prisma/client";

/**
 * Mapeia FaseOrquestra para NivelProgramaMinimo
 * Usado para determinar quais requisitos do Programa Mínimo aplicam-se ao aluno
 */
export function faseOrquestraToNivel(
  faseOrquestra: FaseOrquestra
): NivelProgramaMinimo | null {
  switch (faseOrquestra) {
    case FaseOrquestra.ENSAIO:
      return null; // Preparatório - não tem programa mínimo definido

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

/**
 * Retorna o label legível para o nível do Programa Mínimo
 */
export function nivelProgramaMinimoLabel(
  nivel: NivelProgramaMinimo
): string {
  const labels: Record<NivelProgramaMinimo, string> = {
    RJM: "RJM - Reunião de Jovens e Menores",
    CULTO: "Culto - Cultos Regulares",
    OFICIALIZACAO: "Oficialização",
  };
  return labels[nivel];
}

/**
 * Retorna o label legível para o tipo de conteúdo do Programa Mínimo
 */
export function tipoConteudoPMLabel(tipo: string): string {
  const labels: Record<string, string> = {
    METODO_INSTRUMENTO: "Método do Instrumento",
    TEORIA: "Teoria Musical",
    SOLFEJO: "Solfejo",
    HINARIO: "Hinário",
  };
  return labels[tipo] || tipo;
}

/**
 * Retorna a cor associada ao nível do Programa Mínimo
 */
export function nivelProgramaMinimoColor(
  nivel: NivelProgramaMinimo
): string {
  const colors: Record<NivelProgramaMinimo, string> = {
    RJM: "bg-yellow-100 text-yellow-700",
    CULTO: "bg-blue-100 text-blue-700",
    OFICIALIZACAO: "bg-green-100 text-green-700",
  };
  return colors[nivel];
}

/**
 * Retorna a cor associada ao tipo de conteúdo
 */
export function tipoConteudoPMColor(tipo: string): string {
  const colors: Record<string, string> = {
    METODO_INSTRUMENTO: "bg-purple-100 text-purple-700",
    TEORIA: "bg-indigo-100 text-indigo-700",
    SOLFEJO: "bg-pink-100 text-pink-700",
    HINARIO: "bg-amber-100 text-amber-700",
  };
  return colors[tipo] || "bg-gray-100 text-gray-700";
}

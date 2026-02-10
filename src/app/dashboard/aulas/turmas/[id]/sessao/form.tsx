"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Save, BookOpen, ListChecks, Check } from "lucide-react";
import type { Aluno, Instrumento, Fase, ProgramaMinimo, ProgramaMinimoItem } from "@prisma/client";
import { tipoConteudoPMColor, tipoConteudoPMLabel } from "@/lib/programa-minimo";

interface SessaoFormProps {
    turmaId: string;
    alunos: (Aluno & {
        instrumento: Instrumento;
        fase: Fase;
    })[];
    programasMinimo: (ProgramaMinimo & {
        instrumento: Instrumento;
        itens: ProgramaMinimoItem[];
    })[];
}

interface RegistroAluno {
    alunoId: string;
    presenca: boolean;
    ausencia: boolean;
    justificativa?: "ENFERMIDADE" | "TRABALHO" | "VIAGEM" | "OUTROS";
    anotacoes: string;
    conteudoAtribuido: string;
    itensProgramaMinimo: string[]; // IDs dos itens selecionados
}

const justificativas = [
    { value: "ENFERMIDADE", label: "Enfermidade" },
    { value: "TRABALHO", label: "Trabalho" },
    { value: "VIAGEM", label: "Viagem" },
    { value: "OUTROS", label: "Outros" },
];

export function SessaoForm({ turmaId, alunos, programasMinimo }: SessaoFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [data, setData] = useState(new Date().toISOString().split("T")[0]);
    const [descricao, setDescricao] = useState("");
    const [registros, setRegistros] = useState<RegistroAluno[]>(
        alunos.map((aluno) => ({
            alunoId: aluno.id,
            presenca: false,
            ausencia: false,
            anotacoes: "",
            conteudoAtribuido: "",
            itensProgramaMinimo: [],
        }))
    );
    const [programaExpandido, setProgramaExpandido] = useState<string | null>(null);
    const [alunoSelecionado, setAlunoSelecionado] = useState<string | null>(null);

    const updateRegistro = (
        alunoId: string,
        field: keyof RegistroAluno,
        value: unknown
    ) => {
        setRegistros((prev) =>
            prev.map((r) => (r.alunoId === alunoId ? { ...r, [field]: value } : r))
        );
    };

    const togglePresenca = (alunoId: string, tipo: "presenca" | "ausencia") => {
        setRegistros((prev) =>
            prev.map((r) => {
                if (r.alunoId !== alunoId) return r;
                if (tipo === "presenca") {
                    return { ...r, presenca: !r.presenca, ausencia: false };
                } else {
                    return { ...r, ausencia: !r.ausencia, presenca: false };
                }
            })
        );
    };

    const toggleItemProgramaMinimo = (alunoId: string, itemId: string) => {
        setRegistros((prev) =>
            prev.map((r) => {
                if (r.alunoId !== alunoId) return r;
                const itens = r.itensProgramaMinimo.includes(itemId)
                    ? r.itensProgramaMinimo.filter((id) => id !== itemId)
                    : [...r.itensProgramaMinimo, itemId];
                return { ...r, itensProgramaMinimo: itens };
            })
        );
    };

    const VIRTUAL_ITEM_METODO_INICIAL = "virtual-metodo-inicial";

    const getItensSelecionadosTexto = (alunoId: string): string => {
        const registro = registros.find((r) => r.alunoId === alunoId);
        if (!registro || registro.itensProgramaMinimo.length === 0) return "";

        const itensSelecionados: string[] = [];

        // Verificar item virtual
        if (registro.itensProgramaMinimo.includes(VIRTUAL_ITEM_METODO_INICIAL)) {
            itensSelecionados.push("Método Pedagógico Inicial");
        }

        programasMinimo.forEach((prog) => {
            prog.itens.forEach((item) => {
                if (registro.itensProgramaMinimo.includes(item.id)) {
                    itensSelecionados.push(`${tipoConteudoPMLabel(item.tipo)}: ${item.descricao}`);
                }
            });
        });

        return itensSelecionados.join("; ");
    };

    const handleSubmit = async (sincronizar = false) => {
        setIsSubmitting(true);

        try {
            // Preparar registros com conteúdo do programa mínimo incluído
            const registrosComPrograma = registros.map((r) => ({
                alunoId: r.alunoId,
                presenca: r.presenca,
                ausencia: r.ausencia,
                justificativa: r.justificativa,
                anotacoes: r.anotacoes,
                conteudoAtribuido: r.conteudoAtribuido || getItensSelecionadosTexto(r.alunoId),
            }));

            // Criar sessão
            const response = await fetch(`/api/turmas/${turmaId}/sessoes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    data,
                    descricao,
                    registros: registrosComPrograma,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Erro ao criar sessão");
            }

            const sessao = await response.json();

            // Sincronizar com fichas se solicitado
            if (sincronizar) {
                const syncResponse = await fetch(
                    `/api/turmas/${turmaId}/sessoes/${sessao.id}/sincronizar`,
                    { method: "POST" }
                );

                if (!syncResponse.ok) {
                    const syncError = await syncResponse.json();
                    throw new Error(syncError.error || "Erro ao sincronizar com fichas");
                }

                const syncResult = await syncResponse.json();
                toast.success(`Sessão criada e sincronizada! ${syncResult.sucessos} fichas atualizadas.`);
            } else {
                toast.success("Sessão criada com sucesso!");
            }

            router.push(`/dashboard/aulas/turmas/${turmaId}`);
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Erro ao criar sessão");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Buscar programa mínimo do aluno
    const getProgramaMinimoAluno = (aluno: Aluno) => {
        return programasMinimo.find((p) => p.instrumentoId === aluno.instrumentoId);
    };

    return (
        <div className="space-y-6">
            {/* Data e Descrição */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Informações da Aula</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="data">Data *</Label>
                            <Input
                                id="data"
                                type="date"
                                value={data}
                                onChange={(e) => setData(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="descricao">Descrição/Tema</Label>
                            <Input
                                id="descricao"
                                placeholder="Ex: Aula de escalas maiores"
                                value={descricao}
                                onChange={(e) => setDescricao(e.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Tabela de Alunos */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center justify-between">
                                <span>Registro de Presença</span>
                                <span className="text-sm font-normal text-gray-500">
                                    {registros.filter((r) => r.presenca).length} presentes /{" "}
                                    {registros.filter((r) => r.ausencia).length} ausentes
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-2 px-2">Aluno</th>
                                            <th className="text-center py-2 px-2 w-16">P</th>
                                            <th className="text-center py-2 px-2 w-16">F</th>
                                            <th className="text-left py-2 px-2 w-28">Just.</th>
                                            <th className="text-left py-2 px-2 w-24">Prog. Mínimo</th>
                                            <th className="text-left py-2 px-2">Conteúdo/Obs.</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {alunos.map((aluno) => {
                                            const registro = registros.find(
                                                (r) => r.alunoId === aluno.id
                                            )!;
                                            const programaAluno = getProgramaMinimoAluno(aluno);
                                            const temItensSelecionados = registro.itensProgramaMinimo.length > 0;

                                            return (
                                                <tr key={aluno.id} className="hover:bg-gray-50">
                                                    <td className="py-3 px-2">
                                                        <div>
                                                            <p className="font-medium text-gray-900">
                                                                {aluno.nome}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {aluno.instrumento.nome}
                                                            </p>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-2 text-center">
                                                        <Checkbox
                                                            checked={registro.presenca}
                                                            onCheckedChange={() =>
                                                                togglePresenca(aluno.id, "presenca")
                                                            }
                                                        />
                                                    </td>
                                                    <td className="py-3 px-2 text-center">
                                                        <Checkbox
                                                            checked={registro.ausencia}
                                                            onCheckedChange={() =>
                                                                togglePresenca(aluno.id, "ausencia")
                                                            }
                                                        />
                                                    </td>
                                                    <td className="py-3 px-2">
                                                        {registro.ausencia && (
                                                            <Select
                                                                value={registro.justificativa}
                                                                onValueChange={(value) =>
                                                                    updateRegistro(
                                                                        aluno.id,
                                                                        "justificativa",
                                                                        value
                                                                    )
                                                                }
                                                            >
                                                                <SelectTrigger className="text-xs">
                                                                    <SelectValue placeholder="Justif." />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {justificativas.map((j) => (
                                                                        <SelectItem
                                                                            key={j.value}
                                                                            value={j.value}
                                                                        >
                                                                            {j.label}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-2">
                                                        {programaAluno ? (
                                                            <Dialog>
                                                                <DialogTrigger asChild>
                                                                    <Button
                                                                        type="button"
                                                                        variant={temItensSelecionados ? "default" : "outline"}
                                                                        size="sm"
                                                                        className="w-full text-xs"
                                                                        onClick={() => setAlunoSelecionado(aluno.id)}
                                                                    >
                                                                        {temItensSelecionados ? (
                                                                            <>
                                                                                <Check className="w-3 h-3 mr-1" />
                                                                                {registro.itensProgramaMinimo.length}
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <ListChecks className="w-3 h-3 mr-1" />
                                                                                Selecionar
                                                                            </>
                                                                        )}
                                                                    </Button>
                                                                </DialogTrigger>
                                                                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                                                    <DialogHeader>
                                                                        <DialogTitle>
                                                                            Programa Mínimo - {aluno.nome}
                                                                        </DialogTitle>
                                                                    </DialogHeader>
                                                                    <div className="space-y-4 mt-4">
                                                                        <p className="text-sm text-gray-500">
                                                                            Selecione os itens do programa mínimo trabalhados nesta aula:
                                                                        </p>
                                                                        <div className="border rounded-lg overflow-hidden">
                                                                            <div className="bg-indigo-50 px-4 py-3">
                                                                                <p className="font-medium text-indigo-900">
                                                                                    {programaAluno.instrumento.nome} - {programaAluno.nivel}
                                                                                </p>
                                                                            </div>
                                                                            <div className="p-4 space-y-3">
                                                                                {programaAluno.itens.map((item) => {
                                                                                    const selecionado = registro.itensProgramaMinimo.includes(item.id);
                                                                                    return (
                                                                                        <div
                                                                                            key={item.id}
                                                                                            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selecionado
                                                                                                ? "bg-indigo-50 border-indigo-200"
                                                                                                : "hover:bg-gray-50 border-gray-200"
                                                                                                }`}
                                                                                            onClick={() => toggleItemProgramaMinimo(aluno.id, item.id)}
                                                                                        >
                                                                                            <Checkbox
                                                                                                checked={selecionado}
                                                                                                onCheckedChange={() => { }}
                                                                                                className="mt-0.5"
                                                                                            />
                                                                                            <div className="flex-1">
                                                                                                <div className="flex items-center gap-2 mb-1">
                                                                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${tipoConteudoPMColor(item.tipo)}`}>
                                                                                                        {tipoConteudoPMLabel(item.tipo)}
                                                                                                    </span>
                                                                                                    {item.obrigatorio && (
                                                                                                        <span className="text-xs text-red-500">Obrigatório</span>
                                                                                                    )}
                                                                                                </div>
                                                                                                <p className="text-sm text-gray-900">
                                                                                                    {item.descricao}
                                                                                                </p>
                                                                                                {item.alternativas && (
                                                                                                    <p className="text-xs text-gray-500 mt-1">
                                                                                                        <span className="font-medium">Alternativas:</span> {item.alternativas}
                                                                                                    </p>
                                                                                                )}
                                                                                            </div>
                                                                                        </div>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex justify-end">
                                                                            <Button
                                                                                type="button"
                                                                                onClick={() => setAlunoSelecionado(null)}
                                                                            >
                                                                                Fechar
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                </DialogContent>
                                                            </Dialog>
                                                        ) : (
                                                            <span className="text-xs text-gray-400">-</span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-2">
                                                        <Input
                                                            size={1}
                                                            className="text-sm"
                                                            placeholder="Observações adicionais..."
                                                            value={registro.conteudoAtribuido}
                                                            onChange={(e) =>
                                                                updateRegistro(
                                                                    aluno.id,
                                                                    "conteudoAtribuido",
                                                                    e.target.value
                                                                )
                                                            }
                                                        />
                                                        {temItensSelecionados && (
                                                            <p className="text-xs text-indigo-600 mt-1 truncate">
                                                                {registro.itensProgramaMinimo.length} item(s) do programa selecionado(s)
                                                            </p>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Painel de Programa Mínimo - Referência */}
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <BookOpen className="w-5 h-5" />
                                Programa Mínimo
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-gray-500">
                                Referência dos requisitos por instrumento. Clique em &quot;Selecionar&quot; na tabela ao lado para marcar os itens trabalhados com cada aluno.
                            </p>
                            {programasMinimo.length === 0 ? (
                                <p className="text-sm text-gray-500">
                                    Nenhum programa mínimo cadastrado para os instrumentos desta turma.
                                </p>
                            ) : (
                                programasMinimo.map((programa) => (
                                    <div
                                        key={programa.id}
                                        className="border rounded-lg overflow-hidden"
                                    >
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setProgramaExpandido(
                                                    programaExpandido === programa.id
                                                        ? null
                                                        : programa.id
                                                )
                                            }
                                            className="w-full px-4 py-3 bg-indigo-50 flex items-center justify-between hover:bg-indigo-100 transition-colors"
                                        >
                                            <span className="font-medium text-indigo-900">
                                                {programa.instrumento.nome} - {programa.nivel}
                                            </span>
                                            <span className="text-xs text-indigo-600">
                                                {programaExpandido === programa.id
                                                    ? "▲"
                                                    : "▼"}
                                            </span>
                                        </button>
                                        {programaExpandido === programa.id && (
                                            <div className="p-4 space-y-2">
                                                {programa.itens.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        className="text-sm"
                                                    >
                                                        <span
                                                            className={`inline-block px-2 py-0.5 rounded text-xs mr-2 ${tipoConteudoPMColor(item.tipo)}`}
                                                        >
                                                            {tipoConteudoPMLabel(item.tipo)}
                                                        </span>
                                                        <span className="text-gray-700">
                                                            {item.descricao}
                                                        </span>
                                                        {item.alternativas && (
                                                            <p className="text-xs text-gray-500 mt-1 ml-16">
                                                                Alt: {item.alternativas}
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Botões */}
            <div className="flex flex-col sm:flex-row justify-end gap-3">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                >
                    Cancelar
                </Button>
                <Button
                    type="button"
                    variant="secondary"
                    onClick={() => handleSubmit(false)}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Salvando...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4 mr-2" />
                            Salvar Sessão
                        </>
                    )}
                </Button>
                <Button
                    type="button"
                    onClick={() => handleSubmit(true)}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Sincronizando...
                        </>
                    ) : (
                        "Salvar e Sincronizar com Fichas"
                    )}
                </Button>
            </div>
        </div>
    );
}

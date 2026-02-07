"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Save, Check, ChevronLeft, ChevronRight, BookOpen, GraduationCap, Music, FileText } from "lucide-react";

interface Aula {
    id: string;
    numeroAula: number;
    data: Date;
    anotacoes: string | null;
    presenca: boolean;
    ausencia: boolean;
    justificativa: string | null;
    vistoInstrutor: boolean;
    instrutor: { usuario: { nome: string } };
    topicoMsaId: string | null;
}

interface Avaliacao {
    id: string;
    numeroAvaliacao: number;
    data: Date;
    nota: number | null;
    anotacoes: string | null;
    presenca: boolean;
    ausencia: boolean;
    justificativa: string | null;
    vistoInstrutor: boolean;
    instrutor: { usuario: { nome: string } };
}

interface FichaFormProps {
    fichaId: string;
    aulas: Aula[];
    avaliacoes: Avaliacao[];
    mediaFinal: number | null;
    apto: boolean | null;
    encarregadoLocal: string | null;
    instrutorId: string;
    tipoAula: string;
    nivel: string | null;
    livro: string | null;
}

const AULAS_POR_PAGINA = 5;

const tipoAulaConfig = {
    SOLFEJO: { label: "Solfejo", icon: Music, color: "bg-purple-100 text-purple-700" },
    TEORIA_MUSICAL: { label: "Teoria Musical", icon: BookOpen, color: "bg-blue-100 text-blue-700" },
    PRATICA_INSTRUMENTO: { label: "Prática de Instrumento", icon: GraduationCap, color: "bg-green-100 text-green-700" },
    HINARIO: { label: "Hinário", icon: FileText, color: "bg-amber-100 text-amber-700" },
};

export function FichaForm({
    fichaId,
    aulas,
    avaliacoes,
    mediaFinal,
    apto,
    encarregadoLocal,
    instrutorId,
    tipoAula,
    nivel,
    livro,
}: FichaFormProps) {
    const [saving, setSaving] = useState(false);
    const [paginaAtual, setPaginaAtual] = useState(0);
    const [fasesMsa, setFasesMsa] = useState<{ id: string; nome: string; topicos: { id: string; numero: string; titulo: string }[] }[]>([]);
    const [aulasEditadas, setAulasEditadas] = useState<Record<number, Partial<Aula>>>({});
    const [avaliacoesEditadas, setAvaliacoesEditadas] = useState<Record<number, Partial<Avaliacao>>>({});

    useEffect(() => {
        fetch("/api/msa/fases")
            .then((res) => res.json())
            .then((data) => setFasesMsa(data))
            .catch((err) => console.error("Erro ao buscar fases MSA:", err));
    }, []);

    // Preencher array de 20 aulas
    const aulasCompletas = Array.from({ length: 20 }, (_, i) => {
        const aulaExistente = aulas.find((a) => a.numeroAula === i + 1);
        return (
            aulaExistente || {
                id: null as string | null,
                numeroAula: i + 1,
                data: null as Date | null,
                anotacoes: "",
                topicoMsaId: null as string | null,
                presenca: false,
                ausencia: false,
                justificativa: null as string | null,
                vistoInstrutor: false,
                instrutor: null as { usuario: { nome: string } } | null,
            }
        );
    });

    // Preencher array de 3 avaliações
    const avaliacoesCompletas = Array.from({ length: 3 }, (_, i) => {
        const avalExistente = avaliacoes.find((a) => a.numeroAvaliacao === i + 1);
        return (
            avalExistente || {
                id: null as string | null,
                numeroAvaliacao: i + 1,
                data: null as Date | null,
                nota: null as number | null,
                anotacoes: "",
                presenca: false,
                ausencia: false,
                justificativa: null as string | null,
                vistoInstrutor: false,
                instrutor: null as { usuario: { nome: string } } | null,
            }
        );
    });

    const totalPaginas = Math.ceil(aulasCompletas.length / AULAS_POR_PAGINA);
    const aulasPaginadas = aulasCompletas.slice(
        paginaAtual * AULAS_POR_PAGINA,
        (paginaAtual + 1) * AULAS_POR_PAGINA
    );

    const handleSaveAula = async (numeroAula: number, data: Partial<Aula> & { topicoMsaId?: string | null }) => {
        setSaving(true);
        try {
            await fetch(`/api/fichas/${fichaId}/aulas`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ numeroAula, ...data, instrutorId }),
            });
            // Atualizar estado local em vez de recarregar
            setAulasEditadas(prev => ({ ...prev, [numeroAula]: { ...prev[numeroAula], ...data } }));
        } catch (error) {
            console.error("Erro ao salvar aula:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleSaveAvaliacao = async (numeroAvaliacao: number, data: Partial<Avaliacao>) => {
        setSaving(true);
        try {
            await fetch(`/api/fichas/${fichaId}/avaliacoes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ numeroAvaliacao, ...data }),
            });
            setAvaliacoesEditadas(prev => ({ ...prev, [numeroAvaliacao]: { ...prev[numeroAvaliacao], ...data } }));
        } catch (error) {
            console.error("Erro ao salvar avaliação:", error);
        } finally {
            setSaving(false);
        }
    };

    const getAulaData = (aula: any, numeroAula: number) => {
        const editada = aulasEditadas[numeroAula];
        return { ...aula, ...editada };
    };

    const getAvaliacaoData = (aval: any, numeroAvaliacao: number) => {
        const editada = avaliacoesEditadas[numeroAvaliacao];
        return { ...aval, ...editada };
    };

    // Calcular média das avaliações
    const notasValidas = avaliacoesCompletas
        .map(a => getAvaliacaoData(a, a.numeroAvaliacao))
        .filter((a) => a.nota !== null)
        .map((a) => a.nota as number);
    const mediaCalculada =
        notasValidas.length > 0
            ? notasValidas.reduce((a, b) => a + b, 0) / notasValidas.length
            : null;

    const justificativaLabel: Record<string, string> = {
        ENFERMIDADE: "Enfermidade",
        TRABALHO: "Trabalho",
        VIAGEM: "Viagem",
        OUTROS: "Outros",
    };

    const justificativaShort: Record<string, string> = {
        ENFERMIDADE: "E",
        TRABALHO: "T",
        VIAGEM: "V",
        OUTROS: "O",
    };

    return (
        <div className="space-y-6">
            {/* Paginação Mobile - Superior */}
            <div className="lg:hidden">
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPaginaAtual(p => Math.max(0, p - 1))}
                                disabled={paginaAtual === 0}
                                className="h-10 w-10 p-0"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                            <div className="text-center">
                                <p className="text-sm text-gray-600">Aulas</p>
                                <p className="font-bold text-lg">
                                    {paginaAtual * AULAS_POR_PAGINA + 1} - {Math.min((paginaAtual + 1) * AULAS_POR_PAGINA, 20)}
                                    <span className="text-gray-400 font-normal text-sm"> / 20</span>
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPaginaAtual(p => Math.min(totalPaginas - 1, p + 1))}
                                disabled={paginaAtual >= totalPaginas - 1}
                                className="h-10 w-10 p-0"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </Button>
                        </div>
                        {/* Indicadores de página */}
                        <div className="flex justify-center gap-1 mt-3">
                            {Array.from({ length: totalPaginas }, (_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPaginaAtual(i)}
                                    className={`w-2 h-2 rounded-full transition-all ${
                                        i === paginaAtual ? "bg-blue-600 w-4" : "bg-blue-300"
                                    }`}
                                />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabela de Aulas - Desktop */}
            <Card className="hidden lg:block">
                <CardHeader>
                    <CardTitle className="text-lg">PROGRAMAÇÃO DE AULAS TEÓRICAS</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-gray-50">
                                    <th className="px-3 py-2 text-left font-medium w-16">Nº</th>
                                    <th className="px-3 py-2 text-left font-medium w-32">Data</th>
                                    <th className="px-3 py-2 text-left font-medium min-w-[200px]">Tópico MSA / Assunto</th>
                                    <th className="px-3 py-2 text-left font-medium">Anotações</th>
                                    <th className="px-3 py-2 text-center font-medium w-10">P.</th>
                                    <th className="px-3 py-2 text-center font-medium w-10">A.</th>
                                    <th className="px-3 py-2 text-center font-medium w-16">Just.</th>
                                    <th className="px-3 py-2 text-left font-medium w-24">Visto</th>
                                </tr>
                            </thead>
                            <tbody>
                                {aulasCompletas.map((aula) => {
                                    const aulaData = getAulaData(aula, aula.numeroAula);
                                    return (
                                        <tr key={aula.numeroAula} className="border-b hover:bg-gray-50">
                                            <td className="px-3 py-2 font-medium">
                                                {String(aula.numeroAula).padStart(2, "0")}
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                <input
                                                    type="date"
                                                    value={aulaData.data ? new Date(aulaData.data).toISOString().split("T")[0] : ""}
                                                    onChange={(e) => handleSaveAula(aula.numeroAula, { data: e.target.value ? new Date(e.target.value) : undefined })}
                                                    className="w-[130px] px-2 py-1 border rounded text-sm"
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                {(tipoAula === "TEORIA_MUSICAL" || tipoAula === "SOLFEJO") && (
                                                    <select
                                                        value={aulaData.topicoMsaId || ""}
                                                        onChange={(e) => handleSaveAula(aula.numeroAula, { topicoMsaId: e.target.value || null })}
                                                        className="w-full px-2 py-1 border rounded text-sm max-w-[250px]"
                                                    >
                                                        <option value="">Selecione...</option>
                                                        {fasesMsa.map((fase) => (
                                                            <optgroup key={fase.id} label={fase.nome}>
                                                                {fase.topicos.map((topico) => (
                                                                    <option key={topico.id} value={topico.id}>
                                                                        {topico.numero} - {topico.titulo}
                                                                    </option>
                                                                ))}
                                                            </optgroup>
                                                        ))}
                                                    </select>
                                                )}
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="text"
                                                    value={aulaData.anotacoes || ""}
                                                    onChange={(e) => handleSaveAula(aula.numeroAula, { anotacoes: e.target.value })}
                                                    placeholder="..."
                                                    className="w-full px-2 py-1 border rounded text-sm"
                                                />
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={aulaData.presenca}
                                                    onChange={(e) => handleSaveAula(aula.numeroAula, { presenca: e.target.checked })}
                                                    className="h-4 w-4"
                                                />
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={aulaData.ausencia}
                                                    onChange={(e) => handleSaveAula(aula.numeroAula, { ausencia: e.target.checked })}
                                                    className="h-4 w-4"
                                                />
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                <select
                                                    value={aulaData.justificativa || ""}
                                                    onChange={(e) => handleSaveAula(aula.numeroAula, { justificativa: e.target.value as any || null })}
                                                    className="w-16 px-1 py-1 border rounded text-sm"
                                                >
                                                    <option value="">-</option>
                                                    <option value="ENFERMIDADE">E</option>
                                                    <option value="TRABALHO">T</option>
                                                    <option value="VIAGEM">V</option>
                                                    <option value="OUTROS">O</option>
                                                </select>
                                            </td>
                                            <td className="px-3 py-2">
                                                {aulaData.vistoInstrutor ? (
                                                    <span className="text-green-600 flex items-center gap-1 text-xs">
                                                        <Check className="w-3 h-3" />
                                                        {aulaData.instrutor?.usuario?.nome?.split(" ")[0] || "Ok"}
                                                    </span>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-6 text-[10px] px-2"
                                                        onClick={() => handleSaveAula(aula.numeroAula, { vistoInstrutor: true })}
                                                    >
                                                        Assinar
                                                    </Button>
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

            {/* Cards de Aulas - Mobile */}
            <div className="lg:hidden space-y-3">
                {aulasPaginadas.map((aula) => {
                    const aulaData = getAulaData(aula, aula.numeroAula);
                    return (
                        <Card key={aula.numeroAula} className={`overflow-hidden ${aulaData.vistoInstrutor ? 'border-green-300' : ''}`}>
                            <div className={`px-4 py-3 flex items-center justify-between ${aulaData.vistoInstrutor ? 'bg-green-50' : 'bg-gray-50'}`}>
                                <div className="flex items-center gap-3">
                                    <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                        {String(aula.numeroAula).padStart(2, "0")}
                                    </span>
                                    <span className="font-medium text-gray-700">
                                        Aula {aula.numeroAula}
                                    </span>
                                </div>
                                {aulaData.vistoInstrutor && (
                                    <span className="text-green-600 flex items-center gap-1 text-xs font-medium">
                                        <Check className="w-4 h-4" />
                                        Assinada
                                    </span>
                                )}
                            </div>
                            <CardContent className="p-4 space-y-4">
                                {/* Data */}
                                <div>
                                    <Label className="text-xs text-gray-500 mb-1 block">Data</Label>
                                    <Input
                                        type="date"
                                        value={aulaData.data ? new Date(aulaData.data).toISOString().split("T")[0] : ""}
                                        onChange={(e) => handleSaveAula(aula.numeroAula, { data: e.target.value ? new Date(e.target.value) : undefined })}
                                        className="h-11"
                                    />
                                </div>

                                {/* Tópico MSA */}
                                {(tipoAula === "TEORIA_MUSICAL" || tipoAula === "SOLFEJO") && (
                                    <div>
                                        <Label className="text-xs text-gray-500 mb-1 block">Tópico MSA</Label>
                                        <select
                                            value={aulaData.topicoMsaId || ""}
                                            onChange={(e) => handleSaveAula(aula.numeroAula, { topicoMsaId: e.target.value || null })}
                                            className="w-full h-11 px-3 border rounded-md text-sm bg-white"
                                        >
                                            <option value="">Selecione o tópico...</option>
                                            {fasesMsa.map((fase) => (
                                                <optgroup key={fase.id} label={fase.nome}>
                                                    {fase.topicos.map((topico) => (
                                                        <option key={topico.id} value={topico.id}>
                                                            {topico.numero} - {topico.titulo}
                                                        </option>
                                                    ))}
                                                </optgroup>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* Anotações */}
                                <div>
                                    <Label className="text-xs text-gray-500 mb-1 block">Anotações</Label>
                                    <textarea
                                        value={aulaData.anotacoes || ""}
                                        onChange={(e) => handleSaveAula(aula.numeroAula, { anotacoes: e.target.value })}
                                        placeholder="Observações sobre a aula..."
                                        rows={2}
                                        className="w-full px-3 py-2 border rounded-md text-sm resize-none"
                                    />
                                </div>

                                {/* Presença/Ausência/Justificativa */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <Checkbox
                                            id={`presenca-${aula.numeroAula}`}
                                            checked={aulaData.presenca}
                                            onCheckedChange={(checked) => handleSaveAula(aula.numeroAula, { presenca: checked === true })}
                                        />
                                        <Label htmlFor={`presenca-${aula.numeroAula}`} className="text-sm font-medium cursor-pointer">
                                            Presente
                                        </Label>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <Checkbox
                                            id={`ausencia-${aula.numeroAula}`}
                                            checked={aulaData.ausencia}
                                            onCheckedChange={(checked) => handleSaveAula(aula.numeroAula, { ausencia: checked === true })}
                                        />
                                        <Label htmlFor={`ausencia-${aula.numeroAula}`} className="text-sm font-medium cursor-pointer">
                                            Ausente
                                        </Label>
                                    </div>
                                </div>

                                {/* Justificativa */}
                                {aulaData.ausencia && (
                                    <div>
                                        <Label className="text-xs text-gray-500 mb-1 block">Justificativa</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {Object.entries(justificativaLabel).map(([value, label]) => (
                                                <button
                                                    key={value}
                                                    onClick={() => handleSaveAula(aula.numeroAula, { justificativa: value })}
                                                    className={`p-2 text-sm rounded-lg border transition-all ${
                                                        aulaData.justificativa === value
                                                            ? 'bg-blue-100 border-blue-500 text-blue-700'
                                                            : 'bg-white border-gray-200 text-gray-700'
                                                    }`}
                                                >
                                                    <span className="font-bold">{justificativaShort[value]}</span> - {label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Botão Assinar */}
                                {!aulaData.vistoInstrutor && (
                                    <Button
                                        onClick={() => handleSaveAula(aula.numeroAula, { vistoInstrutor: true })}
                                        className="w-full h-12 text-base"
                                        variant={aulaData.presenca || aulaData.ausencia ? "default" : "outline"}
                                        disabled={!aulaData.presenca && !aulaData.ausencia}
                                    >
                                        <Check className="w-5 h-5 mr-2" />
                                        Assinar Aula
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Paginação Mobile - Inferior */}
            <div className="lg:hidden flex justify-center gap-2">
                {Array.from({ length: totalPaginas }, (_, i) => (
                    <Button
                        key={i}
                        variant={i === paginaAtual ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPaginaAtual(i)}
                        className="w-10 h-10"
                    >
                        {i + 1}
                    </Button>
                ))}
            </div>

            {/* Avaliações - Desktop (Tabela) */}
            <Card className="hidden lg:block">
                <CardHeader>
                    <CardTitle className="text-lg">AVALIAÇÕES</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-gray-50">
                                    <th className="px-3 py-2 text-left font-medium">Aval. Nº</th>
                                    <th className="px-3 py-2 text-left font-medium">Data</th>
                                    <th className="px-3 py-2 text-left font-medium">Nota</th>
                                    <th className="px-3 py-2 text-left font-medium">Anotações</th>
                                    <th className="px-3 py-2 text-center font-medium">Pres.</th>
                                    <th className="px-3 py-2 text-center font-medium">Aus.</th>
                                    <th className="px-3 py-2 text-center font-medium">Just.*</th>
                                    <th className="px-3 py-2 text-left font-medium">Visto Instrutor</th>
                                </tr>
                            </thead>
                            <tbody>
                                {avaliacoesCompletas.map((aval) => {
                                    const avalData = getAvaliacaoData(aval, aval.numeroAvaliacao);
                                    return (
                                        <tr key={aval.numeroAvaliacao} className="border-b hover:bg-gray-50">
                                            <td className="px-3 py-2 font-medium">
                                                {String(aval.numeroAvaliacao).padStart(2, "0")}
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="date"
                                                    value={avalData.data ? new Date(avalData.data).toISOString().split('T')[0] : ""}
                                                    onChange={(e) => handleSaveAvaliacao(aval.numeroAvaliacao, { data: new Date(e.target.value) as any })}
                                                    className="w-28 px-2 py-1 border rounded text-sm"
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="10"
                                                    step="0.5"
                                                    value={avalData.nota || ""}
                                                    onChange={(e) => handleSaveAvaliacao(aval.numeroAvaliacao, { nota: e.target.value ? parseFloat(e.target.value) : null })}
                                                    className="w-16 px-2 py-1 border rounded text-sm"
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="text"
                                                    value={avalData.anotacoes || ""}
                                                    placeholder="Anotações..."
                                                    onChange={(e) => handleSaveAvaliacao(aval.numeroAvaliacao, { anotacoes: e.target.value })}
                                                    className="w-full px-2 py-1 border rounded text-sm"
                                                />
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={avalData.presenca}
                                                    onChange={(e) => handleSaveAvaliacao(aval.numeroAvaliacao, { presenca: e.target.checked })}
                                                    className="h-4 w-4"
                                                />
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={avalData.ausencia}
                                                    onChange={(e) => handleSaveAvaliacao(aval.numeroAvaliacao, { ausencia: e.target.checked })}
                                                    className="h-4 w-4"
                                                />
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                <select
                                                    value={avalData.justificativa || ""}
                                                    onChange={(e) => handleSaveAvaliacao(aval.numeroAvaliacao, { justificativa: e.target.value as any || null })}
                                                    className="w-16 px-1 py-1 border rounded text-sm"
                                                >
                                                    <option value="">-</option>
                                                    <option value="ENFERMIDADE">E</option>
                                                    <option value="TRABALHO">T</option>
                                                    <option value="VIAGEM">V</option>
                                                    <option value="OUTROS">O</option>
                                                </select>
                                            </td>
                                            <td className="px-3 py-2">
                                                {avalData.vistoInstrutor ? (
                                                    <span className="text-green-600 flex items-center gap-1">
                                                        <Check className="w-4 h-4" />
                                                        {avalData.instrutor?.usuario?.nome?.split(" ")[0] || "Sim"}
                                                    </span>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-xs"
                                                        onClick={() => handleSaveAvaliacao(aval.numeroAvaliacao, { vistoInstrutor: true })}
                                                    >
                                                        Assinar
                                                    </Button>
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

            {/* Avaliações - Mobile (Cards) */}
            <div className="lg:hidden">
                <h3 className="text-lg font-semibold mb-3 px-1">Avaliações</h3>
                <div className="space-y-3">
                    {avaliacoesCompletas.map((aval) => {
                        const avalData = getAvaliacaoData(aval, aval.numeroAvaliacao);
                        return (
                            <Card key={aval.numeroAvaliacao} className={`overflow-hidden ${avalData.vistoInstrutor ? 'border-green-300' : ''}`}>
                                <div className={`px-4 py-3 flex items-center justify-between ${avalData.vistoInstrutor ? 'bg-green-50' : 'bg-amber-50'}`}>
                                    <div className="flex items-center gap-3">
                                        <span className="w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                            {String(aval.numeroAvaliacao).padStart(2, "0")}
                                        </span>
                                        <span className="font-medium text-gray-700">
                                            {aval.numeroAvaliacao}ª Avaliação
                                        </span>
                                    </div>
                                    {avalData.vistoInstrutor && (
                                        <span className="text-green-600 flex items-center gap-1 text-xs font-medium">
                                            <Check className="w-4 h-4" />
                                            Assinada
                                        </span>
                                    )}
                                </div>
                                <CardContent className="p-4 space-y-4">
                                    {/* Data */}
                                    <div>
                                        <Label className="text-xs text-gray-500 mb-1 block">Data</Label>
                                        <Input
                                            type="date"
                                            value={avalData.data ? new Date(avalData.data).toISOString().split('T')[0] : ""}
                                            onChange={(e) => handleSaveAvaliacao(aval.numeroAvaliacao, { data: new Date(e.target.value) as any })}
                                            className="h-11"
                                        />
                                    </div>

                                    {/* Nota */}
                                    <div>
                                        <Label className="text-xs text-gray-500 mb-1 block">Nota (0-10)</Label>
                                        <div className="flex items-center gap-3">
                                            <Input
                                                type="number"
                                                min="0"
                                                max="10"
                                                step="0.5"
                                                value={avalData.nota || ""}
                                                onChange={(e) => handleSaveAvaliacao(aval.numeroAvaliacao, { nota: e.target.value ? parseFloat(e.target.value) : null })}
                                                className="h-11 text-lg font-bold text-center w-24"
                                                placeholder="-"
                                            />
                                            {avalData.nota !== null && (
                                                <span className={`text-lg font-bold ${
                                                    avalData.nota >= 6 ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                    {avalData.nota >= 6 ? 'Aprovado' : 'Reprovado'}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Anotações */}
                                    <div>
                                        <Label className="text-xs text-gray-500 mb-1 block">Anotações</Label>
                                        <textarea
                                            value={avalData.anotacoes || ""}
                                            onChange={(e) => handleSaveAvaliacao(aval.numeroAvaliacao, { anotacoes: e.target.value })}
                                            placeholder="Observações..."
                                            rows={2}
                                            className="w-full px-3 py-2 border rounded-md text-sm resize-none"
                                        />
                                    </div>

                                    {/* Presença/Ausência */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <Checkbox
                                                id={`aval-presenca-${aval.numeroAvaliacao}`}
                                                checked={avalData.presenca}
                                                onCheckedChange={(checked) => handleSaveAvaliacao(aval.numeroAvaliacao, { presenca: checked === true })}
                                            />
                                            <Label htmlFor={`aval-presenca-${aval.numeroAvaliacao}`} className="text-sm font-medium cursor-pointer">
                                                Presente
                                            </Label>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <Checkbox
                                                id={`aval-ausencia-${aval.numeroAvaliacao}`}
                                                checked={avalData.ausencia}
                                                onCheckedChange={(checked) => handleSaveAvaliacao(aval.numeroAvaliacao, { ausencia: checked === true })}
                                            />
                                            <Label htmlFor={`aval-ausencia-${aval.numeroAvaliacao}`} className="text-sm font-medium cursor-pointer">
                                                Ausente
                                            </Label>
                                        </div>
                                    </div>

                                    {/* Justificativa */}
                                    {avalData.ausencia && (
                                        <div>
                                            <Label className="text-xs text-gray-500 mb-1 block">Justificativa</Label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {Object.entries(justificativaLabel).map(([value, label]) => (
                                                    <button
                                                        key={value}
                                                        onClick={() => handleSaveAvaliacao(aval.numeroAvaliacao, { justificativa: value })}
                                                        className={`p-2 text-sm rounded-lg border transition-all ${
                                                            avalData.justificativa === value
                                                                ? 'bg-amber-100 border-amber-500 text-amber-700'
                                                                : 'bg-white border-gray-200 text-gray-700'
                                                        }`}
                                                    >
                                                        <span className="font-bold">{justificativaShort[value]}</span> - {label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Botão Assinar */}
                                    {!avalData.vistoInstrutor && (
                                        <Button
                                            onClick={() => handleSaveAvaliacao(aval.numeroAvaliacao, { vistoInstrutor: true })}
                                            className="w-full h-12 text-base bg-amber-600 hover:bg-amber-700"
                                            disabled={avalData.nota === null}
                                        >
                                            <Check className="w-5 h-5 mr-2" />
                                            Assinar Avaliação
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* Resultado Final - Desktop e Mobile */}
            <Card className="bg-gradient-to-br from-gray-50 to-blue-50">
                <CardHeader>
                    <CardTitle className="text-lg">RESULTADO FINAL</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Métricas principais */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-xl shadow-sm">
                            <p className="text-sm text-gray-500 mb-1">MÉDIA FINAL</p>
                            <p className="text-3xl font-bold text-blue-600">
                                {mediaCalculada !== null ? mediaCalculada.toFixed(1) : "-"}
                            </p>
                            {mediaCalculada !== null && (
                                <p className={`text-sm font-medium mt-1 ${mediaCalculada >= 6 ? 'text-green-600' : 'text-red-600'}`}>
                                    {mediaCalculada >= 6 ? 'Aprovado' : 'Reprovado'}
                                </p>
                            )}
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm">
                            <p className="text-sm text-gray-500 mb-1">APTO</p>
                            <div className="flex gap-4 mt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="apto"
                                        value="true"
                                        defaultChecked={apto === true}
                                        className="h-5 w-5 text-blue-600"
                                    />
                                    <span className="font-medium text-lg">SIM</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="apto"
                                        value="false"
                                        defaultChecked={apto === false}
                                        className="h-5 w-5 text-blue-600"
                                    />
                                    <span className="font-medium text-lg">NÃO</span>
                                </label>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm">
                            <p className="text-sm text-gray-500 mb-1">AULAS ASSINADAS</p>
                            <p className="text-3xl font-bold text-green-600">
                                {aulasCompletas.filter(a => getAulaData(a, a.numeroAula).vistoInstrutor).length}/20
                            </p>
                        </div>
                    </div>

                    {/* Observações e Data */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label className="text-sm text-gray-500 mb-2 block">Observações Finais</Label>
                            <textarea
                                placeholder="Observações sobre o desempenho do aluno..."
                                rows={3}
                                className="w-full px-3 py-2 border rounded-lg text-sm resize-none"
                            />
                        </div>
                        <div className="space-y-4">
                            <div>
                                <Label className="text-sm text-gray-500 mb-2 block">Data de Finalização</Label>
                                <Input type="date" className="h-11" />
                            </div>
                            <div>
                                <Label className="text-sm text-gray-500 mb-2 block">Encarregado Local</Label>
                                <Input
                                    type="text"
                                    defaultValue={encarregadoLocal || ""}
                                    placeholder="Nome do encarregado"
                                    className="h-11"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Legenda */}
                    <div className="pt-4 border-t text-xs text-gray-500">
                        <p className="font-medium mb-1">Legenda das justificativas:</p>
                        <div className="flex flex-wrap gap-3">
                            <span><strong>E</strong> - Enfermidade</span>
                            <span><strong>T</strong> - Trabalho</span>
                            <span><strong>V</strong> - Viagem</span>
                            <span><strong>O</strong> - Outros</span>
                        </div>
                    </div>

                    {/* Botão Salvar */}
                    <Button className="w-full h-12 text-base" disabled={saving}>
                        <Save className="w-5 h-5 mr-2" />
                        {saving ? "Salvando..." : "Salvar Ficha Completa"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

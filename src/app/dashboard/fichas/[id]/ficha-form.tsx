"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, Check } from "lucide-react";

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
    const [selectedAula, setSelectedAula] = useState<number | null>(null);
    const [fasesMsa, setFasesMsa] = useState<{ id: string; nome: string; topicos: { id: string; numero: string; titulo: string }[] }[]>([]);

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

    const handleSaveAula = async (numeroAula: number, data: Partial<Aula> & { topicoMsaId?: string | null }) => {
        setSaving(true);
        try {
            await fetch(`/api/fichas/${fichaId}/aulas`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ numeroAula, ...data, instrutorId }),
            });
            window.location.reload();
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
            window.location.reload();
        } catch (error) {
            console.error("Erro ao salvar avaliação:", error);
        } finally {
            setSaving(false);
        }
    };

    // Calcular média das avaliações
    const notasValidas = avaliacoesCompletas
        .filter((a) => a.nota !== null)
        .map((a) => a.nota as number);
    const mediaCalculada =
        notasValidas.length > 0
            ? notasValidas.reduce((a, b) => a + b, 0) / notasValidas.length
            : null;

    return (
        <div className="space-y-6">
            {/* Tabela de Aulas Teóricas */}
            <Card>
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
                                {aulasCompletas.map((aula, index) => (
                                    <tr
                                        key={index}
                                        onClick={() => setSelectedAula(index)}
                                    >
                                        <td className="px-3 py-2 font-medium">
                                            {String(aula.numeroAula).padStart(2, "0")}
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <input
                                                type="date"
                                                defaultValue={aula.data ? new Date(aula.data).toISOString().split("T")[0] : ""}
                                                onChange={(e) => handleSaveAula(aula.numeroAula, { data: e.target.value ? new Date(e.target.value) : undefined })}
                                                className="w-[130px] px-2 py-1 border rounded text-sm"
                                            />
                                        </td>
                                        <td className="px-3 py-2">
                                            {(tipoAula === "TEORIA_MUSICAL" || tipoAula === "SOLFEJO") && (
                                                <div className="space-y-2">
                                                    <select
                                                        value={aula.topicoMsaId || ""}
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
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-3 py-2">
                                            <input
                                                type="text"
                                                defaultValue={aula.anotacoes || ""}
                                                onBlur={(e) => handleSaveAula(aula.numeroAula, { anotacoes: e.target.value })}
                                                placeholder="..."
                                                className="w-full px-2 py-1 border rounded text-sm"
                                            />
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <input
                                                type="checkbox"
                                                defaultChecked={aula.presenca}
                                                onChange={(e) => handleSaveAula(aula.numeroAula, { presenca: e.target.checked })}
                                                className="h-4 w-4"
                                            />
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <input
                                                type="checkbox"
                                                defaultChecked={aula.ausencia}
                                                onChange={(e) => handleSaveAula(aula.numeroAula, { ausencia: e.target.checked })}
                                                className="h-4 w-4"
                                            />
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <select
                                                defaultValue={aula.justificativa || ""}
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
                                            {aula.vistoInstrutor ? (
                                                <span className="text-green-600 flex items-center gap-1 text-xs">
                                                    <Check className="w-3 h-3" />
                                                    {aula.instrutor?.usuario?.nome?.split(" ")[0] || "Ok"}
                                                </span>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-6 text-[10px] px-2"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSaveAula(aula.numeroAula, { vistoInstrutor: true });
                                                    }}
                                                >
                                                    Assinar
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Tabela de Avaliações */}
            <Card>
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
                                {avaliacoesCompletas.map((aval, index) => (
                                    <tr key={index} className="border-b hover:bg-gray-50">
                                        <td className="px-3 py-2 font-medium">
                                            {String(aval.numeroAvaliacao).padStart(2, "0")}
                                        </td>
                                        <td className="px-3 py-2">
                                            <input
                                                type="date"
                                                defaultValue={aval.data ? new Date(aval.data).toISOString().split('T')[0] : ""}
                                                onBlur={(e) => handleSaveAvaliacao(aval.numeroAvaliacao, { data: new Date(e.target.value) as any })}
                                                className="w-28 px-2 py-1 border rounded text-sm"
                                            />
                                        </td>
                                        <td className="px-3 py-2">
                                            <input
                                                type="number"
                                                min="0"
                                                max="10"
                                                step="0.5"
                                                defaultValue={aval.nota || ""}
                                                onBlur={(e) => handleSaveAvaliacao(aval.numeroAvaliacao, { nota: e.target.value ? parseFloat(e.target.value) : null })}
                                                className="w-16 px-2 py-1 border rounded text-sm"
                                            />
                                        </td>
                                        <td className="px-3 py-2">
                                            <input
                                                type="text"
                                                defaultValue={aval.anotacoes || ""}
                                                placeholder="Anotações..."
                                                onBlur={(e) => handleSaveAvaliacao(aval.numeroAvaliacao, { anotacoes: e.target.value })}
                                                className="w-full px-2 py-1 border rounded text-sm"
                                            />
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <input
                                                type="checkbox"
                                                defaultChecked={aval.presenca}
                                                onChange={(e) => handleSaveAvaliacao(aval.numeroAvaliacao, { presenca: e.target.checked })}
                                                className="h-4 w-4"
                                            />
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <input
                                                type="checkbox"
                                                defaultChecked={aval.ausencia}
                                                onChange={(e) => handleSaveAvaliacao(aval.numeroAvaliacao, { ausencia: e.target.checked })}
                                                className="h-4 w-4"
                                            />
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <select
                                                defaultValue={aval.justificativa || ""}
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
                                            {aval.vistoInstrutor ? (
                                                <span className="text-green-600 flex items-center gap-1">
                                                    <Check className="w-4 h-4" />
                                                    {aval.instrutor?.usuario?.nome?.split(" ")[0] || "Sim"}
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
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Resultado Final */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 w-full md:w-auto">
                            <div>
                                <p className="text-sm text-gray-500">MÉDIA</p>
                                <p className="text-2xl font-bold">
                                    {mediaCalculada !== null ? mediaCalculada.toFixed(1) : "-"}
                                </p>
                            </div>
                            <div className="w-full md:w-auto">
                                <p className="text-sm text-gray-500">Resultado Final</p>
                                <input
                                    type="text"
                                    placeholder="Observações..."
                                    className="mt-1 px-3 py-2 border rounded-lg w-full md:w-auto"
                                />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">APTO:</p>
                                <div className="flex gap-4 mt-1">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="apto"
                                            value="true"
                                            defaultChecked={apto === true}
                                            className="h-4 w-4"
                                        />
                                        <span className="font-medium">SIM</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="apto"
                                            value="false"
                                            defaultChecked={apto === false}
                                            className="h-4 w-4"
                                        />
                                        <span className="font-medium">NÃO</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <Button className="ml-auto">
                            <Save className="w-4 h-4 mr-2" />
                            Salvar Ficha
                        </Button>
                    </div>

                    <div className="mt-6 pt-4 border-t text-sm text-gray-500">
                        <p>* Justificativas: E - Enfermidade | T - Trabalho | V - Viagem | O - Outros</p>
                    </div>

                    <div className="mt-6 pt-4 border-t">
                        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
                            <div className="flex-1">
                                <p className="text-sm text-gray-500">Data de Finalização</p>
                                <input
                                    type="date"
                                    className="mt-1 px-3 py-2 border rounded-lg w-full"
                                />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-500">Encarregado Local</p>
                                <input
                                    type="text"
                                    defaultValue={encarregadoLocal || ""}
                                    placeholder="Nome do encarregado"
                                    className="mt-1 w-full px-3 py-2 border rounded-lg"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

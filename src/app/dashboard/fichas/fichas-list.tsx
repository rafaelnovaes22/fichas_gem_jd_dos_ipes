"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
    Search,
    FileText,
    ChevronDown,
    BookOpen,
    Music,
    GraduationCap,
} from "lucide-react";

const tipoAulaConfig = {
    SOLFEJO: {
        label: "Solfejo",
        icon: Music,
        color: "bg-purple-100 text-purple-700",
        border: "border-purple-200",
    },
    TEORIA_MUSICAL: {
        label: "Teoria Musical",
        icon: BookOpen,
        color: "bg-blue-100 text-blue-700",
        border: "border-blue-200",
    },
    PRATICA_INSTRUMENTO: {
        label: "Prática de Instrumento",
        icon: GraduationCap,
        color: "bg-green-100 text-green-700",
        border: "border-green-200",
    },
    HINARIO: {
        label: "Hinário",
        icon: FileText,
        color: "bg-amber-100 text-amber-700",
        border: "border-amber-200",
    },
} as const;

type TipoAula = keyof typeof tipoAulaConfig;

interface FichaData {
    id: string;
    tipoAula: string;
    apto: boolean | null;
    _count: {
        aulas: number;
        avaliacoes: number;
    };
}

interface AlunoGroup {
    alunoId: string;
    nome: string;
    instrumento: string;
    fase: string;
    congregacao: string;
    fichas: FichaData[];
}

interface FichasListProps {
    alunosAgrupados: AlunoGroup[];
}

export function FichasList({ alunosAgrupados }: FichasListProps) {
    const [search, setSearch] = useState("");
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const filtered = search.trim()
        ? alunosAgrupados.filter((a) =>
              a.nome.toLowerCase().includes(search.toLowerCase())
          )
        : alunosAgrupados;

    const toggleExpand = (alunoId: string) => {
        setExpandedId((prev) => (prev === alunoId ? null : alunoId));
    };

    const getStatusResumo = (fichas: FichaData[]) => {
        const aptos = fichas.filter((f) => f.apto === true).length;
        const naoAptos = fichas.filter((f) => f.apto === false).length;
        if (aptos === fichas.length && fichas.length > 0) return "apto";
        if (naoAptos > 0) return "nao-apto";
        return "andamento";
    };

    return (
        <>
            {/* Search */}
            <Card>
                <CardContent className="pt-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nome do aluno..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* List */}
            {filtered.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">
                            {search.trim()
                                ? "Nenhum aluno encontrado."
                                : "Nenhuma ficha encontrada."}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-3 md:gap-4">
                    {filtered.map((aluno) => {
                        const isExpanded = expandedId === aluno.alunoId;
                        const statusResumo = getStatusResumo(aluno.fichas);
                        const initials = aluno.nome
                            .split(" ")
                            .filter(Boolean)
                            .slice(0, 2)
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase();

                        return (
                            <Card
                                key={aluno.alunoId}
                                className={`transition-shadow ${isExpanded ? "shadow-md" : ""}`}
                            >
                                {/* Aluno header - clickable */}
                                <button
                                    type="button"
                                    onClick={() => toggleExpand(aluno.alunoId)}
                                    className="w-full text-left"
                                >
                                    <CardContent className="p-3 md:p-4">
                                        <div className="flex items-center gap-3 md:gap-4">
                                            {/* Avatar */}
                                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                <span className="text-sm md:text-base font-semibold text-blue-700">
                                                    {initials}
                                                </span>
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-gray-900 text-sm md:text-base truncate">
                                                    {aluno.nome}
                                                </h3>
                                                <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-xs md:text-sm text-gray-500">
                                                    <span className="truncate max-w-[120px] md:max-w-none">
                                                        {aluno.instrumento}
                                                    </span>
                                                    <span className="hidden md:inline">
                                                        •
                                                    </span>
                                                    <span className="truncate max-w-[100px] md:max-w-none hidden sm:inline">
                                                        {aluno.fase}
                                                    </span>
                                                    <span className="hidden md:inline">
                                                        •
                                                    </span>
                                                    <span className="truncate max-w-[100px] md:max-w-none hidden md:inline">
                                                        {aluno.congregacao}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-400 sm:hidden truncate">
                                                    {aluno.fase}
                                                </p>
                                            </div>

                                            {/* Badge + Chevron */}
                                            <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                                                <span className="px-2 py-0.5 md:px-2.5 md:py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                                                    {aluno.fichas.length} de 4
                                                </span>

                                                {statusResumo === "apto" && (
                                                    <span className="hidden sm:inline px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">
                                                        APTO
                                                    </span>
                                                )}
                                                {statusResumo === "nao-apto" && (
                                                    <span className="hidden sm:inline px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700">
                                                        NÃO APTO
                                                    </span>
                                                )}
                                                {statusResumo === "andamento" && (
                                                    <span className="hidden sm:inline px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
                                                        Em andamento
                                                    </span>
                                                )}

                                                <ChevronDown
                                                    className={`w-4 h-4 md:w-5 md:h-5 text-gray-400 transition-transform duration-200 ${
                                                        isExpanded
                                                            ? "rotate-180"
                                                            : ""
                                                    }`}
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </button>

                                {/* Expanded sub-fichas */}
                                {isExpanded && (
                                    <div className="border-t bg-gray-50/50 p-3 md:p-4">
                                        <div className="grid gap-2 md:gap-3 sm:grid-cols-2">
                                            {aluno.fichas.map((ficha) => {
                                                const config =
                                                    tipoAulaConfig[
                                                        ficha.tipoAula as TipoAula
                                                    ];
                                                if (!config) return null;
                                                const Icon = config.icon;

                                                return (
                                                    <Link
                                                        key={ficha.id}
                                                        href={`/dashboard/fichas/${ficha.id}`}
                                                    >
                                                        <div
                                                            className={`flex items-center gap-3 p-3 rounded-lg border bg-white hover:shadow-sm transition-shadow cursor-pointer ${config.border}`}
                                                        >
                                                            <div
                                                                className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${config.color}`}
                                                            >
                                                                <Icon className="w-4 h-4" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                                    {
                                                                        config.label
                                                                    }
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    {
                                                                        ficha
                                                                            ._count
                                                                            .aulas
                                                                    }
                                                                    /20 aulas
                                                                    &nbsp;•&nbsp;
                                                                    {
                                                                        ficha
                                                                            ._count
                                                                            .avaliacoes
                                                                    }
                                                                    /3 aval.
                                                                </p>
                                                            </div>
                                                            <div>
                                                                {ficha.apto !==
                                                                null ? (
                                                                    <span
                                                                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                                                            ficha.apto
                                                                                ? "bg-green-100 text-green-700"
                                                                                : "bg-red-100 text-red-700"
                                                                        }`}
                                                                    >
                                                                        {ficha.apto
                                                                            ? "APTO"
                                                                            : "N/APTO"}
                                                                    </span>
                                                                ) : (
                                                                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
                                                                        Em andamento
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </Card>
                        );
                    })}
                </div>
            )}
        </>
    );
}

import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BookOpen, Music, GraduationCap } from "lucide-react";
import {
    nivelProgramaMinimoLabel,
    tipoConteudoPMLabel,
    tipoConteudoPMColor,
    nivelProgramaMinimoColor,
} from "@/lib/programa-minimo";

export default async function ProgramaMinimoPage() {
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === "ADMIN";

    // Buscar todos os programas mínimos com instrumentos e itens
    const programasMinimo = await prisma.programaMinimo.findMany({
        include: {
            instrumento: true,
            itens: {
                orderBy: { ordem: "asc" },
            },
        },
        orderBy: [
            { instrumento: { nome: "asc" } },
            { nivel: "asc" },
        ],
    });

    // Agrupar por instrumento
    const programasPorInstrumento = programasMinimo.reduce((acc, programa) => {
        const instId = programa.instrumento.id;
        if (!acc[instId]) {
            acc[instId] = {
                instrumento: programa.instrumento,
                programas: [],
            };
        }
        acc[instId].programas.push(programa);
        return acc;
    }, {} as Record<string, { instrumento: typeof programasMinimo[0]["instrumento"]; programas: typeof programasMinimo }>);

    // Separar por categoria
    const instrumentosPorCategoria: Record<string, typeof programasPorInstrumento[keyof typeof programasPorInstrumento][]> = {};

    Object.values(programasPorInstrumento).forEach((item) => {
        const categoria = item.instrumento.categoria;
        if (!instrumentosPorCategoria[categoria]) {
            instrumentosPorCategoria[categoria] = [];
        }
        instrumentosPorCategoria[categoria].push(item);
    });

    // Ordem das categorias
    const ordemCategorias = ["Cordas", "Madeiras", "Saxofones", "Metais", "Teclas", "Outros"];
    const categoriasOrdenadas = ordemCategorias.filter(
        cat => instrumentosPorCategoria[cat]?.length > 0
    );

    // Adicionar categorias não listadas no final
    Object.keys(instrumentosPorCategoria).forEach(cat => {
        if (!categoriasOrdenadas.includes(cat)) {
            categoriasOrdenadas.push(cat);
        }
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard/aulas">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Programa Mínimo para Músicos – 2023
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Congregação Cristã no Brasil
                    </p>
                </div>
            </div>

            {/* Info Card */}
            <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-100 dark:from-indigo-950/50 dark:to-blue-950/50 dark:border-indigo-900/50">
                <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0">
                            <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                Sobre o Programa Mínimo
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                O Programa Mínimo estabelece os requisitos que cada músico deve
                                atender para participar nos diferentes níveis da orquestra:
                            </p>
                            <div className="flex flex-wrap gap-2 mt-2">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
                                    RJM - Reunião de Jovens e Menores
                                </span>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                                    Culto - Cultos Regulares
                                </span>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                                    Oficialização
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Lista de Instrumentos por Categoria */}
            {Object.values(programasPorInstrumento).length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Music className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">
                            Nenhum programa mínimo cadastrado.
                        </p>
                        {isAdmin && (
                            <p className="text-sm text-gray-400 mt-2">
                                Execute o seed para popular os dados:{" "}
                                <code className="bg-gray-100 px-1 rounded">npx tsx prisma/seed-programa-minimo.ts</code>
                            </p>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-8">
                    {categoriasOrdenadas.map((categoria) => (
                        <div key={categoria} className="space-y-4">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b dark:border-zinc-800 pb-2">
                                {categoria}
                            </h2>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {instrumentosPorCategoria[categoria].map(({ instrumento, programas }) => (
                                    <Card key={instrumento.id} className="overflow-hidden dark:border-zinc-800">
                                        <CardHeader className="bg-gray-50 dark:bg-zinc-900 border-b dark:border-zinc-800 py-3">
                                            <CardTitle className="text-base flex items-center gap-2 text-gray-900 dark:text-gray-100">
                                                <Music className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                                {instrumento.nome}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-0">
                                            <div className="divide-y dark:divide-zinc-800">
                                                {programas.map((programa) => (
                                                    <div key={programa.id} className="p-3">
                                                        {/* Cabeçalho do Nível */}
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <GraduationCap className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                                            <span
                                                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${nivelProgramaMinimoColor(
                                                                    programa.nivel
                                                                )}`}
                                                            >
                                                                {nivelProgramaMinimoLabel(programa.nivel)}
                                                            </span>
                                                        </div>

                                                        {/* Lista de Itens */}
                                                        <div className="space-y-2 ml-6">
                                                            {programa.itens.map((item) => (
                                                                <div
                                                                    key={item.id}
                                                                    className="flex items-start gap-2 text-sm"
                                                                >
                                                                    <span
                                                                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium shrink-0 ${tipoConteudoPMColor(
                                                                            item.tipo
                                                                        )}`}
                                                                    >
                                                                        {tipoConteudoPMLabel(item.tipo)}
                                                                    </span>
                                                                    <div className="flex-1">
                                                                        <p className="text-gray-900 dark:text-gray-200">
                                                                            {item.descricao}
                                                                        </p>
                                                                        {item.alternativas && (
                                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                                                <span className="font-medium">Alternativas:</span>{" "}
                                                                                {item.alternativas}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

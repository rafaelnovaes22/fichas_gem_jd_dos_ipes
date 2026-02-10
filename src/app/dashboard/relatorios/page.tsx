import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions, isAdmin as checkIsAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Users,
    FileText,
    TrendingUp,
    Download,
    ChevronRight,
    GraduationCap,
    Music,
    Award,
    Calendar
} from "lucide-react";

export default async function RelatoriosPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    const isAdmin = checkIsAdmin(session.user.role);

    // Estatísticas gerais
    const totalAlunos = await prisma.aluno.count({ where: { ativo: true } });
    const totalFichas = await prisma.fichaAcompanhamento.count();
    const fichasConcluidas = await prisma.fichaAcompanhamento.count({
        where: { apto: { not: null } }
    });
    const alunosAptos = await prisma.fichaAcompanhamento.count({
        where: { apto: true }
    });

    // Estatísticas por instrumento
    const estatisticasPorInstrumento = await prisma.instrumento.findMany({
        where: { ativo: true },
        include: {
            _count: {
                select: { alunos: { where: { ativo: true } } }
            }
        },
        orderBy: { nome: "asc" }
    });

    // Estatísticas por fase
    const estatisticasPorFase = await prisma.fase.findMany({
        include: {
            _count: {
                select: { alunos: { where: { ativo: true } } }
            }
        },
        orderBy: { ordem: "asc" }
    });

    // Últimas fichas concluídas
    const ultimasFichasConcluidas = await prisma.fichaAcompanhamento.findMany({
        where: { apto: { not: null } },
        include: {
            aluno: {
                include: {
                    instrumento: true,
                }
            }
        },
        orderBy: { updatedAt: "desc" },
        take: 5
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Relatórios</h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Visualize estatísticas e relatórios do sistema GGEM
                </p>
            </div>

            {/* Cards de Resumo */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total de Alunos</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{totalAlunos}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                                <Users className="w-6 h-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total de Fichas</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{totalFichas}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
                                <FileText className="w-6 h-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Fichas Concluídas</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{fichasConcluidas}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                                <Award className="w-6 h-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Taxa de Aprovação</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                    {fichasConcluidas > 0
                                        ? `${Math.round((alunosAptos / fichasConcluidas) * 100)}%`
                                        : "0%"}
                                </p>
                            </div>
                            <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Card de Acesso Rápido - Fases da Orquestra */}
                <Link href="/dashboard/relatorios/fase-orquestra">
                    <Card className="hover:shadow-md transition-all cursor-pointer border-l-4 border-l-purple-500 h-full">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Relatório Detalhado</p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100">Fases da Orquestra</p>
                                    <p className="text-xs text-gray-500 mt-1">Ver alunos por fase e instrumento</p>
                                </div>
                                <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
                                    <Music className="w-6 h-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* Estatísticas por Instrumento */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Music className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            <CardTitle>Alunos por Instrumento</CardTitle>
                        </div>
                        <CardDescription>
                            Distribuição de alunos ativos por instrumento
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {estatisticasPorInstrumento.map((inst) => (
                                <div key={inst.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                                {inst.nome.charAt(0)}
                                            </span>
                                        </div>
                                        <span className="font-medium text-gray-900 dark:text-gray-100">{inst.nome}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-32 h-2 bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-600 dark:bg-blue-500 rounded-full"
                                                style={{
                                                    width: `${totalAlunos > 0 ? (inst._count.alunos / totalAlunos) * 100 : 0}%`
                                                }}
                                            />
                                        </div>
                                        <span className="text-sm font-medium w-8 text-right text-gray-900 dark:text-gray-100">
                                            {inst._count.alunos}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            <CardTitle>Alunos por Fase MSA</CardTitle>
                        </div>
                        <CardDescription>
                            Distribuição de alunos por fase do método
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {estatisticasPorFase.map((fase) => (
                                <div key={fase.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                                                {fase.ordem}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-900 dark:text-gray-100">{fase.nome}</span>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{fase.descricao}</p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full">
                                        {fase._count.alunos}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Últimas Fichas Concluídas */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
                            <CardTitle>Últimas Fichas Concluídas</CardTitle>
                        </div>
                        <Link href="/dashboard/fichas">
                            <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400">
                                Ver todas
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    {ultimasFichasConcluidas.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                            Nenhuma ficha concluída ainda.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {ultimasFichasConcluidas.map((ficha) => {
                                const tipoLabel: Record<string, string> = {
                                    SOLFEJO: "Solfejo",
                                    TEORIA_MUSICAL: "Teoria Musical",
                                    PRATICA_INSTRUMENTO: "Prática",
                                    HINARIO: "Hinário"
                                };

                                return (
                                    <Link
                                        key={ficha.id}
                                        href={`/dashboard/fichas/${ficha.id}`}
                                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors group"
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${ficha.apto
                                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                            : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                                            }`}>
                                            <Award className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                {ficha.aluno.nome}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {ficha.aluno.instrumento.nome} • {tipoLabel[ficha.tipoAula]}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${ficha.apto
                                                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                                : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                                                }`}>
                                                {ficha.apto ? "APTO" : "NÃO APTO"}
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Botões de Exportação */}
            {isAdmin && (
                <Card>
                    <CardHeader>
                        <CardTitle>Exportação de Dados</CardTitle>
                        <CardDescription>
                            Exporte relatórios em formato Excel/CSV
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            <Button variant="outline" className="justify-start h-auto py-3">
                                <Download className="w-4 h-4 mr-2" />
                                <div className="text-left">
                                    <p className="font-medium">Relatório de Alunos</p>
                                    <p className="text-xs text-gray-500">Lista completa em Excel</p>
                                </div>
                            </Button>

                            <Button variant="outline" className="justify-start h-auto py-3">
                                <Download className="w-4 h-4 mr-2" />
                                <div className="text-left">
                                    <p className="font-medium">Relatório de Fichas</p>
                                    <p className="text-xs text-gray-500">Todas as fichas em Excel</p>
                                </div>
                            </Button>

                            <Button variant="outline" className="justify-start h-auto py-3">
                                <Download className="w-4 h-4 mr-2" />
                                <div className="text-left">
                                    <p className="font-medium">Relatório de Desempenho</p>
                                    <p className="text-xs text-gray-500">Médias e aprovações</p>
                                </div>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

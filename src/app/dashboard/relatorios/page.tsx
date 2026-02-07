import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
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

    const isAdmin = session.user.role === "ADMIN";

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
                <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
                <p className="text-gray-500">
                    Visualize estatísticas e relatórios do sistema GEM
                </p>
            </div>

            {/* Cards de Resumo */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total de Alunos</p>
                                <p className="text-3xl font-bold text-gray-900">{totalAlunos}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                                <Users className="w-6 h-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total de Fichas</p>
                                <p className="text-3xl font-bold text-gray-900">{totalFichas}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
                                <FileText className="w-6 h-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Fichas Concluídas</p>
                                <p className="text-3xl font-bold text-gray-900">{fichasConcluidas}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-green-50 text-green-600">
                                <Award className="w-6 h-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Taxa de Aprovação</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {fichasConcluidas > 0
                                        ? `${Math.round((alunosAptos / fichasConcluidas) * 100)}%`
                                        : "0%"}
                                </p>
                            </div>
                            <div className="p-3 rounded-xl bg-orange-50 text-orange-600">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Estatísticas por Instrumento */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Music className="w-5 h-5 text-blue-600" />
                            <CardTitle>Alunos por Instrumento</CardTitle>
                        </div>
                        <CardDescription>
                            Distribuição de alunos ativos por instrumento
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {estatisticasPorInstrumento.map((inst) => (
                                <div key={inst.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                            <span className="text-sm font-medium text-blue-700">
                                                {inst.nome.charAt(0)}
                                            </span>
                                        </div>
                                        <span className="font-medium">{inst.nome}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-600 rounded-full"
                                                style={{
                                                    width: `${totalAlunos > 0 ? (inst._count.alunos / totalAlunos) * 100 : 0}%`
                                                }}
                                            />
                                        </div>
                                        <span className="text-sm font-medium w-8 text-right">
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
                            <GraduationCap className="w-5 h-5 text-purple-600" />
                            <CardTitle>Alunos por Fase MSA</CardTitle>
                        </div>
                        <CardDescription>
                            Distribuição de alunos por fase do método
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {estatisticasPorFase.map((fase) => (
                                <div key={fase.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                                            <span className="text-sm font-medium text-purple-700">
                                                {fase.ordem}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="font-medium">{fase.nome}</span>
                                            <p className="text-xs text-gray-500">{fase.descricao}</p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-medium bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
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
                            <Calendar className="w-5 h-5 text-green-600" />
                            <CardTitle>Últimas Fichas Concluídas</CardTitle>
                        </div>
                        <Link href="/dashboard/fichas">
                            <Button variant="ghost" size="sm" className="text-blue-600">
                                Ver todas
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    {ultimasFichasConcluidas.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">
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
                                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                            ficha.apto
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-700"
                                        }`}>
                                            <Award className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                                                {ficha.aluno.nome}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {ficha.aluno.instrumento.nome} • {tipoLabel[ficha.tipoAula]}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                ficha.apto
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-700"
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

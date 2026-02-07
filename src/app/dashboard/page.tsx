import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Users, FileText, CheckCircle2, ChevronRight, AlertCircle } from "lucide-react";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === "ADMIN";

    // Buscar estatísticas
    const totalAlunos = await prisma.aluno.count({
        where: isAdmin ? { ativo: true } : {
            ativo: true,
            OR: [
                { instrutor: { usuarioId: session?.user?.id } },
                { instrutor2: { usuarioId: session?.user?.id } }
            ]
        }
    });

    const totalInstrutores = await prisma.instrutor.count({
        where: { usuario: { ativo: true } }
    });

    const fichasEmAndamento = await prisma.fichaAcompanhamento.count({
        where: isAdmin ? { apto: null } : {
            apto: null,
            aluno: {
                OR: [
                    { instrutor: { usuarioId: session?.user?.id } },
                    { instrutor2: { usuarioId: session?.user?.id } }
                ]
            }
        }
    });

    const alunosAptos = await prisma.fichaAcompanhamento.count({
        where: isAdmin ? { apto: true } : {
            apto: true,
            aluno: {
                OR: [
                    { instrutor: { usuarioId: session?.user?.id } },
                    { instrutor2: { usuarioId: session?.user?.id } }
                ]
            }
        }
    });

    // Buscar alunos recentes (últimos 5)
    const alunosRecentes = await prisma.aluno.findMany({
        where: isAdmin ? { ativo: true } : {
            ativo: true,
            OR: [
                { instrutor: { usuarioId: session?.user?.id } },
                { instrutor2: { usuarioId: session?.user?.id } }
            ]
        },
        include: {
            instrumento: true,
            fase: true,
        },
        orderBy: { createdAt: "desc" },
        take: 5,
    });

    // Buscar fichas com avaliações pendentes (sem nota)
    const fichasComAvaliacoesPendentes = await prisma.fichaAcompanhamento.findMany({
        where: isAdmin ? {
            apto: null,
            avaliacoes: { some: { nota: null, presenca: true } }
        } : {
            apto: null,
            avaliacoes: { some: { nota: null, presenca: true } },
            aluno: {
                OR: [
                    { instrutor: { usuarioId: session?.user?.id } },
                    { instrutor2: { usuarioId: session?.user?.id } }
                ]
            }
        },
        include: {
            aluno: {
                include: {
                    instrumento: true,
                }
            },
            avaliacoes: {
                where: { nota: null, presenca: true },
                orderBy: { numeroAvaliacao: "asc" },
                take: 1,
            }
        },
        orderBy: { updatedAt: "desc" },
        take: 5,
    });

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500">
                    Bem-vindo de volta, {session?.user?.name?.split(" ")[0]}!
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total de Alunos"
                    value={totalAlunos.toString()}
                    description="alunos ativos"
                    icon={GraduationCap}
                    color="blue"
                    href="/dashboard/alunos"
                />
                {isAdmin && (
                    <StatsCard
                        title="Instrutores"
                        value={totalInstrutores.toString()}
                        description="instrutores ativos"
                        icon={Users}
                        color="purple"
                        href="/dashboard/instrutores"
                    />
                )}
                <StatsCard
                    title="Fichas Ativas"
                    value={fichasEmAndamento.toString()}
                    description="em andamento"
                    icon={FileText}
                    color="orange"
                    href="/dashboard/fichas"
                />
                <StatsCard
                    title="Alunos Aptos"
                    value={alunosAptos.toString()}
                    description="este período"
                    icon={CheckCircle2}
                    color="green"
                    href="/dashboard/fichas"
                />
            </div>

            {/* Recent Activity */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Alunos Recentes */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg">Alunos Recentes</CardTitle>
                        <Link href="/dashboard/alunos">
                            <Button variant="ghost" size="sm" className="text-blue-600">
                                Ver todos
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {alunosRecentes.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-4">
                                Nenhum aluno cadastrado ainda.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {alunosRecentes.map((aluno) => (
                                    <Link
                                        key={aluno.id}
                                        href={`/dashboard/alunos/${aluno.id}`}
                                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                            <span className="text-sm font-medium text-blue-700">
                                                {aluno.nome.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                                                {aluno.nome}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {aluno.instrumento.nome} • {aluno.fase.nome}
                                            </p>
                                        </div>
                                        <span className="text-xs text-gray-400">
                                            {formatDate(aluno.createdAt)}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Avaliações Pendentes */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg">Avaliações Pendentes</CardTitle>
                        <Link href="/dashboard/fichas">
                            <Button variant="ghost" size="sm" className="text-blue-600">
                                Ver fichas
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {fichasComAvaliacoesPendentes.length === 0 ? (
                            <div className="text-center py-4">
                                <CheckCircle2 className="w-12 h-12 text-green-100 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">
                                    Nenhuma avaliação pendente.
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    Todas as avaliações estão em dia!
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {fichasComAvaliacoesPendentes.map((ficha) => (
                                    <Link
                                        key={ficha.id}
                                        href={`/dashboard/fichas/${ficha.id}`}
                                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group border-l-4 border-amber-400"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                                            <AlertCircle className="w-5 h-5 text-amber-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                                                {ficha.aluno.nome}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {ficha.aluno.instrumento.nome} •
                                                Avaliação {ficha.avaliacoes[0]?.numeroAvaliacao || "?"} pendente
                                            </p>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-gray-400" />
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function StatsCard({
    title,
    value,
    description,
    icon: Icon,
    color,
    href,
}: {
    title: string;
    value: string;
    description: string;
    icon: React.ElementType;
    color: "blue" | "purple" | "orange" | "green";
    href?: string;
}) {
    const colors = {
        blue: "bg-blue-50 text-blue-600",
        purple: "bg-purple-50 text-purple-600",
        orange: "bg-orange-50 text-orange-600",
        green: "bg-green-50 text-green-600",
    };

    const content = (
        <Card className={href ? "hover:shadow-md transition-shadow cursor-pointer h-full" : "h-full"}>
            <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">{title}</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
                        <p className="text-xs text-gray-400 mt-1">{description}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${colors[color]}`}>
                        <Icon className="w-6 h-6" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    if (href) {
        return <Link href={href}>{content}</Link>;
    }

    return content;
}

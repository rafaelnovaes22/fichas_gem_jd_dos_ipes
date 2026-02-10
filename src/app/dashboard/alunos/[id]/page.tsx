import { notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText, Edit, User, Music, Calendar, Plus } from "lucide-react";

interface AlunoPageProps {
    params: Promise<{ id: string }>;
}

export default async function AlunoPage({ params }: AlunoPageProps) {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    const aluno = await prisma.aluno.findUnique({
        where: { id },
        include: {
            instrutor: { include: { usuario: true } },
            instrumento: true,
            fase: true,
            fichas: {
                include: {
                    aulas: { orderBy: { numeroAula: "asc" } },
                    avaliacoes: { orderBy: { numeroAvaliacao: "asc" } },
                },
                orderBy: { createdAt: "desc" },
            },
        },
    });

    if (!aluno) {
        notFound();
    }

    // Verificar permissão
    const isAdminUser = session?.user?.role ? isAdmin(session.user.role) : false;
    if (!isAdminUser && aluno.instrutor.usuarioId !== session?.user?.id) {
        notFound();
    }

    const formatDate = (date: Date | null) => {
        if (!date) return "-";
        return new Date(date).toLocaleDateString("pt-BR");
    };

    const faseOrquestraLabels: Record<string, string> = {
        ENSAIO: "Ensaio",
        RJM: "RJM",
        CULTO: "Culto",
        TROCA_INSTRUMENTO_CULTO: "Troca de Instrumento - Culto",
        TROCA_INSTRUMENTO_OFICIALIZACAO: "Troca de Instrumento - Oficialização",
        OFICIALIZACAO: "Oficialização",
        OFICIALIZADO: "Oficializado",
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div>
                        <div className="flex items-center gap-4">
                            <BackButton />
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Detalhes do Aluno</h1>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400">
                            {aluno.instrumento.nome} • {aluno.fase.nome}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link href={`/dashboard/alunos/${aluno.id}/editar`}>
                        <Button variant="outline">
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                        </Button>
                    </Link>

                </div>
            </div>

            {/* Info Cards */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Dados Pessoais
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Nome</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{aluno.nome}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Data de Nascimento</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{formatDate(aluno.dataNascimento)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Telefone</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{aluno.telefone || "-"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{aluno.email || "-"}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                            <Music className="w-4 h-4" />
                            Dados do Curso
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Instrumento</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{aluno.instrumento.nome}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Fase MSA</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{aluno.fase.nome}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Fase na Orquestra</p>
                            <p className="font-medium text-blue-600 dark:text-blue-400">{faseOrquestraLabels[aluno.faseOrquestra] || aluno.faseOrquestra}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Congregação</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{aluno.congregacao}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Instrutor</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{aluno.instrutor.usuario.nome}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Fichas</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{aluno.fichas.length}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Autorização LGPD</p>
                            <p className="font-medium">
                                {aluno.autorizacaoDados ? (
                                    <span className="text-green-600 dark:text-green-400">Autorizado</span>
                                ) : (
                                    <span className="text-red-600 dark:text-red-400">Pendente</span>
                                )}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Cadastrado em</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{formatDate(aluno.createdAt)}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Fichas */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-gray-900 dark:text-gray-100">Fichas de Acompanhamento</CardTitle>
                        <Link href={`/dashboard/fichas/nova?alunoId=${aluno.id}`}>
                            <Button variant="outline" size="sm">
                                <Plus className="w-4 h-4 mr-2" />
                                Nova Ficha
                            </Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    {aluno.fichas.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                            Nenhuma ficha de acompanhamento ainda.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {aluno.fichas.map((ficha) => {
                                const aulasRealizadas = ficha.aulas.filter((a) => a.presenca).length;
                                const avaliacoesRealizadas = ficha.avaliacoes.filter((a) => a.nota !== null).length;

                                const getTipoLabel = (tipo: string) => {
                                    switch (tipo) {
                                        case "SOLFEJO": return "Solfejo";
                                        case "TEORIA_MUSICAL": return "Teoria Musical";
                                        case "PRATICA_INSTRUMENTO": return "Prática de Instrumento";
                                        case "HINARIO": return "Hinário";
                                        default: return tipo;
                                    }
                                };

                                return (
                                    <Link
                                        key={ficha.id}
                                        href={`/dashboard/fichas/${ficha.id}`}
                                        className="block p-4 rounded-lg border border-gray-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                                    {getTipoLabel(ficha.tipoAula)}
                                                    {ficha.nivel && <span className="text-gray-500 dark:text-gray-400 font-normal"> - {ficha.nivel}</span>}
                                                </h4>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {aulasRealizadas}/20 aulas • {avaliacoesRealizadas}/3 avaliações
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                {ficha.apto !== null ? (
                                                    <span
                                                        className={`px-2 py-1 text-xs font-medium rounded-full ${ficha.apto
                                                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                                            : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                                                            }`}
                                                    >
                                                        {ficha.apto ? "APTO" : "NÃO APTO"}
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
                                                        Em andamento
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

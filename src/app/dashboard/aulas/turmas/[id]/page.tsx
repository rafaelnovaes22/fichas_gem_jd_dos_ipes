import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Plus, Calendar, Users, BookOpen } from "lucide-react";
import { diaSemanaLabel, faseOrquestraToNivel } from "@/lib/utils";
import { NivelProgramaMinimo } from "@prisma/client";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function TurmaDetailPage({ params }: PageProps) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === "ADMIN";

    const turma = await prisma.turma.findUnique({
        where: { id },
        include: {
            instrutor: { include: { usuario: true } },
            alunos: {
                where: { ativo: true },
                include: {
                    aluno: {
                        include: {
                            instrumento: true,
                            fase: true,
                            fichas: {
                                where: { apto: null },
                                include: {
                                    aulas: true,
                                },
                            },
                        },
                    },
                },
            },
            sessoes: {
                orderBy: { data: "desc" },
                take: 10,
                include: {
                    _count: {
                        select: {
                            registros: {
                                where: { presenca: true },
                            },
                        },
                    },
                },
            },
        },
    });

    if (!turma) {
        notFound();
    }

    // Verificar permissão
    const isOwner = turma.instrutor.usuarioId === session?.user?.id;
    if (!isAdmin && !isOwner) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Você não tem acesso a esta turma.</p>
                <Link href="/dashboard/aulas">
                    <Button variant="outline" className="mt-4">
                        Voltar
                    </Button>
                </Link>
            </div>
        );
    }

    // Buscar programa mínimo para cada aluno baseado no instrumento e faseOrquestra
    const alunosComPrograma = await Promise.all(
        turma.alunos.map(async (ta) => {
            const nivel = faseOrquestraToNivel(ta.aluno.faseOrquestra);
            let programaMinimo = null;

            if (nivel) {
                programaMinimo = await prisma.programaMinimo.findUnique({
                    where: {
                        instrumentoId_nivel: {
                            instrumentoId: ta.aluno.instrumentoId,
                            nivel: nivel as NivelProgramaMinimo,
                        },
                    },
                    include: { itens: true },
                });
            }

            return {
                ...ta,
                programaMinimo,
                nivel,
            };
        })
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/aulas">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{turma.nome}</h1>
                        <p className="text-gray-500">
                            {turma.diaSemana
                                ? `${diaSemanaLabel(turma.diaSemana)}${turma.horario ? ` às ${turma.horario}` : ""}`
                                : "Sem horário definido"}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link href={`/dashboard/aulas/turmas/${id}/editar`}>
                        <Button variant="outline">
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                        </Button>
                    </Link>
                    <Link href={`/dashboard/aulas/turmas/${id}/sessao`}>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Registrar Aula
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Alunos</p>
                                <p className="text-xl font-bold text-gray-900">
                                    {turma.alunos.length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Sessões</p>
                                <p className="text-xl font-bold text-gray-900">
                                    {turma.sessoes.length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Instrutor</p>
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {turma.instrutor.usuario.nome}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Alunos */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Alunos da Turma
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {alunosComPrograma.length === 0 ? (
                        <p className="text-center text-gray-500 py-4">
                            Nenhum aluno na turma.
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {alunosComPrograma.map(({ aluno, programaMinimo, nivel }) => (
                                <div
                                    key={aluno.id}
                                    className="flex items-start gap-4 p-4 border rounded-lg"
                                >
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                        <span className="font-medium text-blue-700">
                                            {aluno.nome.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-medium text-gray-900">
                                                {aluno.nome}
                                            </h3>
                                            <Badge variant="outline">
                                                {aluno.fase.nome}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            {aluno.instrumento.nome}
                                        </p>

                                        {/* Progresso na ficha */}
                                        {aluno.fichas.length > 0 && (
                                            <div className="mt-2">
                                                <p className="text-xs text-gray-500">
                                                    Ficha atual: {" "}
                                                    {aluno.fichas[0].aulas.length}/20 aulas
                                                </p>
                                                <div className="mt-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-blue-500 rounded-full"
                                                        style={{
                                                            width: `${(aluno.fichas[0].aulas.length / 20) * 100}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Requisitos do Programa Mínimo */}
                                        {programaMinimo && (
                                            <div className="mt-3 p-3 bg-indigo-50 rounded-lg">
                                                <p className="text-xs font-medium text-indigo-700 mb-1">
                                                    Programa Mínimo ({nivel}):
                                                </p>
                                                <ul className="text-xs text-gray-600 space-y-1">
                                                    {programaMinimo.itens.slice(0, 3).map((item) => (
                                                        <li key={item.id} className="flex items-start gap-1">
                                                            <span className="text-indigo-500">•</span>
                                                            <span className="truncate">{item.descricao}</span>
                                                        </li>
                                                    ))}
                                                    {programaMinimo.itens.length > 3 && (
                                                        <li className="text-indigo-500">
                                                            +{programaMinimo.itens.length - 3} itens...
                                                        </li>
                                                    )}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Histórico de Sessões */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Histórico de Aulas
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {turma.sessoes.length === 0 ? (
                        <p className="text-center text-gray-500 py-4">
                            Nenhuma aula registrada ainda.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {turma.sessoes.map((sessao) => (
                                <Link
                                    key={sessao.id}
                                    href={`/dashboard/aulas/turmas/${id}/sessao/${sessao.id}`}
                                >
                                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {new Date(sessao.data).toLocaleDateString(
                                                    "pt-BR",
                                                    {
                                                        weekday: "long",
                                                        day: "numeric",
                                                        month: "long",
                                                    }
                                                )}
                                            </p>
                                            {sessao.descricao && (
                                                <p className="text-sm text-gray-500">
                                                    {sessao.descricao}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <Badge variant="secondary">
                                                {sessao._count.registros} presentes
                                            </Badge>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

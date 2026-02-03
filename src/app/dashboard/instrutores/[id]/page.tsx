import { notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Edit, Users, Music, Building2 } from "lucide-react";

interface InstrutorPageProps {
    params: Promise<{ id: string }>;
}

export default async function InstrutorPage({ params }: InstrutorPageProps) {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (session?.user?.role !== "ADMIN") {
        notFound();
    }

    const instrutor = await prisma.instrutor.findUnique({
        where: { id },
        include: {
            usuario: true,
            alunosPrincipais: {
                where: { ativo: true },
                include: {
                    instrumento: true,
                    fase: true,
                },
                orderBy: { nome: "asc" },
            },
        },
    });

    if (!instrutor) {
        notFound();
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/instrutores">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{instrutor.usuario.nome}</h1>
                        <p className="text-gray-500">{instrutor.congregacao}</p>
                    </div>
                </div>
                <Link href={`/dashboard/instrutores/${instrutor.id}/editar`}>
                    <Button variant="outline">
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                    </Button>
                </Link>
            </div>

            {/* Info Cards */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Dados Pessoais
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div>
                            <p className="text-sm text-gray-500">Nome</p>
                            <p className="font-medium">{instrutor.usuario.nome}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium">{instrutor.usuario.email}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Telefone</p>
                            <p className="font-medium">{instrutor.usuario.telefone || "-"}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                            <Music className="w-4 h-4" />
                            Instrumentos
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {instrutor.instrumentos.map((inst) => (
                                <span
                                    key={inst}
                                    className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full"
                                >
                                    {inst}
                                </span>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div>
                            <p className="text-sm text-gray-500">Congregação</p>
                            <p className="font-medium">{instrutor.congregacao}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Alunos Ativos</p>
                            <p className="font-medium">{instrutor.alunosPrincipais.length}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Status</p>
                            <p className="font-medium">
                                {instrutor.usuario.ativo ? (
                                    <span className="text-green-600">Ativo</span>
                                ) : (
                                    <span className="text-red-600">Inativo</span>
                                )}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Alunos do Instrutor */}
            <Card>
                <CardHeader>
                    <CardTitle>Alunos</CardTitle>
                </CardHeader>
                <CardContent>
                    {instrutor.alunosPrincipais.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">
                            Nenhum aluno vinculado a este instrutor.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-2 px-3">Nome</th>
                                        <th className="text-left py-2 px-3">Instrumento</th>
                                        <th className="text-left py-2 px-3">Fase</th>
                                        <th className="text-left py-2 px-3">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {instrutor.alunosPrincipais.map((aluno: { id: string; nome: string; instrumento: { nome: string }; fase: { nome: string } }) => (
                                        <tr key={aluno.id} className="border-b">
                                            <td className="py-2 px-3 font-medium">{aluno.nome}</td>
                                            <td className="py-2 px-3">{aluno.instrumento.nome}</td>
                                            <td className="py-2 px-3">{aluno.fase.nome}</td>
                                            <td className="py-2 px-3">
                                                <Link href={`/dashboard/alunos/${aluno.id}`}>
                                                    <Button variant="ghost" size="sm">
                                                        Ver
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

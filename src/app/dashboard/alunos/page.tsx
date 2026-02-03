import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, MoreVertical } from "lucide-react";

export default async function AlunosPage() {
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === "ADMIN";

    // Buscar alunos (admin vê todos, instrutor vê apenas os seus)
    const alunos = await prisma.aluno.findMany({
        where: isAdmin
            ? { ativo: true }
            : {
                ativo: true,
                OR: [
                    { instrutor: { usuarioId: session?.user?.id } },
                    { instrutor2: { usuarioId: session?.user?.id } }
                ]
            },
        include: {
            instrutor: { include: { usuario: true } },
            instrutor2: { include: { usuario: true } },
            instrumento: true,
            fase: true,
            _count: { select: { fichas: true } },
        },
        orderBy: { nome: "asc" },
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Alunos</h1>
                    <p className="text-gray-500">
                        {alunos.length} aluno{alunos.length !== 1 ? "s" : ""} cadastrado{alunos.length !== 1 ? "s" : ""}
                    </p>
                </div>
                <Link href="/dashboard/alunos/novo">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Aluno
                    </Button>
                </Link>
            </div>

            {/* Search */}
            <Card>
                <CardContent className="pt-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nome, instrumento ou congregação..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Alunos List */}
            {alunos.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-gray-500 mb-4">Nenhum aluno cadastrado ainda.</p>
                        <Link href="/dashboard/alunos/novo">
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                Cadastrar primeiro aluno
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {alunos.map((aluno) => (
                        <Card key={aluno.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="py-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                            <span className="text-lg font-medium text-blue-700">
                                                {aluno.nome.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{aluno.nome}</h3>
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <span>{aluno.instrumento.nome}</span>
                                                <span>•</span>
                                                <span>{aluno.fase.nome}</span>
                                                <span>•</span>
                                                <span>{aluno.congregacao}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500">Instrutor{aluno.instrutor2 ? "es" : ""}</p>
                                            <p className="text-sm font-medium">
                                                {aluno.instrutor.usuario.nome.split(" ")[0]}
                                                {aluno.instrutor2 && `, ${aluno.instrutor2.usuario.nome.split(" ")[0]}`}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500">Fichas</p>
                                            <p className="text-sm font-medium">{aluno._count.fichas}</p>
                                        </div>
                                        <Link href={`/dashboard/alunos/${aluno.id}`}>
                                            <Button variant="ghost" size="icon">
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

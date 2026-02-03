import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Search } from "lucide-react";

export default async function FichasPage() {
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === "ADMIN";

    const fichas = await prisma.fichaAcompanhamento.findMany({
        where: isAdmin
            ? {}
            : { aluno: { instrutor: { usuarioId: session?.user?.id } } },
        include: {
            aluno: {
                include: {
                    instrutor: { include: { usuario: true } },
                    instrumento: true,
                    fase: true,
                },
            },
            _count: {
                select: { aulas: true, avaliacoes: true },
            },
        },
        orderBy: { updatedAt: "desc" },
    });

    const tipoAulaLabel: Record<string, string> = {
        TEORIA_MUSICAL: "Teoria Musical",
        LEITURA_METRICA: "Leitura Métrica",
        PRATICA_INSTRUMENTO: "Prática de Instrumento",
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Fichas de Acompanhamento</h1>
                    <p className="text-gray-500">
                        {fichas.length} ficha{fichas.length !== 1 ? "s" : ""} encontrada{fichas.length !== 1 ? "s" : ""}
                    </p>
                </div>
            </div>

            {/* Search */}
            <Card>
                <CardContent className="pt-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nome do aluno..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Fichas List */}
            {fichas.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">Nenhuma ficha encontrada.</p>
                        <Link href="/dashboard/alunos">
                            <Button variant="outline">Ver Alunos</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {fichas.map((ficha) => (
                        <Link key={ficha.id} href={`/dashboard/fichas/${ficha.id}`}>
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="py-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                                <FileText className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">
                                                    {ficha.aluno.nome}
                                                </h3>
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <span>{tipoAulaLabel[ficha.tipoAula]}</span>
                                                    <span>•</span>
                                                    <span>{ficha.aluno.instrumento.nome}</span>
                                                    <span>•</span>
                                                    <span>{ficha.aluno.fase.nome}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <p className="text-sm text-gray-500">Aulas</p>
                                                <p className="font-medium">{ficha._count.aulas}/20</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-500">Avaliações</p>
                                                <p className="font-medium">{ficha._count.avaliacoes}/3</p>
                                            </div>
                                            <div>
                                                {ficha.apto !== null ? (
                                                    <span
                                                        className={`px-3 py-1 text-sm font-medium rounded-full ${ficha.apto
                                                                ? "bg-green-100 text-green-700"
                                                                : "bg-red-100 text-red-700"
                                                            }`}
                                                    >
                                                        {ficha.apto ? "APTO" : "NÃO APTO"}
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 text-sm font-medium rounded-full bg-yellow-100 text-yellow-700">
                                                        Em andamento
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

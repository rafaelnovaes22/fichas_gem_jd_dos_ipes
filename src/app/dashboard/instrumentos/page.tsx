import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Music, Edit } from "lucide-react";
import { redirect } from "next/navigation";

export default async function InstrumentosPage() {
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== "ADMIN") {
        redirect("/dashboard");
    }

    const instrumentos = await prisma.instrumento.findMany({
        orderBy: [{ categoria: "asc" }, { nome: "asc" }],
        include: {
            _count: {
                select: { alunos: true },
            },
        },
    });

    // Agrupar por categoria
    const porCategoria = instrumentos.reduce((acc, inst) => {
        if (!acc[inst.categoria]) {
            acc[inst.categoria] = [];
        }
        acc[inst.categoria].push(inst);
        return acc;
    }, {} as Record<string, typeof instrumentos>);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Instrumentos</h1>
                    <p className="text-gray-500">Gerencie os instrumentos disponíveis</p>
                </div>
                <Link href="/dashboard/instrumentos/novo">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Instrumento
                    </Button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Music className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{instrumentos.length}</p>
                                <p className="text-sm text-gray-500">Total de Instrumentos</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <Music className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{instrumentos.filter(i => i.ativo).length}</p>
                                <p className="text-sm text-gray-500">Ativos</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <Music className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{Object.keys(porCategoria).length}</p>
                                <p className="text-sm text-gray-500">Categorias</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Lista por Categoria */}
            {Object.entries(porCategoria).map(([categoria, insts]) => (
                <Card key={categoria}>
                    <CardHeader>
                        <CardTitle className="text-lg">{categoria}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Desktop: Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-2 px-3">Nome</th>
                                        <th className="text-center py-2 px-3">Alunos</th>
                                        <th className="text-center py-2 px-3">Status</th>
                                        <th className="text-right py-2 px-3">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {insts.map((inst) => (
                                        <tr key={inst.id} className="border-b">
                                            <td className="py-2 px-3 font-medium">{inst.nome}</td>
                                            <td className="py-2 px-3 text-center">{inst._count.alunos}</td>
                                            <td className="py-2 px-3 text-center">
                                                {inst.ativo ? (
                                                    <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                                                        Ativo
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
                                                        Inativo
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-2 px-3 text-right">
                                                <Link href={`/dashboard/instrumentos/${inst.id}`}>
                                                    <Button variant="ghost" size="sm" className="h-10 w-10 md:h-8 md:w-8">
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile: Cards */}
                        <div className="md:hidden space-y-3">
                            {insts.map((inst) => (
                                <Link key={inst.id} href={`/dashboard/instrumentos/${inst.id}`}>
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                <Music className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{inst.nome}</p>
                                                <p className="text-xs text-gray-500">{inst._count.alunos} aluno{inst._count.alunos !== 1 ? 's' : ''}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {inst.ativo ? (
                                                <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                                                    Ativo
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
                                                    Inativo
                                                </span>
                                            )}
                                            <Edit className="w-4 h-4 text-gray-400" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

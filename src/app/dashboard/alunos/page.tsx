import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, MoreVertical } from "lucide-react";

const faseOrquestraLabels: Record<string, string> = {
    ENSAIO: "Ensaio",
    RJM: "RJM",
    CULTO: "Culto",
    TROCA_INSTRUMENTO_CULTO: "Troca Inst. - Culto",
    TROCA_INSTRUMENTO_OFICIALIZACAO: "Troca Inst. - Ofic.",
    OFICIALIZACAO: "Oficialização",
    OFICIALIZADO: "Oficializado",
};

const faseOrquestraColors: Record<string, string> = {
    ENSAIO: "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300",
    RJM: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
    CULTO: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
    TROCA_INSTRUMENTO_CULTO: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
    TROCA_INSTRUMENTO_OFICIALIZACAO: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400",
    OFICIALIZACAO: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400",
    OFICIALIZADO: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
};

export default async function AlunosPage() {
    const session = await getServerSession(authOptions);
    const isAdminUser = session?.user?.role ? isAdmin(session.user.role) : false;

    // Buscar alunos (admin vê todos, instrutor vê apenas os seus)
    const alunos = await prisma.aluno.findMany({
        where: isAdminUser
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
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Alunos</h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        {alunos.length} aluno{alunos.length !== 1 ? "s" : ""} cadastrado{alunos.length !== 1 ? "s" : ""}
                    </p>
                </div>
                <Link href="/dashboard/alunos/novo">
                    <Button className="h-10 md:h-9 px-4 md:px-3">
                        <Plus className="w-5 h-5 md:w-4 md:h-4 mr-2" />
                        <span className="hidden sm:inline">Novo Aluno</span>
                        <span className="sm:hidden">Novo</span>
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
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-950 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Alunos List */}
            {alunos.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-gray-500 dark:text-gray-400 mb-4">Nenhum aluno cadastrado ainda.</p>
                        <Link href="/dashboard/alunos/novo">
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                Cadastrar primeiro aluno
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-3 md:gap-4">
                    {alunos.map((aluno) => (
                        <Card key={aluno.id} className="hover:shadow-md transition-shadow dark:border-zinc-800">
                            <CardContent className="p-3 md:p-4">
                                <div className="flex items-center gap-3 md:gap-4">
                                    {/* Avatar - Smaller on mobile */}
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                        <span className="text-base md:text-lg font-medium text-blue-700 dark:text-blue-300">
                                            {aluno.nome.charAt(0).toUpperCase()}
                                        </span>
                                    </div>

                                    {/* Main Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm md:text-base truncate">{aluno.nome}</h3>
                                            <span className={`text-[10px] md:text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${faseOrquestraColors[aluno.faseOrquestra] || "bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-300"}`}>
                                                {faseOrquestraLabels[aluno.faseOrquestra] || aluno.faseOrquestra}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-xs md:text-sm text-gray-500 dark:text-gray-400">
                                            <span className="truncate max-w-[100px] md:max-w-none">{aluno.instrumento.nome}</span>
                                            <span className="hidden md:inline">•</span>
                                            <span className="truncate max-w-[80px] md:max-w-none">{aluno.fase.nome}</span>
                                            <span className="hidden md:inline">•</span>
                                            <span className="truncate max-w-[100px] md:max-w-none hidden sm:inline">{aluno.congregacao}</span>
                                        </div>
                                        {/* Mobile-only congregação */}
                                        <p className="text-xs text-gray-400 dark:text-gray-500 sm:hidden truncate">{aluno.congregacao}</p>
                                    </div>

                                    {/* Stats - Hidden on smallest screens, visible on larger mobile */}
                                    <div className="hidden sm:flex items-center gap-3 md:gap-4">
                                        <div className="text-right">
                                            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Instrutor{aluno.instrutor2 ? "es" : ""}</p>
                                            <p className="text-xs md:text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {aluno.instrutor.usuario.nome.split(" ")[0]}
                                                {aluno.instrutor2 && `, ${aluno.instrutor2.usuario.nome.split(" ")[0]}`}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Fichas</p>
                                            <p className="text-xs md:text-sm font-medium text-gray-900 dark:text-gray-100">{aluno._count.fichas}</p>
                                        </div>
                                    </div>

                                    {/* Action Button - Larger touch target */}
                                    <Link href={`/dashboard/alunos/${aluno.id}`}>
                                        <Button variant="ghost" size="icon" className="h-10 w-10 md:h-9 md:w-9 text-gray-500 dark:text-gray-400">
                                            <MoreVertical className="w-5 h-5 md:w-4 md:h-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

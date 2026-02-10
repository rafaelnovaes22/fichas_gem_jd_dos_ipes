import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, User, Search, Mail, Phone, MapPin } from "lucide-react";
import { redirect } from "next/navigation";

export default async function InstrutoresPage() {
    const session = await getServerSession(authOptions);

    if (!session || !isAdmin(session.user.role)) {
        redirect("/dashboard");
    }

    const roleLabels: Record<string, string> = {
        INSTRUTOR: "Instrutor",
        ENCARREGADO: "Encarregado",
        ADMIN: "Admin",
    };

    const roleColors: Record<string, string> = {
        INSTRUTOR: "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300",
        ENCARREGADO: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
        ADMIN: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
    };

    const instrutores = await prisma.instrutor.findMany({
        where: {
            usuario: {
                ativo: true,
            },
        },
        include: {
            usuario: {
                select: {
                    nome: true,
                    email: true,
                    telefone: true,
                    ativo: true,
                    role: true,
                },
            },
            _count: {
                select: {
                    alunosPrincipais: true,
                    alunosSecundarios: true
                },
            },
        },
        orderBy: { usuario: { nome: "asc" } },
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Instrutores</h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Gerencie o corpo docente da escola
                    </p>
                </div>
                <Link href="/dashboard/instrutores/novo">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Instrutor
                    </Button>
                </Link>
            </div>

            {/* Search Bar (Visual only for now) */}
            <Card>
                <CardContent className="pt-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nome, email ou congregação..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-950 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* List */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {instrutores.map((instrutor) => (
                    <Link key={instrutor.id} href={`/dashboard/instrutores/${instrutor.id}`}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer h-full border-gray-200 dark:border-zinc-800">
                            <CardContent className="pt-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                            <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                                {instrutor.usuario.nome}
                                            </h3>
                                            <div className="flex gap-1 mt-1">
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${instrutor.usuario.ativo
                                                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                                    : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                                                    }`}>
                                                    {instrutor.usuario.ativo ? "Ativo" : "Inativo"}
                                                </span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${roleColors[instrutor.usuario.role] || "bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-300"}`}>
                                                    {roleLabels[instrutor.usuario.role] || instrutor.usuario.role}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        <span className="truncate">{instrutor.usuario.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4" />
                                        <span>{instrutor.usuario.telefone || "-"}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        <span className="truncate">{instrutor.congregacao}</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100 dark:border-zinc-800">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {instrutor._count.alunosPrincipais + instrutor._count.alunosSecundarios} Alunos
                                        </span>
                                        <span className="text-xs text-gray-400 dark:text-gray-500">
                                            Ver detalhes →
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}

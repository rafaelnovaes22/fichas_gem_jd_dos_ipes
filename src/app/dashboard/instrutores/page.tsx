import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, User, Search, Mail, Phone, MapPin } from "lucide-react";
import { redirect } from "next/navigation";

export default async function InstrutoresPage() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
        redirect("/dashboard");
    }

    const instrutores = await prisma.instrutor.findMany({
        include: {
            usuario: {
                select: {
                    nome: true,
                    email: true,
                    telefone: true,
                    ativo: true,
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
                    <h1 className="text-2xl font-bold text-gray-900">Instrutores</h1>
                    <p className="text-gray-500">
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
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* List */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {instrutores.map((instrutor) => (
                    <Link key={instrutor.id} href={`/dashboard/instrutores/${instrutor.id}`}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                            <CardContent className="pt-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                            <User className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">
                                                {instrutor.usuario.nome}
                                            </h3>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${instrutor.usuario.ativo
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-700"
                                                }`}>
                                                {instrutor.usuario.ativo ? "Ativo" : "Inativo"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm text-gray-500 mb-4">
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

                                <div className="pt-4 border-t border-gray-100">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-900">
                                            {instrutor._count.alunosPrincipais + instrutor._count.alunosSecundarios} Alunos
                                        </span>
                                        <span className="text-xs text-gray-400">
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

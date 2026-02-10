import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BackButton } from "@/components/ui/back-button";
import { ArrowLeft } from "lucide-react";
import { SessaoForm } from "./form";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function SessaoPage({ params }: PageProps) {
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

    // Buscar programa mínimo para cada instrumento dos alunos
    const instrumentosIds = [...new Set(turma.alunos.map((ta) => ta.aluno.instrumentoId))];
    const programasMinimo = await prisma.programaMinimo.findMany({
        where: {
            instrumentoId: { in: instrumentosIds },
        },
        include: {
            instrumento: true,
            itens: {
                orderBy: { ordem: "asc" },
            },
        },
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <BackButton />
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Registrar Aula</h1>
                    <p className="text-gray-500">{turma.nome}</p>
                </div>
            </div>

            {/* Form */}
            <SessaoForm
                turmaId={id}
                alunos={turma.alunos.map((ta) => ta.aluno)}
                programasMinimo={programasMinimo}
            />
        </div>
    );
}

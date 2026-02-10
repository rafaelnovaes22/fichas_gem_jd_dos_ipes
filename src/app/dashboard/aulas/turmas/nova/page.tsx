import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";
import { ArrowLeft } from "lucide-react";
import { TurmaForm } from "./form";

export default async function NovaTurmaPage() {
    const session = await getServerSession(authOptions);

    // Buscar alunos do instrutor logado
    const alunos = await prisma.aluno.findMany({
        where: {
            ativo: true,
            OR: [
                { instrutor: { usuarioId: session?.user?.id } },
                { instrutor2: { usuarioId: session?.user?.id } },
            ],
        },
        include: {
            instrumento: true,
            fase: true,
        },
        orderBy: { nome: "asc" },
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <BackButton />
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Nova Turma</h1>
                    <p className="text-gray-500">
                        Crie uma nova turma para organizar suas aulas
                    </p>
                </div>
            </div>

            {/* Form */}
            <TurmaForm alunos={alunos} />
        </div>
    );
}

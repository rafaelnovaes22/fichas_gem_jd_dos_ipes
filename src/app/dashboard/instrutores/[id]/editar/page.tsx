import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EditarInstrutorForm } from "./form";

interface EditarInstrutorPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditarInstrutorPage({ params }: EditarInstrutorPageProps) {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session || !isAdmin(session.user.role)) {
        notFound();
    }

    const instrutor = await prisma.instrutor.findUnique({
        where: { id },
        include: {
            usuario: true,
        },
    });

    if (!instrutor) {
        notFound();
    }

    const instrumentosDisponiveis = await prisma.instrumento.findMany({
        where: { ativo: true },
        orderBy: [{ categoria: "asc" }, { nome: "asc" }],
    });

    return (
        <EditarInstrutorForm
            instrutor={{
                id: instrutor.id,
                usuario: {
                    nome: instrutor.usuario.nome,
                    telefone: instrutor.usuario.telefone,
                    role: instrutor.usuario.role,
                },
                congregacao: instrutor.congregacao,
                instrumentos: instrutor.instrumentos,
            }}
            instrumentosDisponiveis={instrumentosDisponiveis}
            userRole={session.user.role}
        />
    );
}

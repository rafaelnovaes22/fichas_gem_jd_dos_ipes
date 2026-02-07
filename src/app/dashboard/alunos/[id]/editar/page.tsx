import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EditarAlunoForm } from "./form";

interface EditarAlunoPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditarAlunoPage({ params }: EditarAlunoPageProps) {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    const aluno = await prisma.aluno.findUnique({
        where: { id },
        include: {
            instrutor: true,
            instrutor2: true,
        },
    });

    if (!aluno) {
        notFound();
    }

    // Verificar permissão
    const isAdmin = session?.user?.role === "ADMIN";
    const isInstrutorPrimary = aluno.instrutor.usuarioId === session?.user?.id;
    const isInstrutorSecondary = aluno.instrutor2?.usuarioId === session?.user?.id;

    if (!isAdmin && !isInstrutorPrimary && !isInstrutorSecondary) {
        notFound();
    }

    const instrumentos = await prisma.instrumento.findMany({
        where: { ativo: true },
        orderBy: [{ categoria: "asc" }, { nome: "asc" }],
    });

    const fases = await prisma.fase.findMany({
        where: { ativo: true },
        orderBy: { ordem: "asc" },
    });

    const instrutores = await prisma.instrutor.findMany({
        include: { usuario: true },
        orderBy: { usuario: { nome: "asc" } },
    });

    return (
        <EditarAlunoForm
            aluno={{
                id: aluno.id,
                nome: aluno.nome,
                dataNascimento: aluno.dataNascimento?.toISOString() || null,
                telefone: aluno.telefone,
                email: aluno.email,
                congregacao: aluno.congregacao,
                instrumentoId: aluno.instrumentoId,
                faseId: aluno.faseId,
                faseOrquestra: aluno.faseOrquestra,
                autorizacaoDados: aluno.autorizacaoDados,
                instrutorId: aluno.instrutor.id,
                instrutor2Id: aluno.instrutor2?.id || null,
            }}
            instrumentos={instrumentos}
            fases={fases}
            instrutores={instrutores}
        />
    );
}

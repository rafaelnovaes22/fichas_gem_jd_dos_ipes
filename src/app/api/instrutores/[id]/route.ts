import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const instructorUpdateSchema = z.object({
    nome: z.string().min(3).optional(),
    telefone: z.string().optional(),
    congregacao: z.string().min(1).optional(),
    instrumentos: z.array(z.string()).min(1).optional(),
    ativo: z.boolean().optional(),
});

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session || session.user.role !== "ADMIN") {
        // Instrutor pode ver seu próprio perfil? Por enquanto bloqueado.
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const instrutor = await prisma.instrutor.findUnique({
        where: { id },
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
                    alunosSecundarios: true,
                },
            },
        },
    });

    if (!instrutor) {
        return NextResponse.json({ error: "Instrutor não encontrado" }, { status: 404 });
    }

    return NextResponse.json(instrutor);
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await params;

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
        }

        const body = await request.json();
        const result = instructorUpdateSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: "Dados inválidos", details: result.error.issues },
                { status: 400 }
            );
        }

        const instrutor = await prisma.instrutor.findUnique({
            where: { id },
            include: { usuario: true },
        });

        if (!instrutor) {
            return NextResponse.json({ error: "Instrutor não encontrado" }, { status: 404 });
        }

        const { nome, telefone, congregacao, instrumentos, ativo } = result.data;

        // Atualização transacional (Usuario + Instrutor)
        const instrutorAtualizado = await prisma.$transaction(async (tx) => {
            // Atualizar dados de usuário se necessário
            if (nome || telefone || ativo !== undefined) {
                await tx.usuario.update({
                    where: { id: instrutor.usuarioId },
                    data: {
                        nome,
                        telefone,
                        ativo,
                    },
                });
            }

            // Atualizar dados de instrutor se necessário
            const updatedInstrutor = await tx.instrutor.update({
                where: { id },
                data: {
                    congregacao,
                    instrumentos,
                },
                include: {
                    usuario: true,
                },
            });

            return updatedInstrutor;
        });

        return NextResponse.json(instrutorAtualizado);
    } catch (error) {
        console.error("Erro ao atualizar instrutor:", error);
        return NextResponse.json(
            { error: "Erro interno ao atualizar instrutor" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await params;

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
        }

        const instrutor = await prisma.instrutor.findUnique({
            where: { id },
        });

        if (!instrutor) {
            return NextResponse.json({ error: "Instrutor não encontrado" }, { status: 404 });
        }

        // Verificar se tem alunos ativos como instrutor principal
        const alunosPrincipais = await prisma.aluno.count({
            where: { instrutorId: id, ativo: true },
        });

        // Verificar se tem alunos ativos como instrutor secundário
        const alunosSecundarios = await prisma.aluno.count({
            where: { instrutor2Id: id, ativo: true },
        });

        const totalAlunos = alunosPrincipais + alunosSecundarios;
        if (totalAlunos > 0) {
            return NextResponse.json(
                {
                    error: `Instrutor possui ${totalAlunos} aluno(s) ativo(s). Reatribua os alunos a outro instrutor antes de excluir.`,
                    alunosPrincipais,
                    alunosSecundarios,
                },
                { status: 400 }
            );
        }

        // Soft delete (apenas desativar o usuário)
        await prisma.usuario.update({
            where: { id: instrutor.usuarioId },
            data: { ativo: false },
        });

        return NextResponse.json({ message: "Instrutor desativado com sucesso" });
    } catch (error) {
        console.error("Erro ao desativar instrutor:", error);
        return NextResponse.json(
            { error: "Erro interno ao desativar instrutor" },
            { status: 500 }
        );
    }
}

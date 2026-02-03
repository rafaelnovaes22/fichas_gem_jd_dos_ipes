import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const faseUpdateSchema = z.object({
    nome: z.string().min(1).optional(),
    descricao: z.string().optional(),
    ordem: z.number().int().min(1).optional(),
    ativo: z.boolean().optional(),
});

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET - Obter uma fase
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await params;

        if (!session) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const fase = await prisma.fase.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { alunos: true, topicos: true },
                },
                topicos: {
                    orderBy: { numero: "asc" },
                },
            },
        });

        if (!fase) {
            return NextResponse.json({ error: "Fase não encontrada" }, { status: 404 });
        }

        return NextResponse.json(fase);
    } catch (error) {
        console.error("Erro ao buscar fase:", error);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}

// PUT - Atualizar fase (Admin only)
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await params;

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
        }

        const body = await request.json();
        const result = faseUpdateSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: "Dados inválidos", details: result.error.issues },
                { status: 400 }
            );
        }

        const fase = await prisma.fase.update({
            where: { id },
            data: result.data,
        });

        return NextResponse.json(fase);
    } catch (error) {
        console.error("Erro ao atualizar fase:", error);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}

// DELETE - Desativar fase (Admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await params;

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
        }

        const fase = await prisma.fase.findUnique({
            where: { id },
        });

        if (!fase) {
            return NextResponse.json({ error: "Fase não encontrada" }, { status: 404 });
        }

        // Verificar se tem alunos ativos nesta fase
        const alunosCount = await prisma.aluno.count({
            where: { faseId: id, ativo: true },
        });

        if (alunosCount > 0) {
            return NextResponse.json(
                {
                    error: `Fase possui ${alunosCount} aluno(s) ativo(s). Não é possível excluir.`,
                    alunosCount,
                },
                { status: 400 }
            );
        }

        // Soft delete
        await prisma.fase.update({
            where: { id },
            data: { ativo: false },
        });

        return NextResponse.json({ message: "Fase desativada com sucesso" });
    } catch (error) {
        console.error("Erro ao desativar fase:", error);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}

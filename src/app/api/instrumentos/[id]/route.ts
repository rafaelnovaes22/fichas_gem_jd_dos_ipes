import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const instrumentoUpdateSchema = z.object({
    nome: z.string().min(1).optional(),
    categoria: z.string().min(1).optional(),
    ativo: z.boolean().optional(),
});

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET - Buscar instrumento por ID
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await params;

        if (!session) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const instrumento = await prisma.instrumento.findUnique({
            where: { id },
            include: {
                _count: { select: { alunos: true } },
            },
        });

        if (!instrumento) {
            return NextResponse.json({ error: "Instrumento não encontrado" }, { status: 404 });
        }

        return NextResponse.json(instrumento);
    } catch (error) {
        console.error("Erro ao buscar instrumento:", error);
        return NextResponse.json({ error: "Erro ao buscar instrumento" }, { status: 500 });
    }
}

// PUT - Atualizar instrumento
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await params;

        if (!session || !isAdmin(session.user.role)) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
        }

        const body = await request.json();
        const result = instrumentoUpdateSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: "Dados inválidos", details: result.error.issues },
                { status: 400 }
            );
        }

        const instrumento = await prisma.instrumento.update({
            where: { id },
            data: result.data,
        });

        return NextResponse.json(instrumento);
    } catch (error) {
        console.error("Erro ao atualizar instrumento:", error);
        return NextResponse.json({ error: "Erro ao atualizar instrumento" }, { status: 500 });
    }
}

// DELETE - Desativar instrumento
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await params;

        if (!session || !isAdmin(session.user.role)) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
        }

        const instrumento = await prisma.instrumento.findUnique({
            where: { id },
        });

        if (!instrumento) {
            return NextResponse.json({ error: "Instrumento não encontrado" }, { status: 404 });
        }

        // Verificar se tem alunos ativos usando este instrumento
        const alunosCount = await prisma.aluno.count({
            where: { instrumentoId: id, ativo: true },
        });

        if (alunosCount > 0) {
            return NextResponse.json(
                {
                    error: `Instrumento em uso por ${alunosCount} aluno(s) ativo(s). Não é possível excluir.`,
                    alunosCount,
                },
                { status: 400 }
            );
        }

        await prisma.instrumento.update({
            where: { id },
            data: { ativo: false },
        });

        return NextResponse.json({ message: "Instrumento desativado com sucesso" });
    } catch (error) {
        console.error("Erro ao desativar instrumento:", error);
        return NextResponse.json({ error: "Erro ao desativar instrumento" }, { status: 500 });
    }
}

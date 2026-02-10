import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const topicoUpdateSchema = z.object({
    numero: z.string().min(1).optional(),
    titulo: z.string().min(1).optional(),
    descricao: z.string().optional(),
});

interface RouteParams {
    params: Promise<{ id: string; topicoId: string }>;
}

// GET - Obter um tópico
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions);
        const { topicoId } = await params;

        if (!session) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const topico = await prisma.topicoMSA.findUnique({
            where: { id: topicoId },
            include: {
                fase: true,
            },
        });

        if (!topico) {
            return NextResponse.json({ error: "Tópico não encontrado" }, { status: 404 });
        }

        return NextResponse.json(topico);
    } catch (error) {
        console.error("Erro ao buscar tópico:", error);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}

// PUT - Atualizar tópico (Admin only)
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions);
        const { id, topicoId } = await params;

        if (!session || !isAdmin(session.user.role)) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
        }

        const body = await request.json();
        const result = topicoUpdateSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: "Dados inválidos", details: result.error.issues },
                { status: 400 }
            );
        }

        // Verificar se tópico existe
        const topicoExistente = await prisma.topicoMSA.findUnique({
            where: { id: topicoId },
        });

        if (!topicoExistente) {
            return NextResponse.json({ error: "Tópico não encontrado" }, { status: 404 });
        }

        // Verificar se novo número já existe (se estiver mudando)
        if (result.data.numero && result.data.numero !== topicoExistente.numero) {
            const numeroExistente = await prisma.topicoMSA.findFirst({
                where: {
                    faseId: id,
                    numero: result.data.numero,
                    id: { not: topicoId },
                },
            });

            if (numeroExistente) {
                return NextResponse.json(
                    { error: "Já existe um tópico com este número nesta fase" },
                    { status: 400 }
                );
            }
        }

        const topico = await prisma.topicoMSA.update({
            where: { id: topicoId },
            data: result.data,
        });

        return NextResponse.json(topico);
    } catch (error) {
        console.error("Erro ao atualizar tópico:", error);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}

// DELETE - Excluir tópico (Admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions);
        const { topicoId } = await params;

        if (!session || !isAdmin(session.user.role)) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
        }

        const topico = await prisma.topicoMSA.findUnique({
            where: { id: topicoId },
            include: {
                _count: {
                    select: { aulas: true },
                },
            },
        });

        if (!topico) {
            return NextResponse.json({ error: "Tópico não encontrado" }, { status: 404 });
        }

        // Verificar se tópico está sendo usado em aulas
        if (topico._count.aulas > 0) {
            return NextResponse.json(
                {
                    error: `Tópico está sendo usado em ${topico._count.aulas} aula(s). Não é possível excluir.`,
                },
                { status: 400 }
            );
        }

        await prisma.topicoMSA.delete({
            where: { id: topicoId },
        });

        return NextResponse.json({ message: "Tópico excluído com sucesso" });
    } catch (error) {
        console.error("Erro ao excluir tópico:", error);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}

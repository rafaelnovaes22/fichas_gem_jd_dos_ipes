import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const faseSchema = z.object({
    nome: z.string().min(1, "Nome é obrigatório"),
    descricao: z.string().optional(),
    ordem: z.number().int().min(1),
});

// GET - Listar todas as fases
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const fases = await prisma.fase.findMany({
            where: { ativo: true },
            include: {
                _count: {
                    select: { alunos: true, topicos: true },
                },
            },
            orderBy: { ordem: "asc" },
        });

        return NextResponse.json(fases);
    } catch (error) {
        console.error("Erro ao listar fases:", error);
        return NextResponse.json(
            { error: "Erro interno ao listar fases" },
            { status: 500 }
        );
    }
}

// POST - Criar nova fase (Admin only)
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !isAdmin(session.user.role)) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
        }

        const body = await request.json();
        const result = faseSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: "Dados inválidos", details: result.error.issues },
                { status: 400 }
            );
        }

        // Verificar se já existe
        const existente = await prisma.fase.findUnique({
            where: { nome: result.data.nome },
        });

        if (existente) {
            if (existente.ativo) {
                return NextResponse.json(
                    { error: "Fase já existe" },
                    { status: 400 }
                );
            }
            // Reativar se estava inativa
            const reativada = await prisma.fase.update({
                where: { id: existente.id },
                data: { ativo: true, ...result.data },
            });
            return NextResponse.json(reativada);
        }

        const fase = await prisma.fase.create({
            data: result.data,
        });

        return NextResponse.json(fase, { status: 201 });
    } catch (error) {
        console.error("Erro ao criar fase:", error);
        return NextResponse.json(
            { error: "Erro interno ao criar fase" },
            { status: 500 }
        );
    }
}

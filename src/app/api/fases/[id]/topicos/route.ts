import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const topicoSchema = z.object({
    numero: z.string().min(1, "Número é obrigatório"),
    titulo: z.string().min(1, "Título é obrigatório"),
    descricao: z.string().optional(),
});

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET - Listar tópicos da fase
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await params;

        if (!session) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const topicos = await prisma.topicoMSA.findMany({
            where: { faseId: id },
            orderBy: { numero: "asc" },
        });

        return NextResponse.json(topicos);
    } catch (error) {
        console.error("Erro ao listar tópicos:", error);
        return NextResponse.json(
            { error: "Erro interno ao listar tópicos" },
            { status: 500 }
        );
    }
}

// POST - Criar novo tópico (Admin only)
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await params;

        if (!session || !isAdmin(session.user.role)) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
        }

        const body = await request.json();
        const result = topicoSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: "Dados inválidos", details: result.error.issues },
                { status: 400 }
            );
        }

        // Verificar se fase existe
        const fase = await prisma.fase.findUnique({
            where: { id },
        });

        if (!fase) {
            return NextResponse.json({ error: "Fase não encontrada" }, { status: 404 });
        }

        // Verificar se já existe tópico com mesmo número nesta fase
        const existente = await prisma.topicoMSA.findFirst({
            where: { faseId: id, numero: result.data.numero },
        });

        if (existente) {
            return NextResponse.json(
                { error: "Já existe um tópico com este número nesta fase" },
                { status: 400 }
            );
        }

        const topico = await prisma.topicoMSA.create({
            data: {
                ...result.data,
                faseId: id,
            },
        });

        return NextResponse.json(topico, { status: 201 });
    } catch (error) {
        console.error("Erro ao criar tópico:", error);
        return NextResponse.json(
            { error: "Erro interno ao criar tópico" },
            { status: 500 }
        );
    }
}

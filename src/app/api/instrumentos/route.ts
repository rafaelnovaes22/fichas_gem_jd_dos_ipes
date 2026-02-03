import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const instrumentoSchema = z.object({
    nome: z.string().min(1, "Nome é obrigatório"),
    categoria: z.string().min(1, "Categoria é obrigatória"),
});

// GET - Listar todos os instrumentos
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const instrumentos = await prisma.instrumento.findMany({
            orderBy: [{ categoria: "asc" }, { nome: "asc" }],
            include: {
                _count: {
                    select: { alunos: true },
                },
            },
        });

        return NextResponse.json(instrumentos);
    } catch (error) {
        console.error("Erro ao buscar instrumentos:", error);
        return NextResponse.json({ error: "Erro ao buscar instrumentos" }, { status: 500 });
    }
}

// POST - Criar novo instrumento
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
        }

        const body = await request.json();
        const result = instrumentoSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: "Dados inválidos", details: result.error.issues },
                { status: 400 }
            );
        }

        // Verificar se já existe
        const existente = await prisma.instrumento.findUnique({
            where: { nome: result.data.nome },
        });

        if (existente) {
            return NextResponse.json({ error: "Instrumento já existe" }, { status: 400 });
        }

        const instrumento = await prisma.instrumento.create({
            data: result.data,
        });

        return NextResponse.json(instrumento, { status: 201 });
    } catch (error) {
        console.error("Erro ao criar instrumento:", error);
        return NextResponse.json({ error: "Erro ao criar instrumento" }, { status: 500 });
    }
}

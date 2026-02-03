import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const aulaSchema = z.object({
    numeroAula: z.number().min(1).max(20),
    data: z.string(),
    anotacoes: z.string().optional(),
    presenca: z.boolean().default(false),
    ausencia: z.boolean().default(false),
    justificativa: z.enum(["ENFERMIDADE", "TRABALHO", "VIAGEM", "OUTROS"]).optional().nullable(),
    vistoInstrutor: z.boolean().default(false),
    instrutorId: z.string(),
    topicoMsaId: z.string().optional().nullable(),
});

interface RouteParams {
    params: Promise<{ id: string }>;
}

// POST - Criar/Atualizar aula
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions);
        const { id: fichaId } = await params;

        if (!session) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const body = await request.json();
        const data = aulaSchema.parse(body);

        // Verificar se a ficha existe e o usuário tem permissão
        const ficha = await prisma.fichaAcompanhamento.findUnique({
            where: { id: fichaId },
            include: { aluno: { include: { instrutor: true } } },
        });

        if (!ficha) {
            return NextResponse.json({ error: "Ficha não encontrada" }, { status: 404 });
        }

        const isAdmin = session.user.role === "ADMIN";
        if (!isAdmin && ficha.aluno.instrutor.usuarioId !== session.user.id) {
            return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
        }

        // Upsert da aula
        const aula = await prisma.aulaRegistro.upsert({
            where: {
                fichaId_numeroAula: {
                    fichaId,
                    numeroAula: data.numeroAula,
                },
            },
            update: {
                data: new Date(data.data),
                anotacoes: data.anotacoes || null,
                presenca: data.presenca,
                ausencia: data.ausencia,
                justificativa: data.justificativa || null,
                vistoInstrutor: data.vistoInstrutor,
                topicoMsaId: data.topicoMsaId || null,
            },
            create: {
                fichaId,
                numeroAula: data.numeroAula,
                data: new Date(data.data),
                anotacoes: data.anotacoes || null,
                presenca: data.presenca,
                ausencia: data.ausencia,
                justificativa: data.justificativa || null,
                instrutorId: data.instrutorId,
                vistoInstrutor: data.vistoInstrutor,
                topicoMsaId: data.topicoMsaId || null,
            },
        });

        return NextResponse.json(aula);
    } catch (error) {
        console.error("Erro ao salvar aula:", error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Dados inválidos", details: error.issues },
                { status: 400 }
            );
        }

        return NextResponse.json({ error: "Erro ao salvar aula" }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const avaliacaoSchema = z.object({
    numeroAvaliacao: z.number().min(1).max(3),
    data: z.string().optional(),
    nota: z.number().min(0).max(10).nullable().optional(),
    anotacoes: z.string().optional(),
    presenca: z.boolean().optional(),
    ausencia: z.boolean().optional(),
    justificativa: z.enum(["ENFERMIDADE", "TRABALHO", "VIAGEM", "OUTROS"]).nullable().optional(),
    vistoInstrutor: z.boolean().optional(),
});

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions);
        const { id: fichaId } = await params;

        if (!session) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const body = await request.json();
        const result = avaliacaoSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: "Dados inválidos", details: result.error.issues },
                { status: 400 }
            );
        }

        // Verificar se a ficha existe e se o usuário tem permissão
        const ficha = await prisma.fichaAcompanhamento.findUnique({
            where: { id: fichaId },
            include: {
                aluno: {
                    include: { instrutor: true },
                },
            },
        });

        if (!ficha) {
            return NextResponse.json({ error: "Ficha não encontrada" }, { status: 404 });
        }

        const isAdmin = session.user.role === "ADMIN";
        if (!isAdmin && ficha.aluno.instrutor.usuarioId !== session.user.id) {
            return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
        }

        // Buscar o instrutor do usuário logado
        const instrutor = await prisma.instrutor.findFirst({
            where: { usuarioId: session.user.id },
        });

        if (!instrutor) {
            return NextResponse.json({ error: "Instrutor não encontrado" }, { status: 400 });
        }

        const { numeroAvaliacao, data, nota, anotacoes, presenca, ausencia, justificativa, vistoInstrutor } = result.data;

        // Verificar se já existe uma avaliação para este número
        const avaliacaoExistente = await prisma.avaliacao.findUnique({
            where: {
                fichaId_numeroAvaliacao: {
                    fichaId,
                    numeroAvaliacao,
                },
            },
        });

        let avaliacao;

        if (avaliacaoExistente) {
            // Atualizar avaliação existente
            avaliacao = await prisma.avaliacao.update({
                where: { id: avaliacaoExistente.id },
                data: {
                    data: data ? new Date(data) : undefined,
                    nota,
                    anotacoes,
                    presenca,
                    ausencia,
                    justificativa,
                    vistoInstrutor,
                    instrutorId: instrutor.id,
                },
            });
        } else {
            // Criar nova avaliação
            avaliacao = await prisma.avaliacao.create({
                data: {
                    fichaId,
                    numeroAvaliacao,
                    data: data ? new Date(data) : new Date(),
                    nota: nota ?? null,
                    anotacoes: anotacoes || null,
                    presenca: presenca ?? false,
                    ausencia: ausencia ?? false,
                    justificativa: justificativa ?? null,
                    instrutorId: instrutor.id,
                    vistoInstrutor: vistoInstrutor ?? false,
                },
            });
        }

        // Se houver notas, recalcular média
        const todasAvaliacoes = await prisma.avaliacao.findMany({
            where: { fichaId },
        });

        const notasValidas = todasAvaliacoes.filter((a) => a.nota !== null).map((a) => a.nota as number);

        if (notasValidas.length > 0) {
            const media = notasValidas.reduce((acc, n) => acc + n, 0) / notasValidas.length;
            await prisma.fichaAcompanhamento.update({
                where: { id: fichaId },
                data: { mediaFinal: media },
            });
        }

        return NextResponse.json(avaliacao);
    } catch (error) {
        console.error("Erro ao salvar avaliação:", error);
        return NextResponse.json(
            { error: "Erro ao salvar avaliação" },
            { status: 500 }
        );
    }
}

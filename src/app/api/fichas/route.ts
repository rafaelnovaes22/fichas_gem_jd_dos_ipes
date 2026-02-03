import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const fichaCreateSchema = z.object({
    alunoId: z.string().min(1),
    tipoAula: z.enum(["SOLFEJO", "TEORIA_MUSICAL", "PRATICA_INSTRUMENTO", "HINARIO"]),
    instrutorId: z.string().min(1).optional(),
    nivel: z.string().optional(),
    livro: z.string().optional(),
});

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const body = await request.json();
        const data = fichaCreateSchema.parse(body);

        // Se não informar instrutor, tenta usar o do usuário logado se for instrutor
        let instrutorId = data.instrutorId;
        if (!instrutorId) {
            const instrutorLogado = await prisma.instrutor.findUnique({
                where: { usuarioId: session.user.id },
            });
            if (instrutorLogado) {
                instrutorId = instrutorLogado.id;
            }
        }

        // Se ainda não tiver instrutor, erro (ou poderia pegar do aluno)
        if (!instrutorId) {
            // Tentar pegar do aluno?
            const aluno = await prisma.aluno.findUnique({
                where: { id: data.alunoId },
                select: { instrutorId: true }
            });
            if (aluno) {
                instrutorId = aluno.instrutorId;
            } else {
                return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 });
            }
        }

        const ficha = await prisma.fichaAcompanhamento.create({
            data: {
                alunoId: data.alunoId,
                tipoAula: data.tipoAula,
                nivel: data.nivel,
                livro: data.livro,
            },
        });

        return NextResponse.json(ficha);
    } catch (error) {
        console.error("Erro ao criar ficha:", error);
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Dados inválidos", details: error.issues },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: "Erro interno ao criar ficha" },
            { status: 500 }
        );
    }
}

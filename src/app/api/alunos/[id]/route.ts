import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const alunoUpdateSchema = z.object({
    nome: z.string().min(3).optional(),
    dataNascimento: z.string().optional(),
    telefone: z.string().optional(),
    email: z.string().email().optional().or(z.literal("")),
    congregacao: z.string().min(1).optional(),
    instrumentoId: z.string().min(1).optional(),
    faseId: z.string().min(1).optional(),
    faseOrquestra: z.enum(["ENSAIO", "RJM", "CULTO", "TROCA_INSTRUMENTO_CULTO", "TROCA_INSTRUMENTO_OFICIALIZACAO", "OFICIALIZACAO", "OFICIALIZADO"]).optional(),
    instrutor2Id: z.string().optional().nullable().or(z.literal("")).transform(v => v === "" ? null : v),
    autorizacaoDados: z.boolean().optional(),
    ativo: z.boolean().optional(),
});

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET - Buscar aluno por ID
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await params;

        if (!session) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const aluno = await prisma.aluno.findUnique({
            where: { id },
            include: {
                instrutor: { include: { usuario: true } },
                instrutor2: { include: { usuario: true } },
                instrumento: true,
                fase: true,
                fichas: {
                    include: {
                        aulas: { orderBy: { numeroAula: "asc" } },
                        avaliacoes: { orderBy: { numeroAvaliacao: "asc" } },
                    },
                },
            },
        });

        if (!aluno) {
            return NextResponse.json(
                { error: "Aluno não encontrado" },
                { status: 404 }
            );
        }

        // Verificar permissão (admin vê todos, instrutor vê apenas os seus)
        // Verificar permissão (admin vê todos, instrutor vê apenas os seus)
        const isAdmin = session.user.role === "ADMIN";
        const isInstrutorPrimary = aluno.instrutor.usuarioId === session.user.id;
        const isInstrutorSecondary = aluno.instrutor2?.usuarioId === session.user.id; // Verifica se existe e compara

        if (!isAdmin && !isInstrutorPrimary && !isInstrutorSecondary) {
            return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
        }

        return NextResponse.json(aluno);
    } catch (error) {
        console.error("Erro ao buscar aluno:", error);
        return NextResponse.json(
            { error: "Erro ao buscar aluno" },
            { status: 500 }
        );
    }
}

// PUT - Atualizar aluno
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await params;

        if (!session) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const aluno = await prisma.aluno.findUnique({
            where: { id },
            include: { instrutor: true },
        });

        if (!aluno) {
            return NextResponse.json(
                { error: "Aluno não encontrado" },
                { status: 404 }
            );
        }

        // Verificar permissão
        const isAdmin = session.user.role === "ADMIN";
        if (!isAdmin && aluno.instrutor.usuarioId !== session.user.id) {
            return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
        }

        const body = await request.json();
        const data = alunoUpdateSchema.parse(body);

        const alunoAtualizado = await prisma.aluno.update({
            where: { id },
            data: {
                ...data,
                dataNascimento: data.dataNascimento
                    ? new Date(data.dataNascimento)
                    : undefined,
            },
            include: {
                instrutor: { include: { usuario: true } },
                instrumento: true,
                fase: true,
            },
        });

        return NextResponse.json(alunoAtualizado);
    } catch (error) {
        console.error("Erro ao atualizar aluno:", error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Dados inválidos", details: error.issues },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Erro ao atualizar aluno" },
            { status: 500 }
        );
    }
}

// DELETE - Desativar aluno
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await params;

        if (!session) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const aluno = await prisma.aluno.findUnique({
            where: { id },
            include: { instrutor: true, instrutor2: true },
        });

        if (!aluno) {
            return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 });
        }

        // Verificar permissão: admin pode tudo, instrutor só seus alunos
        const isAdmin = session.user.role === "ADMIN";
        const isInstrutorPrimary = aluno.instrutor.usuarioId === session.user.id;
        const isInstrutorSecondary = aluno.instrutor2?.usuarioId === session.user.id;

        if (!isAdmin && !isInstrutorPrimary && !isInstrutorSecondary) {
            return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
        }

        await prisma.aluno.update({
            where: { id },
            data: { ativo: false },
        });

        return NextResponse.json({ message: "Aluno desativado com sucesso" });
    } catch (error) {
        console.error("Erro ao desativar aluno:", error);
        return NextResponse.json(
            { error: "Erro ao desativar aluno" },
            { status: 500 }
        );
    }
}

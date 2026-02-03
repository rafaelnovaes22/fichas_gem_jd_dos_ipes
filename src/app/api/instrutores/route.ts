import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const instructorSchema = z.object({
    nome: z.string().min(3),
    email: z.string().email(),
    telefone: z.string().optional(),
    congregacao: z.string().min(1),
    instrumentos: z.array(z.string()).min(1),
});

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const instrutores = await prisma.instrutor.findMany({
        include: {
            usuario: {
                select: {
                    nome: true,
                    email: true,
                    telefone: true,
                    ativo: true,
                },
            },
            _count: {
                select: { alunosPrincipais: true, alunosSecundarios: true },
            },
        },
        orderBy: { usuario: { nome: "asc" } },
    });

    return NextResponse.json(instrutores);
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
        }

        const body = await request.json();
        const result = instructorSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: "Dados inválidos", details: result.error.issues },
                { status: 400 }
            );
        }

        const { nome, email, telefone, congregacao, instrumentos } = result.data;

        // Verificar se email já existe
        const existingUser = await prisma.usuario.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "Email já cadastrado no sistema" },
                { status: 400 }
            );
        }

        // Criar Usuário (com senha padrão 'mudar123' ou aleatória)
        // Para simplificar, vamos usar uma senha padrão que deve ser trocada
        const senhaHash = await bcrypt.hash("gem123", 10);

        const novoInstrutor = await prisma.$transaction(async (tx) => {
            const usuario = await tx.usuario.create({
                data: {
                    nome,
                    email,
                    telefone: telefone || null,
                    senha: senhaHash,
                    role: "INSTRUTOR",
                },
            });

            const instrutor = await tx.instrutor.create({
                data: {
                    usuarioId: usuario.id,
                    congregacao,
                    instrumentos,
                },
                include: {
                    usuario: true,
                },
            });

            return instrutor;
        });

        return NextResponse.json(novoInstrutor, { status: 201 });
    } catch (error) {
        console.error("Erro ao criar instrutor:", error);
        return NextResponse.json(
            { error: "Erro interno ao criar instrutor" },
            { status: 500 }
        );
    }
}

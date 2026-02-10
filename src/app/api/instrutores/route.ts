import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const instructorSchema = z.object({
    nome: z.string().min(3),
    email: z.string().email(),
    telefone: z.string().optional(),
    congregacao: z.string().min(1),
    instrumentos: z.array(z.string()).min(1),
    role: z.enum(["INSTRUTOR", "ENCARREGADO", "ADMIN"]).default("INSTRUTOR"),
});

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !isAdmin(session.user.role)) {
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
                    role: true,
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

        if (!session || !isAdmin(session.user.role)) {
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

        const { nome, email, telefone, congregacao, instrumentos, role } = result.data;

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

        // Validações de roles
        // Não é permitido criar um novo ENCARREGADO via API (apenas um por congregação, definido no seed)
        if (role === "ENCARREGADO") {
            return NextResponse.json(
                { error: "Não é permitido criar um novo Encarregado através da interface. O Encarregado é definido na configuração inicial do sistema." },
                { status: 403 }
            );
        }

        // Limite de 3 ADMINs ativos
        if (role === "ADMIN") {
            const adminCount = await prisma.usuario.count({
                where: { role: "ADMIN", ativo: true }
            });
            if (adminCount >= 3) {
                return NextResponse.json(
                    { error: "Limite máximo de 3 secretários (ADMINs) atingido. Desative um dos secretários existentes antes de adicionar um novo." },
                    { status: 400 }
                );
            }
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
                    role,
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

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
    nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    email: z.string().email("Email inválido"),
    telefone: z.string().optional(),
    senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
    congregacao: z.string().min(1, "Congregação é obrigatória"),
    instrumentos: z.array(z.string()).min(1, "Selecione pelo menos um instrumento"),
    role: z.enum(["INSTRUTOR", "ENCARREGADO"]).optional().default("INSTRUTOR"),
    inviteCode: z.string().optional(),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const result = registerSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: "Dados inválidos", details: result.error.issues },
                { status: 400 }
            );
        }

        const { nome, email, telefone, senha, congregacao, instrumentos, role, inviteCode } = result.data;

        // Verificar código de convite se for ENCARREGADO
        if (role === "ENCARREGADO") {
            const adminCode = process.env.ADMIN_INVITE_CODE;
            if (!inviteCode || inviteCode !== adminCode) {
                return NextResponse.json(
                    { error: "Código de convite inválido para registro como Encarregado/Admin." },
                    { status: 403 }
                );
            }
        }

        const registrationOpen = process.env.REGISTRATION_OPEN === "true";

        // Se for INSTRUTOR e o registro estiver FECHADO
        if (role === "INSTRUTOR" && !registrationOpen) {
            return NextResponse.json(
                { error: "O cadastro de instrutores está temporariamente fechado." },
                { status: 403 }
            );
        }

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

        // Verificar se todos os instrumentos existem
        const instrumentosExistentes = await prisma.instrumento.findMany({
            where: {
                id: { in: instrumentos },
                ativo: true,
            },
        });

        if (instrumentosExistentes.length !== instrumentos.length) {
            return NextResponse.json(
                { error: "Um ou mais instrumentos selecionados são inválidos" },
                { status: 400 }
            );
        }

        // Se estiver tentando se registrar como ENCARREGADO, verificar se já existe um
        if (role === "ENCARREGADO") {
            const encarregadoCount = await prisma.instrutor.count({
                where: {
                    usuario: {
                        role: "ENCARREGADO",
                        ativo: true,
                    },
                    congregacao: congregacao
                }
            });

            // Limite de 4 (1 titular + 3 auxiliares)
            if (encarregadoCount >= 4) {
                return NextResponse.json(
                    { error: `Limite de Encarregados/Administradores (4) atingido para a congregação ${congregacao}` },
                    { status: 400 }
                );
            }
        }

        // Hash da senha
        const senhaHash = await bcrypt.hash(senha, 10);

        // Criar usuário e instrutor em transação
        const novoInstrutor = await prisma.$transaction(async (tx) => {
            const usuario = await tx.usuario.create({
                data: {
                    nome,
                    email,
                    telefone: telefone || null,
                    senha: senhaHash,
                    role: role,
                    ativo: true,
                },
            });

            const instrutor = await tx.instrutor.create({
                data: {
                    usuarioId: usuario.id,
                    congregacao,
                    instrumentos,
                },
                include: {
                    usuario: {
                        select: {
                            id: true,
                            nome: true,
                            email: true,
                            telefone: true,
                            ativo: true,
                        },
                    },
                },
            });

            return instrutor;
        });

        return NextResponse.json(
            {
                message: "Cadastro realizado com sucesso",
                instrutor: {
                    id: novoInstrutor.id,
                    nome: novoInstrutor.usuario.nome,
                    email: novoInstrutor.usuario.email,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Erro ao cadastrar instrutor:", error);
        return NextResponse.json(
            { error: "Erro interno ao realizar cadastro" },
            { status: 500 }
        );
    }
}

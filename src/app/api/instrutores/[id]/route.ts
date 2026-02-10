import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const instructorUpdateSchema = z.object({
    nome: z.string().min(3).optional(),
    telefone: z.string().optional(),
    congregacao: z.string().min(1).optional(),
    instrumentos: z.array(z.string()).min(1).optional(),
    ativo: z.boolean().optional(),
    role: z.enum(["INSTRUTOR", "ENCARREGADO", "ADMIN"]).optional(),
});

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session || !isAdmin(session.user.role)) {
        // Instrutor pode ver seu próprio perfil? Por enquanto bloqueado.
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const instrutor = await prisma.instrutor.findUnique({
        where: { id },
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
                select: {
                    alunosPrincipais: true,
                    alunosSecundarios: true,
                },
            },
        },
    });

    if (!instrutor) {
        return NextResponse.json({ error: "Instrutor não encontrado" }, { status: 404 });
    }

    return NextResponse.json(instrutor);
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await params;

        if (!session || !isAdmin(session.user.role)) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
        }

        const body = await request.json();
        const result = instructorUpdateSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: "Dados inválidos", details: result.error.issues },
                { status: 400 }
            );
        }

        const instrutor = await prisma.instrutor.findUnique({
            where: { id },
            include: { usuario: true },
        });

        if (!instrutor) {
            return NextResponse.json({ error: "Instrutor não encontrado" }, { status: 404 });
        }

        const { nome, telefone, congregacao, instrumentos, ativo, role } = result.data;

        // Validações de roles
        // Não permitir alterar o role de um ENCARREGADO
        if (instrutor.usuario.role === "ENCARREGADO" && role && role !== "ENCARREGADO") {
            return NextResponse.json(
                { error: "Não é permitido alterar a role do Encarregado. O Encarregado é único e definido na configuração inicial do sistema." },
                { status: 403 }
            );
        }

        // Não permitir promover alguém para ENCARREGADO
        if (role === "ENCARREGADO" && instrutor.usuario.role !== "ENCARREGADO") {
            return NextResponse.json(
                { error: "Não é permitido definir um instrutor como Encarregado. O Encarregado é único e definido na configuração inicial do sistema." },
                { status: 403 }
            );
        }

        // Não permitir desativar o ENCARREGADO
        if (instrutor.usuario.role === "ENCARREGADO" && ativo === false) {
            return NextResponse.json(
                { error: "Não é permitido desativar o Encarregado." },
                { status: 403 }
            );
        }

        // Verificar limite de ADMINs ao promover
        if (role === "ADMIN" && instrutor.usuario.role !== "ADMIN") {
            const adminCount = await prisma.usuario.count({
                where: { role: "ADMIN", ativo: true }
            });
            if (adminCount >= 3) {
                return NextResponse.json(
                    { error: "Limite máximo de 3 secretários (ADMINs) atingido. Desative um dos secretários existentes antes de promover este instrutor." },
                    { status: 400 }
                );
            }
        }

        // Atualização transacional (Usuario + Instrutor)
        const instrutorAtualizado = await prisma.$transaction(async (tx) => {
            // Atualizar dados de usuário se necessário
            if (nome || telefone || ativo !== undefined || role !== undefined) {
                await tx.usuario.update({
                    where: { id: instrutor.usuarioId },
                    data: {
                        nome,
                        telefone,
                        ativo,
                        role,
                    },
                });
            }

            // Atualizar dados de instrutor se necessário
            const updatedInstrutor = await tx.instrutor.update({
                where: { id },
                data: {
                    congregacao,
                    instrumentos,
                },
                include: {
                    usuario: true,
                },
            });

            return updatedInstrutor;
        });

        return NextResponse.json(instrutorAtualizado);
    } catch (error) {
        console.error("Erro ao atualizar instrutor:", error);
        return NextResponse.json(
            { error: "Erro interno ao atualizar instrutor" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await params;

        if (!session || !isAdmin(session.user.role)) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
        }

        const instrutor = await prisma.instrutor.findUnique({
            where: { id },
            include: { usuario: true },
        });

        if (!instrutor) {
            return NextResponse.json({ error: "Instrutor não encontrado" }, { status: 404 });
        }

        // Não permitir desativar o ENCARREGADO se for Soft Delete (mantido logicamente no frontend/backend check)
        // Mas para exclusão, vamos permitir se for solicitado explicitamente.
        // A proteção principal é: Só quem tem permissão de ADMIN (ou Encarregado) chega aqui.
        // Se um Encarregado quiser se excluir (e for o único), o sistema pode ficar sem admin.
        // Vamos adicionar um check: Se for excluir o ENCARREGADO, verificar se existe outro ADMIN/ENCARREGADO ativo?
        // Simplificação: Permitir exclusão. O sistema permite criar novo Encarregado em /register se não houver nenhum.

        // REMOVIDO BLOQUEIO DE EXCLUSÃO DE ENCARREGADO
        // if (instrutor.usuario.role === "ENCARREGADO") { ... }

        // Verificar histórico para decidir entre Hard Delete ou Soft Delete
        const hasAulas = await prisma.aulaRegistro.count({ where: { instrutorId: id } });
        const hasAvaliacoes = await prisma.avaliacao.count({ where: { instrutorId: id } });
        const hasSessoes = await prisma.sessaoAula.count({ where: { instrutorId: id } });

        // Verificar alunos ativos (impede exclusão/desativação se tiver alunos)
        const alunosPrincipais = await prisma.aluno.count({
            where: { instrutorId: id, ativo: true },
        });
        const alunosSecundarios = await prisma.aluno.count({
            where: { instrutor2Id: id, ativo: true },
        });

        const totalAlunos = alunosPrincipais + alunosSecundarios;
        if (totalAlunos > 0) {
            return NextResponse.json(
                {
                    error: `Instrutor possui ${totalAlunos} aluno(s) ativo(s). Reatribua os alunos a outro instrutor antes de excluir.`,
                    alunosPrincipais,
                    alunosSecundarios,
                },
                { status: 400 }
            );
        }

        const hasTurmas = await prisma.turma.count({ where: { instrutorId: id } });
        const hasAlunosTotal = await prisma.aluno.count({
            where: {
                OR: [
                    { instrutorId: id },
                    { instrutor2Id: id }
                ]
            }
        });

        const hasHistory = (hasAulas + hasAvaliacoes + hasSessoes + hasTurmas + hasAlunosTotal) > 0;

        if (hasHistory) {
            // Soft Delete: Apenas desativa o usuário
            console.log(`Soft deleting instructor ${instrutor.usuario.email} due to existing history.`);
            await prisma.usuario.update({
                where: { id: instrutor.usuarioId },
                data: { ativo: false },
            });
            return NextResponse.json({
                message: "Instrutor desativado com sucesso (mantido histórico).",
                type: "soft"
            });
        } else {
            // Hard Delete: Exclui usuário e instrutor
            // Como Instrutor tem CASCADE no usuarioId, deletar o usuario deve deletar o instrutor.
            // Mas vamos garantir deletando o usuário.
            console.log(`Hard deleting instructor ${instrutor.usuario.email}.`);
            await prisma.usuario.delete({
                where: { id: instrutor.usuarioId },
            });
            return NextResponse.json({
                message: "Instrutor excluído permanentemente.",
                type: "hard"
            });
        }

    } catch (error) {
        console.error("Erro ao excluir instrutor:", error);
        return NextResponse.json(
            { error: "Erro interno ao excluir instrutor" },
            { status: 500 }
        );
    }
}

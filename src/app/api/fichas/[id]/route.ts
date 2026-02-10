import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await params;

        if (!session) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const ficha = await prisma.fichaAcompanhamento.findUnique({
            where: { id },
            include: {
                aluno: {
                    select: {
                        instrutorId: true,
                        instrutor: { select: { usuarioId: true } }
                    }
                }
            }
        });

        if (!ficha) {
            return NextResponse.json({ error: "Ficha não encontrada" }, { status: 404 });
        }

        // Verificar permissão: ADMIN ou Dono da ficha (Instrutor do aluno)
        const isOwner = ficha.aluno.instrutor.usuarioId === session.user.id;
        const userIsAdmin = isAdmin(session.user.role);

        if (!userIsAdmin && !isOwner) {
            return NextResponse.json({ error: "Sem permissão para excluir esta ficha" }, { status: 403 });
        }

        // Exclusão (Cascata configurada no Schema para Aulas e Avaliações)
        await prisma.fichaAcompanhamento.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Ficha excluída com sucesso" });

    } catch (error) {
        console.error("Erro ao excluir ficha:", error);
        return NextResponse.json(
            { error: "Erro interno ao excluir ficha" },
            { status: 500 }
        );
    }
}

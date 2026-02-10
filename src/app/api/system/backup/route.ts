
import { getServerSession } from "next-auth";
import { authOptions, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user || !isAdmin(session.user.role)) {
        return new NextResponse("Não autorizado", { status: 401 });
    }

    try {
        const [usuarios, instrutores, alunos, fichas, turmas] = await Promise.all([
            prisma.usuario.findMany({
                select: { id: true, nome: true, email: true, role: true, ativo: true },
            }),
            prisma.instrutor.findMany({
                include: { usuario: { select: { nome: true, email: true } } },
            }),
            prisma.aluno.findMany({
                include: {
                    instrumento: { select: { nome: true } },
                    fase: { select: { nome: true } },
                }
            }),
            prisma.fichaAcompanhamento.findMany({
                include: {
                    aulas: true,
                    avaliacoes: true,
                }
            }),
            prisma.turma.findMany({
                include: {
                    alunos: true,
                    sessoes: true,
                }
            })
        ]);

        const backupData = {
            timestamp: new Date().toISOString(),
            usuarios,
            instrutores,
            alunos,
            fichas,
            turmas,
        };

        return NextResponse.json(backupData);
    } catch (error) {
        console.error("[SYSTEM_BACKUP]", error);
        return new NextResponse("Erro interno", { status: 500 });
    }
}

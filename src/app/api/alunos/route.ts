import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isAdmin as checkIsAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const alunoSchema = z.object({
    nome: z.string().min(3),
    dataNascimento: z.string().optional(),
    telefone: z.string().optional(),
    email: z.string().email().optional().or(z.literal("")),
    congregacao: z.string().min(1),
    instrutor2Id: z.string().optional(),
    instrumentoId: z.string().min(1),
    faseId: z.string().min(1),
    faseOrquestra: z.enum(["ENSAIO", "RJM", "CULTO", "TROCA_INSTRUMENTO_CULTO", "TROCA_INSTRUMENTO_OFICIALIZACAO", "OFICIALIZACAO", "OFICIALIZADO"]).default("ENSAIO"),
    autorizacaoDados: z.boolean().default(false),
});

// GET - Listar alunos
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const isAdmin = checkIsAdmin(session.user.role);

        const alunos = await prisma.aluno.findMany({
            where: isAdmin
                ? { ativo: true }
                : {
                    ativo: true,
                    OR: [
                        { instrutor: { usuarioId: session.user.id } },
                        { instrutor2: { usuarioId: session.user.id } }
                    ]
                },
            include: {
                instrutor: { include: { usuario: true } },
                instrutor2: { include: { usuario: true } },
                instrumento: true,
                fase: true,
                _count: { select: { fichas: true } },
            },
            orderBy: { nome: "asc" },
        });

        return NextResponse.json(alunos);
    } catch (error) {
        console.error("Erro ao listar alunos:", error);
        return NextResponse.json(
            { error: "Erro ao listar alunos" },
            { status: 500 }
        );
    }
}

// POST - Criar aluno
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const body = await request.json();
        const data = alunoSchema.parse(body);

        // Buscar instrutor do usuário logado
        let instrutorId = session.user.instrutorId;

        // Se é admin e não tem instrutor, criar um instrutor "sistema"
        if (!instrutorId && checkIsAdmin(session.user.role)) {
            const adminInstrutor = await prisma.instrutor.findFirst({
                where: { usuario: { role: "ADMIN" } },
            });

            if (adminInstrutor) {
                instrutorId = adminInstrutor.id;
            } else {
                // Criar instrutor para o admin
                const newInstrutor = await prisma.instrutor.create({
                    data: {
                        usuarioId: session.user.id,
                        congregacao: "Administração",
                        instrumentos: [],
                    },
                });
                instrutorId = newInstrutor.id;
            }
        }

        if (!instrutorId) {
            return NextResponse.json(
                { error: "Instrutor não encontrado" },
                { status: 400 }
            );
        }

        const aluno = await prisma.aluno.create({
            data: {
                nome: data.nome,
                dataNascimento: data.dataNascimento
                    ? new Date(data.dataNascimento)
                    : null,
                telefone: data.telefone || null,
                email: data.email || null,
                congregacao: data.congregacao,
                instrutorId,
                instrutor2Id: data.instrutor2Id || null,
                instrumentoId: data.instrumentoId,
                faseId: data.faseId,
                faseOrquestra: data.faseOrquestra,
                autorizacaoDados: data.autorizacaoDados,
            },
            include: {
                instrutor: { include: { usuario: true } },
                instrutor2: { include: { usuario: true } },
                instrumento: true,
                fase: true,
            },
        });

        // Criar ficha de acompanhamento padrão (Teoria)
        await prisma.fichaAcompanhamento.create({
            data: {
                alunoId: aluno.id,
                tipoAula: "TEORIA_MUSICAL",
            },
        });

        return NextResponse.json(aluno, { status: 201 });
    } catch (error) {
        console.error("Erro ao criar aluno:", error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Dados inválidos", details: error.issues },
                { status: 400 }
            );
        }

        return NextResponse.json({ error: "Erro ao criar aluno" }, { status: 500 });
    }
}

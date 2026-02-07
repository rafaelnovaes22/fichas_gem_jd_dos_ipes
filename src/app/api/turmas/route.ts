import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const turmaSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  descricao: z.string().optional(),
  diaSemana: z.enum(["DOMINGO", "SEGUNDA", "TERCA", "QUARTA", "QUINTA", "SEXTA", "SABADO"]).optional(),
  horario: z.string().optional(),
  alunoIds: z.array(z.string()).optional(),
});

// GET - Listar turmas
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const isAdmin = session.user.role === "ADMIN";

    // Buscar instrutor do usuário logado
    const instrutor = await prisma.instrutor.findUnique({
      where: { usuarioId: session.user.id },
    });

    const turmas = await prisma.turma.findMany({
      where: isAdmin
        ? { ativo: true }
        : { ativo: true, instrutorId: instrutor?.id },
      include: {
        instrutor: { include: { usuario: true } },
        _count: { select: { alunos: { where: { ativo: true } } } },
        sessoes: {
          orderBy: { data: "desc" },
          take: 1,
          select: { data: true },
        },
      },
      orderBy: { nome: "asc" },
    });

    // Formatar resposta com última sessão
    const turmasFormatadas = turmas.map((turma) => ({
      ...turma,
      ultimaSessao: turma.sessoes[0]?.data || null,
      sessoes: undefined,
    }));

    return NextResponse.json(turmasFormatadas);
  } catch (error) {
    console.error("Erro ao listar turmas:", error);
    return NextResponse.json(
      { error: "Erro ao listar turmas" },
      { status: 500 }
    );
  }
}

// POST - Criar turma
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Buscar instrutor do usuário logado
    const instrutor = await prisma.instrutor.findUnique({
      where: { usuarioId: session.user.id },
    });

    if (!instrutor) {
      return NextResponse.json(
        { error: "Instrutor não encontrado" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const data = turmaSchema.parse(body);

    // Criar turma com alunos
    const turma = await prisma.turma.create({
      data: {
        nome: data.nome,
        descricao: data.descricao,
        instrutorId: instrutor.id,
        diaSemana: data.diaSemana,
        horario: data.horario,
        alunos: data.alunoIds?.length
          ? {
              create: data.alunoIds.map((alunoId) => ({
                alunoId,
              })),
            }
          : undefined,
      },
      include: {
        instrutor: { include: { usuario: true } },
        _count: { select: { alunos: true } },
      },
    });

    return NextResponse.json(turma, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar turma:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao criar turma" },
      { status: 500 }
    );
  }
}

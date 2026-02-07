import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const sessaoSchema = z.object({
  data: z.string().min(1, "Data é obrigatória"),
  descricao: z.string().optional(),
  registros: z.array(
    z.object({
      alunoId: z.string(),
      presenca: z.boolean().default(false),
      ausencia: z.boolean().default(false),
      justificativa: z.enum(["ENFERMIDADE", "TRABALHO", "VIAGEM", "OUTROS"]).optional(),
      anotacoes: z.string().optional(),
      conteudoAtribuido: z.string().optional(),
    })
  ).optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Listar sessões da turma
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar acesso à turma
    const turma = await prisma.turma.findUnique({
      where: { id },
      include: { instrutor: true },
    });

    if (!turma) {
      return NextResponse.json(
        { error: "Turma não encontrada" },
        { status: 404 }
      );
    }

    const isAdmin = session.user.role === "ADMIN";
    const isOwner = turma.instrutor.usuarioId === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const sessoes = await prisma.sessaoAula.findMany({
      where: { turmaId: id },
      include: {
        instrutor: { include: { usuario: true } },
        _count: {
          select: {
            registros: {
              where: { presenca: true },
            },
          },
        },
      },
      orderBy: { data: "desc" },
    });

    return NextResponse.json(sessoes);
  } catch (error) {
    console.error("Erro ao listar sessões:", error);
    return NextResponse.json(
      { error: "Erro ao listar sessões" },
      { status: 500 }
    );
  }
}

// POST - Criar sessão
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar acesso à turma
    const turma = await prisma.turma.findUnique({
      where: { id },
      include: { instrutor: true },
    });

    if (!turma) {
      return NextResponse.json(
        { error: "Turma não encontrada" },
        { status: 404 }
      );
    }

    const isAdmin = session.user.role === "ADMIN";
    const isOwner = turma.instrutor.usuarioId === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const body = await request.json();
    const data = sessaoSchema.parse(body);

    // Criar sessão com registros
    const sessao = await prisma.sessaoAula.create({
      data: {
        turmaId: id,
        data: new Date(data.data),
        descricao: data.descricao,
        instrutorId: turma.instrutorId,
        registros: data.registros?.length
          ? {
              create: data.registros.map((r) => ({
                alunoId: r.alunoId,
                presenca: r.presenca,
                ausencia: r.ausencia,
                justificativa: r.justificativa,
                anotacoes: r.anotacoes,
                conteudoAtribuido: r.conteudoAtribuido,
              })),
            }
          : undefined,
      },
      include: {
        instrutor: { include: { usuario: true } },
        registros: {
          include: {
            aluno: {
              include: {
                instrumento: true,
              },
            },
          },
        },
        turma: {
          include: {
            _count: {
              select: { alunos: { where: { ativo: true } } },
            },
          },
        },
      },
    });

    return NextResponse.json(sessao, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar sessão:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao criar sessão" },
      { status: 500 }
    );
  }
}

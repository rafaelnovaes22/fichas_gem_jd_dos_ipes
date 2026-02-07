import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const turmaUpdateSchema = z.object({
  nome: z.string().min(3).optional(),
  descricao: z.string().optional(),
  diaSemana: z.enum(["DOMINGO", "SEGUNDA", "TERCA", "QUARTA", "QUINTA", "SEXTA", "SABADO"]).optional(),
  horario: z.string().optional(),
  ativo: z.boolean().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Buscar turma por ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const turma = await prisma.turma.findUnique({
      where: { id },
      include: {
        instrutor: { include: { usuario: true } },
        alunos: {
          where: { ativo: true },
          include: {
            aluno: {
              include: {
                instrumento: true,
                fase: true,
                fichas: {
                  select: {
                    id: true,
                    tipoAula: true,
                    apto: true,
                    mediaFinal: true,
                  },
                },
              },
            },
          },
        },
        sessoes: {
          orderBy: { data: "desc" },
          take: 10,
          include: {
            _count: {
              select: {
                registros: {
                  where: { presenca: true },
                },
              },
            },
          },
        },
      },
    });

    if (!turma) {
      return NextResponse.json(
        { error: "Turma não encontrada" },
        { status: 404 }
      );
    }

    // Verificar permissão
    const isAdmin = session.user.role === "ADMIN";
    const isOwner = turma.instrutor.usuarioId === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    return NextResponse.json(turma);
  } catch (error) {
    console.error("Erro ao buscar turma:", error);
    return NextResponse.json(
      { error: "Erro ao buscar turma" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar turma
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

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

    // Verificar permissão
    const isAdmin = session.user.role === "ADMIN";
    const isOwner = turma.instrutor.usuarioId === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const body = await request.json();
    const data = turmaUpdateSchema.parse(body);

    const turmaAtualizada = await prisma.turma.update({
      where: { id },
      data,
      include: {
        instrutor: { include: { usuario: true } },
        _count: { select: { alunos: true } },
      },
    });

    return NextResponse.json(turmaAtualizada);
  } catch (error) {
    console.error("Erro ao atualizar turma:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao atualizar turma" },
      { status: 500 }
    );
  }
}

// DELETE - Soft-delete (desativar turma)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

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

    // Verificar permissão
    const isAdmin = session.user.role === "ADMIN";
    const isOwner = turma.instrutor.usuarioId === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    await prisma.turma.update({
      where: { id },
      data: { ativo: false },
    });

    return NextResponse.json({ message: "Turma desativada com sucesso" });
  } catch (error) {
    console.error("Erro ao desativar turma:", error);
    return NextResponse.json(
      { error: "Erro ao desativar turma" },
      { status: 500 }
    );
  }
}

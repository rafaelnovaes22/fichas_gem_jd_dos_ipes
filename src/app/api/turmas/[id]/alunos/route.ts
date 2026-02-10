import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isAdmin as checkIsAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const addAlunosSchema = z.object({
  alunoIds: z.array(z.string()).min(1, "Selecione pelo menos um aluno"),
});

const removeAlunoSchema = z.object({
  alunoId: z.string(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST - Adicionar alunos à turma
export async function POST(request: NextRequest, { params }: RouteParams) {
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
    const isAdmin = checkIsAdmin(session.user.role);
    const isOwner = turma.instrutor.usuarioId === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const body = await request.json();
    const data = addAlunosSchema.parse(body);

    // Criar registros de alunos na turma (ignorando duplicados)
    const created = await prisma.$transaction(
      data.alunoIds.map((alunoId) =>
        prisma.turmaAluno.upsert({
          where: {
            turmaId_alunoId: {
              turmaId: id,
              alunoId,
            },
          },
          update: { ativo: true },
          create: {
            turmaId: id,
            alunoId,
          },
        })
      )
    );

    return NextResponse.json(
      { message: `${created.length} aluno(s) adicionado(s)`, count: created.length },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao adicionar alunos:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao adicionar alunos" },
      { status: 500 }
    );
  }
}

// DELETE - Remover aluno da turma
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
    const isAdmin = checkIsAdmin(session.user.role);
    const isOwner = turma.instrutor.usuarioId === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const body = await request.json();
    const data = removeAlunoSchema.parse(body);

    // Soft-delete do aluno na turma
    await prisma.turmaAluno.update({
      where: {
        turmaId_alunoId: {
          turmaId: id,
          alunoId: data.alunoId,
        },
      },
      data: { ativo: false },
    });

    return NextResponse.json({ message: "Aluno removido da turma" });
  } catch (error) {
    console.error("Erro ao remover aluno:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao remover aluno" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isAdmin as checkIsAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const sessaoUpdateSchema = z.object({
  data: z.string().optional(),
  descricao: z.string().optional(),
  registros: z.array(
    z.object({
      id: z.string().optional(),
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
  params: Promise<{ id: string; sessaoId: string }>;
}

// GET - Buscar detalhes da sessão
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const { id, sessaoId } = await params;

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const sessao = await prisma.sessaoAula.findFirst({
      where: {
        id: sessaoId,
        turmaId: id,
      },
      include: {
        instrutor: { include: { usuario: true } },
        turma: {
          include: {
            instrutor: true,
          },
        },
        registros: {
          include: {
            aluno: {
              include: {
                instrumento: true,
                fase: true,
              },
            },
          },
          orderBy: {
            aluno: {
              nome: "asc",
            },
          },
        },
      },
    });

    if (!sessao) {
      return NextResponse.json(
        { error: "Sessão não encontrada" },
        { status: 404 }
      );
    }

    // Verificar permissão
    const isAdmin = checkIsAdmin(session.user.role);
    const isOwner = sessao.turma.instrutor.usuarioId === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    return NextResponse.json(sessao);
  } catch (error) {
    console.error("Erro ao buscar sessão:", error);
    return NextResponse.json(
      { error: "Erro ao buscar sessão" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar sessão
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const { id, sessaoId } = await params;

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const sessao = await prisma.sessaoAula.findFirst({
      where: {
        id: sessaoId,
        turmaId: id,
      },
      include: {
        turma: {
          include: { instrutor: true },
        },
      },
    });

    if (!sessao) {
      return NextResponse.json(
        { error: "Sessão não encontrada" },
        { status: 404 }
      );
    }

    // Verificar permissão
    const isAdmin = checkIsAdmin(session.user.role);
    const isOwner = sessao.turma.instrutor.usuarioId === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const body = await request.json();
    const data = sessaoUpdateSchema.parse(body);

    // Atualizar sessão e registros em transação
    const sessaoAtualizada = await prisma.$transaction(async (tx) => {
      // Atualizar dados da sessão
      const updated = await tx.sessaoAula.update({
        where: { id: sessaoId },
        data: {
          data: data.data ? new Date(data.data) : undefined,
          descricao: data.descricao,
        },
      });

      // Atualizar registros existentes ou criar novos
      if (data.registros) {
        for (const registro of data.registros) {
          if (registro.id) {
            // Atualizar registro existente
            await tx.sessaoAulaRegistro.update({
              where: { id: registro.id },
              data: {
                presenca: registro.presenca,
                ausencia: registro.ausencia,
                justificativa: registro.justificativa,
                anotacoes: registro.anotacoes,
                conteudoAtribuido: registro.conteudoAtribuido,
              },
            });
          } else {
            // Criar novo registro (upsert para evitar duplicados)
            await tx.sessaoAulaRegistro.upsert({
              where: {
                sessaoId_alunoId: {
                  sessaoId,
                  alunoId: registro.alunoId,
                },
              },
              update: {
                presenca: registro.presenca,
                ausencia: registro.ausencia,
                justificativa: registro.justificativa,
                anotacoes: registro.anotacoes,
                conteudoAtribuido: registro.conteudoAtribuido,
              },
              create: {
                sessaoId,
                alunoId: registro.alunoId,
                presenca: registro.presenca,
                ausencia: registro.ausencia,
                justificativa: registro.justificativa,
                anotacoes: registro.anotacoes,
                conteudoAtribuido: registro.conteudoAtribuido,
              },
            });
          }
        }
      }

      return updated;
    });

    // Retornar sessão atualizada com relacionamentos
    const sessaoCompletada = await prisma.sessaoAula.findUnique({
      where: { id: sessaoId },
      include: {
        instrutor: { include: { usuario: true } },
        registros: {
          include: {
            aluno: {
              include: {
                instrumento: true,
                fase: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(sessaoCompletada);
  } catch (error) {
    console.error("Erro ao atualizar sessão:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao atualizar sessão" },
      { status: 500 }
    );
  }
}

// DELETE - Excluir sessão
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const { id, sessaoId } = await params;

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const sessao = await prisma.sessaoAula.findFirst({
      where: {
        id: sessaoId,
        turmaId: id,
      },
      include: {
        turma: {
          include: { instrutor: true },
        },
      },
    });

    if (!sessao) {
      return NextResponse.json(
        { error: "Sessão não encontrada" },
        { status: 404 }
      );
    }

    // Verificar permissão
    const isAdmin = checkIsAdmin(session.user.role);
    const isOwner = sessao.turma.instrutor.usuarioId === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    // Excluir sessão (cascata exclui registros)
    await prisma.sessaoAula.delete({
      where: { id: sessaoId },
    });

    return NextResponse.json({ message: "Sessão excluída com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir sessão:", error);
    return NextResponse.json(
      { error: "Erro ao excluir sessão" },
      { status: 500 }
    );
  }
}

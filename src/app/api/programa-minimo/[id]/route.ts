import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const programaMinimoUpdateSchema = z.object({
  nivel: z.enum(["RJM", "CULTO", "OFICIALIZACAO"]).optional(),
  itens: z.array(
    z.object({
      id: z.string().optional(),
      tipo: z.enum(["METODO_INSTRUMENTO", "TEORIA", "SOLFEJO", "HINARIO"]),
      descricao: z.string().min(1, "Descrição é obrigatória"),
      alternativas: z.string().optional(),
      obrigatorio: z.boolean().default(true),
      ordem: z.number().default(0),
    })
  ).optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Buscar programa mínimo por ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;

    const programa = await prisma.programaMinimo.findUnique({
      where: { id },
      include: {
        instrumento: true,
        itens: {
          orderBy: { ordem: "asc" },
        },
      },
    });

    if (!programa) {
      return NextResponse.json(
        { error: "Programa mínimo não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(programa);
  } catch (error) {
    console.error("Erro ao buscar programa mínimo:", error);
    return NextResponse.json(
      { error: "Erro ao buscar programa mínimo" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar programa mínimo (apenas admin)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const { id } = await params;

    const programa = await prisma.programaMinimo.findUnique({
      where: { id },
    });

    if (!programa) {
      return NextResponse.json(
        { error: "Programa mínimo não encontrado" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const data = programaMinimoUpdateSchema.parse(body);

    // Atualizar em transação
    const programaAtualizado = await prisma.$transaction(async (tx) => {
      // Atualizar nível se fornecido
      if (data.nivel) {
        await tx.programaMinimo.update({
          where: { id },
          data: { nivel: data.nivel },
        });
      }

      // Atualizar itens se fornecidos
      if (data.itens) {
        for (const item of data.itens) {
          if (item.id) {
            // Atualizar item existente
            await tx.programaMinimoItem.update({
              where: { id: item.id },
              data: {
                tipo: item.tipo,
                descricao: item.descricao,
                alternativas: item.alternativas,
                obrigatorio: item.obrigatorio,
                ordem: item.ordem,
              },
            });
          } else {
            // Criar novo item
            await tx.programaMinimoItem.create({
              data: {
                programaMinimoId: id,
                tipo: item.tipo,
                descricao: item.descricao,
                alternativas: item.alternativas,
                obrigatorio: item.obrigatorio,
                ordem: item.ordem,
              },
            });
          }
        }
      }

      // Retornar programa atualizado
      return tx.programaMinimo.findUnique({
        where: { id },
        include: {
          instrumento: true,
          itens: {
            orderBy: { ordem: "asc" },
          },
        },
      });
    });

    return NextResponse.json(programaAtualizado);
  } catch (error) {
    console.error("Erro ao atualizar programa mínimo:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao atualizar programa mínimo" },
      { status: 500 }
    );
  }
}

// DELETE - Excluir programa mínimo (apenas admin)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const { id } = await params;

    const programa = await prisma.programaMinimo.findUnique({
      where: { id },
    });

    if (!programa) {
      return NextResponse.json(
        { error: "Programa mínimo não encontrado" },
        { status: 404 }
      );
    }

    // Excluir programa (cascata exclui itens)
    await prisma.programaMinimo.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Programa mínimo excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir programa mínimo:", error);
    return NextResponse.json(
      { error: "Erro ao excluir programa mínimo" },
      { status: 500 }
    );
  }
}

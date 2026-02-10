import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const programaMinimoSchema = z.object({
  instrumentoId: z.string().min(1, "Instrumento é obrigatório"),
  nivel: z.enum(["RJM", "CULTO", "OFICIALIZACAO"]),
  itens: z.array(
    z.object({
      tipo: z.enum(["METODO_INSTRUMENTO", "TEORIA", "SOLFEJO", "HINARIO"]),
      descricao: z.string().min(1, "Descrição é obrigatória"),
      alternativas: z.string().optional(),
      obrigatorio: z.boolean().default(true),
      ordem: z.number().default(0),
    })
  ).optional(),
});

// GET - Listar programas mínimos
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const instrumentoId = searchParams.get("instrumentoId");
    const nivel = searchParams.get("nivel");

    const programas = await prisma.programaMinimo.findMany({
      where: {
        ...(instrumentoId && { instrumentoId }),
        ...(nivel && { nivel: nivel as any }),
      },
      include: {
        instrumento: true,
        itens: {
          orderBy: { ordem: "asc" },
        },
      },
      orderBy: [
        { instrumento: { nome: "asc" } },
        { nivel: "asc" },
      ],
    });

    return NextResponse.json(programas);
  } catch (error) {
    console.error("Erro ao listar programas mínimos:", error);
    return NextResponse.json(
      { error: "Erro ao listar programas mínimos" },
      { status: 500 }
    );
  }
}

// POST - Criar programa mínimo (apenas admin)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isAdmin(session.user.role)) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const body = await request.json();
    const data = programaMinimoSchema.parse(body);

    // Verificar se já existe programa para este instrumento/nível
    const existente = await prisma.programaMinimo.findUnique({
      where: {
        instrumentoId_nivel: {
          instrumentoId: data.instrumentoId,
          nivel: data.nivel,
        },
      },
    });

    if (existente) {
      return NextResponse.json(
        { error: "Já existe programa mínimo para este instrumento e nível" },
        { status: 409 }
      );
    }

    const programa = await prisma.programaMinimo.create({
      data: {
        instrumentoId: data.instrumentoId,
        nivel: data.nivel,
        itens: data.itens?.length
          ? {
            create: data.itens.map((item) => ({
              tipo: item.tipo,
              descricao: item.descricao,
              alternativas: item.alternativas,
              obrigatorio: item.obrigatorio,
              ordem: item.ordem,
            })),
          }
          : undefined,
      },
      include: {
        instrumento: true,
        itens: {
          orderBy: { ordem: "asc" },
        },
      },
    });

    return NextResponse.json(programa, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar programa mínimo:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao criar programa mínimo" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TipoAula } from "@prisma/client";

interface RouteParams {
  params: Promise<{ id: string; sessaoId: string }>;
}

// POST - Sincronizar sessão com fichas M11
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const { id, sessaoId } = await params;

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Buscar sessão com turma e registros
    const sessao = await prisma.sessaoAula.findFirst({
      where: {
        id: sessaoId,
        turmaId: id,
      },
      include: {
        turma: {
          include: { instrutor: true },
        },
        registros: {
          include: {
            aluno: {
              include: {
                fichas: {
                  where: {
                    apto: null, // Fichas em andamento
                  },
                  include: {
                    aulas: {
                      orderBy: { numeroAula: "asc" },
                    },
                  },
                },
              },
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
    const isAdmin = session.user.role === "ADMIN";
    const isOwner = sessao.turma.instrutor.usuarioId === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const sincronizados: Array<{
      alunoId: string;
      alunoNome: string;
      fichaId: string;
      aulaNumero: number;
      sucesso: boolean;
      erro?: string;
    }> = [];

    // Para cada registro de aluno na sessão
    for (const registro of sessao.registros) {
      // Pular se já sincronizado
      if (registro.sincronizadoFicha) {
        continue;
      }

      // Buscar ficha ativa do aluno (Teoria ou Prática)
      const fichasAtivas = registro.aluno.fichas;

      if (fichasAtivas.length === 0) {
        sincronizados.push({
          alunoId: registro.alunoId,
          alunoNome: registro.aluno.nome,
          fichaId: "",
          aulaNumero: 0,
          sucesso: false,
          erro: "Nenhuma ficha ativa encontrada",
        });
        continue;
      }

      // Usar a primeira ficha ativa (preferencialmente PRATICA_INSTRUMENTO)
      const ficha = fichasAtivas.find(
        (f) => f.tipoAula === TipoAula.PRATICA_INSTRUMENTO
      ) || fichasAtivas[0];

      // Encontrar próxima aula vaga
      const aulasPreenchidas = ficha.aulas.length;
      const proximaAulaNumero = aulasPreenchidas + 1;

      if (proximaAulaNumero > 20) {
        sincronizados.push({
          alunoId: registro.alunoId,
          alunoNome: registro.aluno.nome,
          fichaId: ficha.id,
          aulaNumero: 0,
          sucesso: false,
          erro: "Ficha já completa (20 aulas)",
        });
        continue;
      }

      try {
        // Criar registro de aula na ficha
        await prisma.aulaRegistro.create({
          data: {
            fichaId: ficha.id,
            numeroAula: proximaAulaNumero,
            data: sessao.data,
            anotacoes: registro.anotacoes,
            presenca: registro.presenca,
            ausencia: registro.ausencia,
            justificativa: registro.justificativa,
            instrutorId: sessao.instrutorId,
            vistoInstrutor: true,
          },
        });

        // Marcar como sincronizado
        await prisma.sessaoAulaRegistro.update({
          where: { id: registro.id },
          data: { sincronizadoFicha: true },
        });

        sincronizados.push({
          alunoId: registro.alunoId,
          alunoNome: registro.aluno.nome,
          fichaId: ficha.id,
          aulaNumero: proximaAulaNumero,
          sucesso: true,
        });
      } catch (error) {
        sincronizados.push({
          alunoId: registro.alunoId,
          alunoNome: registro.aluno.nome,
          fichaId: ficha.id,
          aulaNumero: proximaAulaNumero,
          sucesso: false,
          erro: error instanceof Error ? error.message : "Erro desconhecido",
        });
      }
    }

    const sucessos = sincronizados.filter((s) => s.sucesso).length;
    const falhas = sincronizados.filter((s) => !s.sucesso).length;

    return NextResponse.json({
      message: `Sincronização concluída: ${sucessos} sucesso(s), ${falhas} falha(s)`,
      total: sincronizados.length,
      sucessos,
      falhas,
      detalhes: sincronizados,
    });
  } catch (error) {
    console.error("Erro ao sincronizar sessão:", error);
    return NextResponse.json(
      { error: "Erro ao sincronizar sessão com fichas" },
      { status: 500 }
    );
  }
}

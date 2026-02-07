import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Users, Calendar, Clock, BookOpen } from "lucide-react";
import { diaSemanaLabel } from "@/lib/utils";

const diaSemanaOrder = [
  "DOMINGO",
  "SEGUNDA",
  "TERCA",
  "QUARTA",
  "QUINTA",
  "SEXTA",
  "SABADO",
];

export default async function AulasPage() {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === "ADMIN";

  // Buscar instrutor do usuário logado
  const instrutor = await prisma.instrutor.findUnique({
    where: { usuarioId: session?.user?.id },
  });

  // Buscar turmas
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
    orderBy: [{ diaSemana: "asc" }, { nome: "asc" }],
  });

  // Estatísticas
  const totalTurmas = turmas.length;
  const totalAlunos = turmas.reduce((acc, t) => acc + t._count.alunos, 0);

  // Sessões deste mês
  const hoje = new Date();
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

  const sessoesEsteMes = await prisma.sessaoAula.count({
    where: {
      turma: isAdmin ? { ativo: true } : { instrutorId: instrutor?.id },
      data: {
        gte: inicioMes,
        lte: fimMes,
      },
    },
  });

  // Próxima aula (próxima sessão agendada ou turma com dia da semana)
  const proximaAula = turmas.find((t) => t.diaSemana) || null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Aulas</h1>
          <p className="text-gray-500">
            Gerencie suas turmas e sessões de aula
          </p>
        </div>
        <Link href="/dashboard/aulas/turmas/nova">
          <Button className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Nova Turma
          </Button>
        </Link>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Turmas Ativas</p>
                <p className="text-xl font-bold text-gray-900">{totalTurmas}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total de Alunos</p>
                <p className="text-xl font-bold text-gray-900">{totalAlunos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Sessões (Mês)</p>
                <p className="text-xl font-bold text-gray-900">
                  {sessoesEsteMes}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Próxima Aula</p>
                <p className="text-sm font-medium text-gray-900 truncate">
                  {proximaAula
                    ? diaSemanaLabel(proximaAula.diaSemana)
                    : "Não agendada"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Programa Mínimo Link */}
      <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-100">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  Programa Mínimo para Músicos
                </p>
                <p className="text-sm text-gray-500">
                  Consulte os requisitos por instrumento e nível
                </p>
              </div>
            </div>
            <Link href="/dashboard/aulas/programa-minimo">
              <Button variant="outline" size="sm">
                Ver Requisitos
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Grid de Turmas */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Minhas Turmas
        </h2>

        {turmas.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500 mb-4">
                Você ainda não tem turmas cadastradas.
              </p>
              <Link href="/dashboard/aulas/turmas/nova">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar primeira turma
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {turmas.map((turma) => (
              <Card
                key={turma.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span className="truncate">{turma.nome}</span>
                    <span className="text-xs font-normal px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                      {turma._count.alunos} aluno
                      {turma._count.alunos !== 1 ? "s" : ""}
                    </span>
                  </CardTitle>
                  {turma.descricao && (
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {turma.descricao}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 mb-4">
                    {turma.diaSemana && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {diaSemanaLabel(turma.diaSemana)}
                          {turma.horario && ` às ${turma.horario}`}
                        </span>
                      </div>
                    )}
                    {turma.sessoes[0]?.data && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>
                          Última aula:{" "}
                          {new Date(turma.sessoes[0].data).toLocaleDateString(
                            "pt-BR"
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/dashboard/aulas/turmas/${turma.id}/sessao`}
                      className="flex-1"
                    >
                      <Button variant="default" size="sm" className="w-full">
                        Registrar Aula
                      </Button>
                    </Link>
                    <Link
                      href={`/dashboard/aulas/turmas/${turma.id}`}
                      className="flex-1"
                    >
                      <Button variant="outline" size="sm" className="w-full">
                        Detalhes
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

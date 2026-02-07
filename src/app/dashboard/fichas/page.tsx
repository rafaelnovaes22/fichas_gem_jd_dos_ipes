import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { FichasList } from "./fichas-list";

export default async function FichasPage() {
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === "ADMIN";

    const fichas = await prisma.fichaAcompanhamento.findMany({
        where: isAdmin
            ? {}
            : { aluno: { instrutor: { usuarioId: session?.user?.id } } },
        include: {
            aluno: {
                include: {
                    instrutor: { include: { usuario: true } },
                    instrumento: true,
                    fase: true,
                },
            },
            aulas: { select: { presenca: true } },
            avaliacoes: { select: { nota: true } },
        },
        orderBy: { updatedAt: "desc" },
    });

    // Agrupar fichas por aluno
    const alunoMap = new Map<
        string,
        {
            alunoId: string;
            nome: string;
            instrumento: string;
            fase: string;
            congregacao: string;
            fichas: {
                id: string;
                tipoAula: string;
                apto: boolean | null;
                aulasRealizadas: number;
                avaliacoesRealizadas: number;
            }[];
        }
    >();

    for (const ficha of fichas) {
        const key = ficha.alunoId;
        if (!alunoMap.has(key)) {
            alunoMap.set(key, {
                alunoId: ficha.alunoId,
                nome: ficha.aluno.nome,
                instrumento: ficha.aluno.instrumento.nome,
                fase: ficha.aluno.fase.nome,
                congregacao: ficha.aluno.congregacao,
                fichas: [],
            });
        }
        alunoMap.get(key)!.fichas.push({
            id: ficha.id,
            tipoAula: ficha.tipoAula,
            apto: ficha.apto,
            aulasRealizadas: ficha.aulas.filter((a) => a.presenca).length,
            avaliacoesRealizadas: ficha.avaliacoes.filter((a) => a.nota !== null).length,
        });
    }

    const alunosAgrupados = Array.from(alunoMap.values());

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Fichas de Acompanhamento</h1>
                    <p className="text-gray-500">
                        {alunosAgrupados.length} aluno{alunosAgrupados.length !== 1 ? "s" : ""} • {fichas.length} ficha{fichas.length !== 1 ? "s" : ""}
                    </p>
                </div>
            </div>

            {fichas.length === 0 ? (
                <>
                    <Card>
                        <CardContent className="py-12 text-center">
                            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 mb-4">Nenhuma ficha encontrada.</p>
                            <Link href="/dashboard/alunos">
                                <Button variant="outline">Ver Alunos</Button>
                            </Link>
                        </CardContent>
                    </Card>
                </>
            ) : (
                <FichasList alunosAgrupados={alunosAgrupados} />
            )}
        </div>
    );
}

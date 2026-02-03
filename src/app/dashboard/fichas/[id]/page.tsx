import { notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Printer, Save } from "lucide-react";
import { FichaForm } from "./ficha-form";

interface FichaPageProps {
    params: Promise<{ id: string }>;
}

export default async function FichaPage({ params }: FichaPageProps) {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    const ficha = await prisma.fichaAcompanhamento.findUnique({
        where: { id },
        include: {
            aluno: {
                include: {
                    instrutor: { include: { usuario: true } },
                    instrumento: true,
                    fase: true,
                },
            },
            aulas: {
                orderBy: { numeroAula: "asc" },
                include: { instrutor: { include: { usuario: true } } },
            },
            avaliacoes: {
                orderBy: { numeroAvaliacao: "asc" },
                include: { instrutor: { include: { usuario: true } } },
            },
        },
    });

    if (!ficha) {
        notFound();
    }

    // Verificar permissão
    const isAdmin = session?.user?.role === "ADMIN";
    if (!isAdmin && ficha.aluno.instrutor.usuarioId !== session?.user?.id) {
        notFound();
    }

    const tipoAulaLabel = {
        TEORIA_MUSICAL: "Teoria Musical",
        SOLFEJO: "Solfejo",
        PRATICA_INSTRUMENTO: "Prática de Instrumento",
        HINARIO: "Hinário",
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={`/dashboard/alunos/${ficha.aluno.id}`}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Ficha de Acompanhamento
                        </h1>
                        <p className="text-gray-500">
                            {ficha.aluno.nome} • {tipoAulaLabel[ficha.tipoAula]}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Printer className="w-4 h-4 mr-2" />
                        Imprimir PDF
                    </Button>
                </div>
            </div>

            {/* Cabeçalho da Ficha */}
            <Card>
                <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                                <span className="text-2xl font-bold text-blue-600">♪</span>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Congregação Cristã no Brasil</p>
                                <h2 className="text-xl font-bold">FICHA DE ACOMPANHAMENTO - GEM</h2>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Formulário M11</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="md:col-span-2">
                            <p className="text-sm text-gray-500">ALUNO</p>
                            <p className="font-semibold text-lg">{ficha.aluno.nome}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">INSTRUMENTO</p>
                            <p className="font-semibold text-lg">{ficha.aluno.instrumento.nome}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">FASE</p>
                            <p className="font-semibold text-lg">{ficha.aluno.fase.nome}</p>
                        </div>
                        {ficha.nivel && (
                            <div>
                                <p className="text-sm text-gray-500">NÍVEL</p>
                                <p className="font-semibold">{ficha.nivel}</p>
                            </div>
                        )}
                        {ficha.livro && (
                            <div>
                                <p className="text-sm text-gray-500">LIVRO/MÉTODO</p>
                                <p className="font-semibold">{ficha.livro}</p>
                            </div>
                        )}
                    </div>

                    {/* Autorização LGPD */}
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600 italic">
                        &ldquo;Autorizo a Congregação Cristã no Brasil – CCB a tratar meus dados pessoais,
                        inclusive sensíveis, para a gestão da Música, os quais não serão divulgados a terceiros&rdquo;.
                    </div>

                    {/* Tipo de Aula (Checkboxes) */}
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={ficha.tipoAula === "SOLFEJO"}
                                readOnly
                                className="h-4 w-4"
                            />
                            <span className="text-sm font-medium">SOLFEJO</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={ficha.tipoAula === "TEORIA_MUSICAL"}
                                readOnly
                                className="h-4 w-4"
                            />
                            <span className="text-sm font-medium">TEORIA MUSICAL</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={ficha.tipoAula === "PRATICA_INSTRUMENTO"}
                                readOnly
                                className="h-4 w-4"
                            />
                            <span className="text-sm font-medium">PRÁTICA INSTRUMENTO</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={ficha.tipoAula === "HINARIO"}
                                readOnly
                                className="h-4 w-4"
                            />
                            <span className="text-sm font-medium">HINÁRIO</span>
                        </label>
                    </div>
                </CardContent>
            </Card>

            {/* Formulário de Aulas e Avaliações */}
            <FichaForm
                fichaId={ficha.id}
                aulas={ficha.aulas}
                avaliacoes={ficha.avaliacoes}
                mediaFinal={ficha.mediaFinal}
                apto={ficha.apto}
                encarregadoLocal={ficha.encarregadoLocal}
                instrutorId={session?.user?.instrutorId || ""}
                tipoAula={ficha.tipoAula}
                nivel={ficha.nivel}
                livro={ficha.livro}
            />
        </div>
    );
}

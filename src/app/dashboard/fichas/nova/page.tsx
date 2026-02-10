import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { NovaFichaForm } from "./form";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface PageProps {
    searchParams: Promise<{ alunoId?: string }>;
}

export default async function NovaFichaPage({ searchParams }: PageProps) {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/dashboard");

    const params = await searchParams;
    const alunoId = params.alunoId;

    if (!alunoId) {
        return (
            <div className="p-6">
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-red-500">Erro: Aluno não especificado.</p>
                        <Link href="/dashboard/alunos">
                            <Button variant="outline" className="mt-4">
                                Voltar para Alunos
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const aluno = await prisma.aluno.findUnique({
        where: { id: alunoId },
    });

    if (!aluno) {
        return (
            <div className="p-6">
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-red-500">Erro: Aluno não encontrado.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <BackButton />
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Nova Ficha</h1>
                    <p className="text-gray-500">
                        Criando ficha para {aluno.nome}
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Dados da Ficha</CardTitle>
                </CardHeader>
                <CardContent>
                    <NovaFichaForm alunoId={alunoId} />
                </CardContent>
            </Card>
        </div>
    );
}

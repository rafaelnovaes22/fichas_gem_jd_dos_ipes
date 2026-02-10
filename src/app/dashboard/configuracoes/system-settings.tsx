
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Layers, Music, BookOpen } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export function SystemSettings() {
    const handleBackup = async () => {
        try {
            const res = await fetch("/api/system/backup");
            if (!res.ok) throw new Error("Falha ao gerar backup");

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `backup-ggem-${new Date().toISOString().split("T")[0]}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success("Backup gerado com sucesso!");
        } catch (error) {
            console.error(error);
            toast.error("Erro ao gerar backup do sistema");
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Download className="w-5 h-5" />
                            Backup do Sistema
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-500 mb-4">
                            Exporte todos os dados do sistema (Usuários, Alunos, Fichas,
                            Turmas) em formato JSON para segurança.
                        </p>
                        <Button onClick={handleBackup} variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            Realizar Backup Completo
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <div>
                <h3 className="text-lg font-medium mb-4">Atalhos de Gerenciamento</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link href="/dashboard/instrumentos">
                        <Card className="hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer h-full">
                            <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                    <Music className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-medium">Instrumentos</h4>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Gerenciar lista de instrumentos
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/dashboard/aulas/fases">
                        <Card className="hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer h-full">
                            <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                    <Layers className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-medium">Fases e Tópicos</h4>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Gerenciar fases do MSA
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/dashboard/aulas/programa-minimo">
                        <Card className="hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer h-full">
                            <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                    <BookOpen className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-medium">Programa Mínimo</h4>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Visualizar requisitos
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            </div>
        </div>
    );
}

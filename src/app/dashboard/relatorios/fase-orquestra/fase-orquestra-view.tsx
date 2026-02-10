"use client";

import { useState } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, Music, Info, User } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";

// Tipos de dados processados
interface AlunoResumo {
    id: string;
    nome: string;
    instrutorNome: string;
}

interface InstrumentoGroup {
    nome: string;
    alunos: AlunoResumo[];
}

interface CategoriaGroup {
    nome: string;
    instrumentos: InstrumentoGroup[];
    totalAlunos: number;
}

export interface FaseGroup {
    fase: string; // Enum Key
    label: string; // Human Readable
    categorias: CategoriaGroup[];
    totalAlunos: number;
}

interface FaseOrquestraViewProps {
    data: FaseGroup[];
}

export function FaseOrquestraView({ data }: FaseOrquestraViewProps) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <BackButton />
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Relatório: Fases da Orquestra
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Alunos agrupados por fase, categoria e instrumento
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {data.map((fase) => (
                    <Dialog key={fase.fase}>
                        <DialogTrigger asChild>
                            <Card className="cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-blue-500 hover:border-l-blue-600 group">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                                            {fase.label}
                                        </CardTitle>
                                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                            {fase.totalAlunos}
                                        </Badge>
                                    </div>
                                    <CardDescription>
                                        {fase.categorias.length} categorias • {fase.categorias.reduce((acc, cat) => acc + cat.instrumentos.length, 0)} instrumentos
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 mt-2">
                                        {fase.categorias.slice(0, 3).map(cat => (
                                            <div key={cat.nome} className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                                <span>{cat.nome}</span>
                                                <span className="font-medium">{cat.totalAlunos}</span>
                                            </div>
                                        ))}
                                        {fase.categorias.length > 3 && (
                                            <p className="text-xs text-blue-500 mt-2 font-medium">
                                                + {fase.categorias.length - 3} categorias
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </DialogTrigger>

                        <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
                            <DialogHeader>
                                <DialogTitle className="text-2xl flex items-center gap-2">
                                    <Music className="w-6 h-6 text-blue-500" />
                                    {fase.label}
                                    <Badge className="ml-2 bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300">
                                        {fase.totalAlunos} Alunos
                                    </Badge>
                                </DialogTitle>
                            </DialogHeader>

                            <ScrollArea className="flex-1 pr-4 mt-4">
                                <div className="space-y-6">
                                    {fase.categorias.map((categoria) => (
                                        <div key={categoria.nome} className="border rounded-lg p-4 bg-gray-50/50 dark:bg-zinc-900/50">
                                            <h3 className="font-semibold text-lg mb-3 flex items-center justify-between text-gray-800 dark:text-gray-200 border-b pb-2">
                                                {categoria.nome}
                                                <span className="text-sm font-normal text-gray-500">
                                                    {categoria.totalAlunos} alunos
                                                </span>
                                            </h3>

                                            <Accordion type="multiple" className="w-full">
                                                {categoria.instrumentos.map((inst) => (
                                                    <AccordionItem key={inst.nome} value={inst.nome} className="border-b-0">
                                                        <AccordionTrigger className="hover:no-underline py-2 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                                                            <div className="flex items-center gap-3">
                                                                <span className="font-medium">{inst.nome}</span>
                                                                <Badge variant="outline" className="text-xs font-normal">
                                                                    {inst.alunos.length}
                                                                </Badge>
                                                            </div>
                                                        </AccordionTrigger>
                                                        <AccordionContent className="pt-2 pb-4 -ml-4 pl-4">
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-4">
                                                                {inst.alunos.map(aluno => (
                                                                    <div key={aluno.id} className="flex items-center gap-2 p-2 rounded bg-white dark:bg-zinc-950 border text-sm">
                                                                        <div className="bg-gray-100 dark:bg-zinc-800 p-1.5 rounded-full">
                                                                            <User className="w-3.5 h-3.5 text-gray-500" />
                                                                        </div>
                                                                        <div className="min-w-0">
                                                                            <p className="font-medium truncate">{aluno.nome}</p>
                                                                            <p className="text-xs text-gray-500 truncate">Instr: {aluno.instrutorNome}</p>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </AccordionContent>
                                                    </AccordionItem>
                                                ))}
                                            </Accordion>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </DialogContent>
                    </Dialog>
                ))}
            </div>
        </div>
    );
}

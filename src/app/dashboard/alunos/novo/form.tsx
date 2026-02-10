"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";

const faseOrquestraOptions = [
    { value: "ESTUDANDO", label: "Estudando (Iniciante)" },
    { value: "ENSAIO_LOCAL", label: "Ensaio (GEM)" },
    { value: "ENSAIO", label: "Ensaio" },
    { value: "RJM", label: "RJM" },
    { value: "CULTO", label: "Culto" },
    { value: "TROCA_INSTRUMENTO_CULTO", label: "Troca de Instrumento - Culto" },
    { value: "TROCA_INSTRUMENTO_OFICIALIZACAO", label: "Troca de Instrumento - Oficialização" },
    { value: "OFICIALIZACAO", label: "Oficialização" },
    { value: "OFICIALIZADO", label: "Oficializado" },
] as const;

const CONGREGACAO_FIXA = "Jardim dos Ipês";

const alunoSchema = z.object({
    nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    dataNascimento: z.string().optional(),
    telefone: z.string().optional(),
    email: z.string().email("Email inválido").optional().or(z.literal("")),
    congregacao: z.string().default(CONGREGACAO_FIXA).optional(),
    instrumentoId: z.string().min(1, "Selecione um instrumento"),
    faseId: z.string().min(1, "Selecione uma fase"),
    faseOrquestra: z.enum(["ESTUDANDO", "ENSAIO_LOCAL", "ENSAIO", "RJM", "CULTO", "TROCA_INSTRUMENTO_CULTO", "TROCA_INSTRUMENTO_OFICIALIZACAO", "OFICIALIZACAO", "OFICIALIZADO"]),
    instrutor2Id: z.string().optional(),
    autorizacaoDados: z.boolean(),
});

type AlunoFormData = z.infer<typeof alunoSchema>;

interface NovoAlunoFormProps {
    instrumentos: { id: string; nome: string; categoria: string }[];
    fases: { id: string; nome: string }[];
    instrutores: { id: string; usuario: { nome: string } }[];
}

export function NovoAlunoForm({ instrumentos, fases, instrutores }: NovoAlunoFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<AlunoFormData>({
        resolver: zodResolver(alunoSchema),
        defaultValues: {
            nome: "",
            dataNascimento: "",
            telefone: "",
            email: "",
            congregacao: CONGREGACAO_FIXA,
            instrumentoId: "",
            faseId: "",
            faseOrquestra: "ESTUDANDO",
            instrutor2Id: "",
            autorizacaoDados: false,
        },
    });

    const onSubmit = async (data: AlunoFormData) => {
        setLoading(true);
        setError("");

        // Garantir que a congregação seja sempre a fixa
        const payload = {
            ...data,
            congregacao: CONGREGACAO_FIXA,
        };

        try {
            const response = await fetch("/api/alunos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || "Erro ao cadastrar aluno");
            }

            router.push("/dashboard/alunos");
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao cadastrar aluno");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            {/* Header */}
            {/* Header */}
            <div className="flex items-center gap-4">
                <BackButton />
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Novo Aluno</h1>
                    <p className="text-gray-500 dark:text-gray-400">Cadastre um novo aluno no sistema</p>
                </div>
            </div>

            {/* Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Dados do Aluno</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {error && (
                            <div className="p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800">
                                {error}
                            </div>
                        )}

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="md:col-span-2 space-y-2">
                                <Label htmlFor="nome">Nome Completo *</Label>
                                <Input
                                    id="nome"
                                    {...register("nome")}
                                    placeholder="Nome do aluno"
                                />
                                {errors.nome && (
                                    <p className="text-sm text-red-500">{errors.nome.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                                <Input
                                    id="dataNascimento"
                                    type="date"
                                    {...register("dataNascimento")}
                                    className="dark:invert-0 dark:[color-scheme:dark]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="telefone">Telefone</Label>
                                <Input
                                    id="telefone"
                                    {...register("telefone")}
                                    placeholder="(11) 99999-0000"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    {...register("email")}
                                    placeholder="email@exemplo.com"
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-500">{errors.email.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Congregação</Label>
                                <div className="h-10 px-3 py-2 border rounded-md bg-gray-50 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 flex items-center border-input">
                                    {CONGREGACAO_FIXA}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="instrumentoId">Instrumento *</Label>
                                <select
                                    id="instrumentoId"
                                    {...register("instrumentoId")}
                                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                                >
                                    <option value="">Selecione...</option>
                                    {instrumentos.map((inst) => (
                                        <option key={inst.id} value={inst.id}>
                                            {inst.nome} ({inst.categoria})
                                        </option>
                                    ))}
                                </select>
                                {errors.instrumentoId && (
                                    <p className="text-sm text-red-500">{errors.instrumentoId.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="faseId">Fase MSA *</Label>
                                <select
                                    id="faseId"
                                    {...register("faseId")}
                                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                                >
                                    <option value="">Selecione...</option>
                                    {fases.map((fase) => (
                                        <option key={fase.id} value={fase.id}>
                                            {fase.nome}
                                        </option>
                                    ))}
                                </select>
                                {errors.faseId && (
                                    <p className="text-sm text-red-500">{errors.faseId.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="faseOrquestra">Fase na Orquestra *</Label>
                                <select
                                    id="faseOrquestra"
                                    {...register("faseOrquestra")}
                                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                                >
                                    {faseOrquestraOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.faseOrquestra && (
                                    <p className="text-sm text-red-500">{errors.faseOrquestra.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="instrutor2Id">2º Instrutor (Opcional)</Label>
                                <select
                                    id="instrutor2Id"
                                    {...register("instrutor2Id")}
                                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                                >
                                    <option value="">Selecione...</option>
                                    {instrutores.map((inst) => (
                                        <option key={inst.id} value={inst.id}>
                                            {inst.usuario.nome.split(" ")[0]} ({inst.usuario.nome})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="autorizacaoDados"
                                {...register("autorizacaoDados")}
                                className="h-4 w-4 rounded border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-600 dark:focus:ring-offset-zinc-900"
                            />
                            <Label htmlFor="autorizacaoDados" className="text-sm font-normal text-gray-700 dark:text-gray-300">
                                Autorizo a Congregação Cristã no Brasil – CCB a tratar meus dados pessoais, inclusive sensíveis, para a gestão da Música, os quais não serão divulgados a terceiros.
                            </Label>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Link href="/dashboard/alunos" className="flex-1">
                                <Button type="button" variant="outline" className="w-full">
                                    Cancelar
                                </Button>
                            </Link>
                            <Button type="submit" className="flex-1" disabled={loading}>
                                {loading ? "Salvando..." : "Cadastrar Aluno"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

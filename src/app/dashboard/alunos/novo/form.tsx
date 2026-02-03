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

const alunoSchema = z.object({
    nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    dataNascimento: z.string().optional(),
    telefone: z.string().optional(),
    email: z.string().email("Email inválido").optional().or(z.literal("")),
    congregacao: z.string().min(1, "Congregação é obrigatória"),
    instrumentoId: z.string().min(1, "Selecione um instrumento"),
    faseId: z.string().min(1, "Selecione uma fase"),
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
            congregacao: "",
            instrumentoId: "",
            faseId: "",
            instrutor2Id: "",
            autorizacaoDados: false,
        },
    });

    const onSubmit = async (data: AlunoFormData) => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/alunos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
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
            <div className="flex items-center gap-4">
                <Link href="/dashboard/alunos">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Novo Aluno</h1>
                    <p className="text-gray-500">Cadastre um novo aluno no sistema</p>
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
                            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
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
                                <Label htmlFor="congregacao">Congregação *</Label>
                                <Input
                                    id="congregacao"
                                    {...register("congregacao")}
                                    placeholder="Nome da congregação"
                                />
                                {errors.congregacao && (
                                    <p className="text-sm text-red-500">{errors.congregacao.message}</p>
                                )}
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
                                <Label htmlFor="faseId">Fase *</Label>
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
                                className="h-4 w-4 rounded border-gray-300"
                            />
                            <Label htmlFor="autorizacaoDados" className="text-sm font-normal">
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

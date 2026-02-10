"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BackButton } from "@/components/ui/back-button";
import { ArrowLeft } from "lucide-react";

const CONGREGACAO_FIXA = "Jardim dos Ipês";

const schema = z.object({
    nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    email: z.string().email("Email inválido"),
    telefone: z.string().optional(),
    congregacao: z.string().default(CONGREGACAO_FIXA).optional(),
    instrumentos: z.array(z.string()).min(1, "Selecione pelo menos um instrumento"),
    role: z.enum(["INSTRUTOR", "ADMIN"]).default("INSTRUTOR"),
});

type FormData = {
    nome: string;
    email: string;
    telefone?: string;
    congregacao?: string;
    instrumentos: string[];
    role: "INSTRUTOR" | "ADMIN";
};

interface NovoInstrutorFormProps {
    instrumentosDisponiveis: { id: string; nome: string; categoria: string }[];
    userRole: string;
}

export function NovoInstrutorForm({ instrumentosDisponiveis, userRole }: NovoInstrutorFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [adminLimitReached, setAdminLimitReached] = useState(false);

    // Verificar se usuário pode atribuir roles (ENCARREGADO ou ADMIN)
    const canAssignRoles = userRole === "ENCARREGADO" || userRole === "ADMIN";

    // Verificar limite de ADMINs quando o formulário carrega
    useEffect(() => {
        if (canAssignRoles) {
            fetch("/api/instrutores/admin-count")
                .then(res => res.json())
                .then(data => {
                    setAdminLimitReached(data.limitReached || false);
                })
                .catch(() => { });
        }
    }, [canAssignRoles]);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<FormData>({
        resolver: zodResolver(schema) as never,
        defaultValues: {
            instrumentos: [],
            congregacao: CONGREGACAO_FIXA,
            role: "INSTRUTOR",
        },
    });

    const selectedInstrumentos = watch("instrumentos") || [];

    const toggleInstrumento = (nome: string) => {
        const current = selectedInstrumentos;
        if (current.includes(nome)) {
            setValue(
                "instrumentos",
                current.filter((i) => i !== nome)
            );
        } else {
            setValue("instrumentos", [...current, nome]);
        }
    };

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        setError("");

        // Garantir que a congregação seja sempre a fixa
        const payload = {
            ...data,
            congregacao: CONGREGACAO_FIXA,
        };

        try {
            const response = await fetch("/api/instrutores", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || "Erro ao cadastrar instrutor");
            }

            router.push("/dashboard/instrutores");
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao cadastrar instrutor");
        } finally {
            setLoading(false);
        }
    };

    // Agrupar instrumentos por categoria
    const instrumentosPorCategoria = instrumentosDisponiveis.reduce((acc, inst) => {
        if (!acc[inst.categoria]) {
            acc[inst.categoria] = [];
        }
        acc[inst.categoria].push(inst);
        return acc;
    }, {} as Record<string, typeof instrumentosDisponiveis>);

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <BackButton />
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Novo Instrutor</h1>
                    <p className="text-gray-500 dark:text-gray-400">Cadastre um novo instrutor no sistema</p>
                </div>
            </div>

            {/* Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Dados do Instrutor</CardTitle>
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
                                <Input id="nome" {...register("nome")} placeholder="Nome do instrutor" />
                                {errors.nome && (
                                    <p className="text-sm text-red-500">{errors.nome.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
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
                                <Label htmlFor="telefone">Telefone</Label>
                                <Input
                                    id="telefone"
                                    {...register("telefone")}
                                    placeholder="(11) 99999-0000"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Congregação</Label>
                                <div className="h-10 px-3 py-2 border rounded-md bg-gray-50 dark:bg-zinc-900/50 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-zinc-800 flex items-center">
                                    {CONGREGACAO_FIXA}
                                </div>
                            </div>

                            {canAssignRoles && (
                                <div className="space-y-2">
                                    <Label htmlFor="role">Perfil de Acesso *</Label>
                                    <select
                                        id="role"
                                        {...register("role")}
                                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                                    >
                                        <option value="INSTRUTOR">Instrutor</option>
                                        <option value="ADMIN" disabled={adminLimitReached}>
                                            Secretário {adminLimitReached ? "(limite atingido)" : ""}
                                        </option>
                                    </select>
                                    {errors.role && (
                                        <p className="text-sm text-red-500">{errors.role.message}</p>
                                    )}
                                    {adminLimitReached && (
                                        <p className="text-xs text-amber-600 dark:text-amber-500">
                                            Limite de 3 secretários atingido. Desative um secretário existente para adicionar outro.
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="md:col-span-2 space-y-4">
                                <Label>Instrumentos que leciona *</Label>
                                {errors.instrumentos && (
                                    <p className="text-sm text-red-500">{errors.instrumentos.message}</p>
                                )}

                                <div className="space-y-4 border rounded-lg p-4 bg-gray-50 dark:bg-zinc-900/50 dark:border-zinc-800 max-h-96 overflow-y-auto">
                                    {Object.entries(instrumentosPorCategoria).map(([categoria, insts]) => (
                                        <div key={categoria}>
                                            <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2 border-b dark:border-zinc-800 pb-1">
                                                {categoria}
                                            </h4>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                {insts.map((inst) => (
                                                    <div key={inst.id} className="flex items-center space-x-2">
                                                        <input
                                                            type="checkbox"
                                                            id={`inst-${inst.id}`}
                                                            checked={selectedInstrumentos.includes(inst.nome)}
                                                            onChange={() => toggleInstrumento(inst.nome)}
                                                            className="h-4 w-4 rounded border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-600 dark:focus:ring-offset-zinc-900"
                                                        />
                                                        <label
                                                            htmlFor={`inst-${inst.id}`}
                                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-gray-300"
                                                        >
                                                            {inst.nome}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Link href="/dashboard/instrutores" className="flex-1">
                                <Button type="button" variant="outline" className="w-full">
                                    Cancelar
                                </Button>
                            </Link>
                            <Button type="submit" className="flex-1" disabled={loading}>
                                {loading ? "Salvando..." : "Cadastrar Instrutor"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

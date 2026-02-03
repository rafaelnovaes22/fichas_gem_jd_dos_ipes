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
import { ArrowLeft, Trash2 } from "lucide-react";

const schema = z.object({
    nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    telefone: z.string().optional(),
    congregacao: z.string().min(1, "Congregação é obrigatória"),
    instrumentos: z.array(z.string()).min(1, "Selecione pelo menos um instrumento"),
});

type FormData = z.infer<typeof schema>;

interface Instrutor {
    id: string;
    usuario: {
        nome: string;
        telefone: string | null;
    };
    congregacao: string;
    instrumentos: string[];
}

interface EditarInstrutorFormProps {
    instrutor: Instrutor;
    instrumentosDisponiveis: { id: string; nome: string; categoria: string }[];
}

export function EditarInstrutorForm({ instrutor, instrumentosDisponiveis }: EditarInstrutorFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            nome: instrutor.usuario.nome,
            telefone: instrutor.usuario.telefone || "",
            congregacao: instrutor.congregacao,
            instrumentos: instrutor.instrumentos,
        },
    });

    const selectedInstrumentos = watch("instrumentos") || [];

    const toggleInstrumento = (nome: string) => {
        const current = selectedInstrumentos;
        if (current.includes(nome)) {
            setValue("instrumentos", current.filter((i) => i !== nome));
        } else {
            setValue("instrumentos", [...current, nome]);
        }
    };

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch(`/api/instrutores/${instrutor.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || "Erro ao atualizar instrutor");
            }

            router.push(`/dashboard/instrutores/${instrutor.id}`);
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao atualizar instrutor");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Tem certeza que deseja desativar este instrutor?")) return;

        setDeleting(true);
        try {
            const response = await fetch(`/api/instrutores/${instrutor.id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Erro ao desativar instrutor");
            }

            router.push("/dashboard/instrutores");
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao desativar instrutor");
        } finally {
            setDeleting(false);
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
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={`/dashboard/instrutores/${instrutor.id}`}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Editar Instrutor</h1>
                        <p className="text-gray-500">{instrutor.usuario.nome}</p>
                    </div>
                </div>
                <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    {deleting ? "Desativando..." : "Desativar"}
                </Button>
            </div>

            {/* Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Dados do Instrutor</CardTitle>
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
                                <Input id="nome" {...register("nome")} placeholder="Nome do instrutor" />
                                {errors.nome && (
                                    <p className="text-sm text-red-500">{errors.nome.message}</p>
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

                            <div className="md:col-span-2 space-y-4">
                                <Label>Instrumentos que leciona *</Label>
                                {errors.instrumentos && (
                                    <p className="text-sm text-red-500">{errors.instrumentos.message}</p>
                                )}

                                <div className="space-y-4 border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
                                    {Object.entries(instrumentosPorCategoria).map(([categoria, insts]) => (
                                        <div key={categoria}>
                                            <h4 className="font-semibold text-sm text-gray-700 mb-2 border-b pb-1">
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
                                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                        />
                                                        <label
                                                            htmlFor={`inst-${inst.id}`}
                                                            className="text-sm font-medium leading-none"
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
                            <Link href={`/dashboard/instrutores/${instrutor.id}`} className="flex-1">
                                <Button type="button" variant="outline" className="w-full">
                                    Cancelar
                                </Button>
                            </Link>
                            <Button type="submit" className="flex-1" disabled={loading}>
                                {loading ? "Salvando..." : "Salvar Alterações"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

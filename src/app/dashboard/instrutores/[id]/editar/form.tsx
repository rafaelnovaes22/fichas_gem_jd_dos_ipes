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
import { ArrowLeft, Trash2 } from "lucide-react";

const CONGREGACAO_FIXA = "Jardim dos Ipês";

const schema = z.object({
    nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    telefone: z.string().optional(),
    congregacao: z.string().default(CONGREGACAO_FIXA).optional(),
    instrumentos: z.array(z.string()).min(1, "Selecione pelo menos um instrumento"),
    role: z.enum(["INSTRUTOR", "ENCARREGADO", "ADMIN"]),
});

type FormData = z.infer<typeof schema>;

interface Instrutor {
    id: string;
    usuario: {
        nome: string;
        telefone: string | null;
        role: string;
    };
    congregacao: string;
    instrumentos: string[];
}

interface EditarInstrutorFormProps {
    instrutor: Instrutor;
    instrumentosDisponiveis: { id: string; nome: string; categoria: string }[];
    userRole: string;
}

export function EditarInstrutorForm({ instrutor, instrumentosDisponiveis, userRole }: EditarInstrutorFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");
    const [adminLimitReached, setAdminLimitReached] = useState(false);

    // Verificar se usuário pode atribuir roles (ENCARREGADO ou ADMIN)
    const canAssignRoles = userRole === "ENCARREGADO" || userRole === "ADMIN";
    // Role atual do instrutor sendo editado
    const currentRole = instrutor.usuario.role;
    // Não permitir edição de role se for ENCARREGADO
    const isEncarregado = currentRole === "ENCARREGADO";

    // Verificar limite de ADMINs quando o formulário carrega
    useEffect(() => {
        if (canAssignRoles && !isEncarregado) {
            fetch("/api/instrutores/admin-count")
                .then(res => res.json())
                .then(data => {
                    // Se já é ADMIN, não precisa se preocupar com o limite para ele mesmo
                    if (currentRole === "ADMIN") {
                        setAdminLimitReached(data.count > 3);
                    } else {
                        setAdminLimitReached(data.limitReached || false);
                    }
                })
                .catch(() => { });
        }
    }, [canAssignRoles, isEncarregado, currentRole]);

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
            congregacao: CONGREGACAO_FIXA,
            instrumentos: instrutor.instrumentos,
            role: instrutor.usuario.role as "INSTRUTOR" | "ENCARREGADO" | "ADMIN",
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

        // Garantir que a congregação seja sempre a fixa
        const payload = {
            ...data,
            congregacao: CONGREGACAO_FIXA,
        };

        try {
            const response = await fetch(`/api/instrutores/${instrutor.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
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
        if (!confirm("Tem certeza que deseja excluir este instrutor? Se ele tiver histórico de aulas, será apenas desativado.")) return;

        setDeleting(true);
        try {
            const response = await fetch(`/api/instrutores/${instrutor.id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Erro ao excluir instrutor");
            }

            router.push("/dashboard/instrutores");
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao excluir instrutor");
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
                    <BackButton />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Editar Instrutor</h1>
                        <p className="text-gray-500">{instrutor.usuario.nome}</p>
                    </div>
                </div>
                <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    {deleting ? "Excluindo..." : "Excluir"}
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
                                <Label>Congregação</Label>
                                <div className="h-10 px-3 py-2 border rounded-md bg-gray-50 text-gray-700 flex items-center">
                                    {CONGREGACAO_FIXA}
                                </div>
                            </div>

                            {/* Seletor de role: exibido apenas para quem pode atribuir roles e se não for ENCARREGADO */}
                            {canAssignRoles && !isEncarregado && (
                                <div className="space-y-2">
                                    <Label htmlFor="role">Perfil de Acesso *</Label>
                                    <select
                                        id="role"
                                        {...register("role")}
                                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                                    >
                                        <option value="INSTRUTOR">Instrutor</option>
                                        <option value="ADMIN" disabled={adminLimitReached && currentRole !== "ADMIN"}>
                                            Secretário {adminLimitReached && currentRole !== "ADMIN" ? "(limite atingido)" : ""}
                                        </option>
                                    </select>
                                    {errors.role && (
                                        <p className="text-sm text-red-500">{errors.role.message}</p>
                                    )}
                                    {adminLimitReached && currentRole !== "ADMIN" && (
                                        <p className="text-xs text-amber-600">
                                            Limite de 3 secretários atingido.
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Exibir role atual se for ENCARREGADO (não editável) */}
                            {isEncarregado && (
                                <div className="space-y-2">
                                    <Label>Perfil de Acesso</Label>
                                    <div className="h-10 px-3 py-2 border rounded-md bg-gray-100 text-gray-700 flex items-center">
                                        Encarregado de Orquestra
                                        <span className="text-xs text-gray-500 ml-2">(não editável)</span>
                                    </div>
                                </div>
                            )}

                            {/* Exibir role atual como texto se usuário não pode atribuir roles */}
                            {!canAssignRoles && !isEncarregado && (
                                <div className="space-y-2">
                                    <Label>Perfil de Acesso</Label>
                                    <div className="h-10 px-3 py-2 border rounded-md bg-gray-50 text-gray-700 flex items-center">
                                        {currentRole === "ADMIN" ? "Secretário" : "Instrutor"}
                                    </div>
                                </div>
                            )}

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

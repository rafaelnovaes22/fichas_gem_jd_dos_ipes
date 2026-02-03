"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

const fichaSchema = z.object({
    tipoAula: z.enum(["SOLFEJO", "TEORIA_MUSICAL", "PRATICA_INSTRUMENTO", "HINARIO"], {
        required_error: "Selecione o tipo de aula",
    }),
    nivel: z.string().optional(),
    livro: z.string().optional(),
});

type FichaFormData = z.infer<typeof fichaSchema>;

interface NovaFichaFormProps {
    alunoId: string;
}

export function NovaFichaForm({ alunoId }: NovaFichaFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<FichaFormData>({
        resolver: zodResolver(fichaSchema),
        defaultValues: {
            tipoAula: "PRATICA_INSTRUMENTO",
        },
    });

    const tipoAula = watch("tipoAula");

    const onSubmit = async (data: FichaFormData) => {
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/fichas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...data, alunoId }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Erro ao criar ficha");
            }

            const ficha = await res.json();
            router.push(`/dashboard/fichas/${ficha.id}`);
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
                    {error}
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="tipoAula">Tipo de Ficha *</Label>
                <select
                    id="tipoAula"
                    {...register("tipoAula")}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                    <option value="SOLFEJO">Solfejo (Leitura Métrica)</option>
                    <option value="TEORIA_MUSICAL">Teoria Musical</option>
                    <option value="PRATICA_INSTRUMENTO">Prática de Instrumento</option>
                    <option value="HINARIO">Hinário</option>
                </select>
                {errors.tipoAula && (
                    <p className="text-sm text-red-500">{errors.tipoAula.message}</p>
                )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="nivel">Nível (Opcional)</Label>
                    <Input
                        id="nivel"
                        {...register("nivel")}
                        placeholder="Ex: Básico, Fase 1, Hinos 1-50"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="livro">Método / Livro (Opcional)</Label>
                    <Input
                        id="livro"
                        {...register("livro")}
                        placeholder="Ex: Schmoll, Bona, Hinário 5"
                    />
                </div>
            </div>

            <div className="pt-4 flex justify-end">
                <Button type="submit" disabled={loading}>
                    {loading ? "Criando..." : "Criar Ficha"}
                </Button>
            </div>
        </form>
    );
}

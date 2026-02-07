"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, Users, Search } from "lucide-react";
import type { Aluno, Instrumento, Fase } from "@prisma/client";

const turmaSchema = z.object({
    nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    descricao: z.string().optional(),
    diaSemana: z.enum(["DOMINGO", "SEGUNDA", "TERCA", "QUARTA", "QUINTA", "SEXTA", "SABADO"]).optional(),
    horario: z.string().optional(),
    alunoIds: z.array(z.string()).min(1, "Selecione pelo menos um aluno"),
});

type TurmaFormData = z.infer<typeof turmaSchema>;

interface TurmaFormProps {
    alunos: (Aluno & {
        instrumento: Instrumento;
        fase: Fase;
    })[];
}

const diasSemana = [
    { value: "DOMINGO", label: "Domingo" },
    { value: "SEGUNDA", label: "Segunda-feira" },
    { value: "TERCA", label: "Terça-feira" },
    { value: "QUARTA", label: "Quarta-feira" },
    { value: "QUINTA", label: "Quinta-feira" },
    { value: "SEXTA", label: "Sexta-feira" },
    { value: "SABADO", label: "Sábado" },
];

export function TurmaForm({ alunos }: TurmaFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<TurmaFormData>({
        resolver: zodResolver(turmaSchema),
        defaultValues: {
            alunoIds: [],
        },
    });

    const selectedAlunos = watch("alunoIds") || [];

    const filteredAlunos = alunos.filter((aluno) =>
        aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        aluno.instrumento.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleAluno = (alunoId: string) => {
        const current = selectedAlunos;
        const updated = current.includes(alunoId)
            ? current.filter((id) => id !== alunoId)
            : [...current, alunoId];
        setValue("alunoIds", updated, { shouldValidate: true });
    };

    const onSubmit = async (data: TurmaFormData) => {
        setIsSubmitting(true);

        try {
            const response = await fetch("/api/turmas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Erro ao criar turma");
            }

            toast.success("Turma criada com sucesso!");
            router.push("/dashboard/aulas");
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Erro ao criar turma");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Informações da Turma */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Informações da Turma</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="nome">
                                Nome da Turma <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="nome"
                                placeholder="Ex: Turma de Violino - Manhã"
                                {...register("nome")}
                            />
                            {errors.nome && (
                                <p className="text-sm text-red-500">{errors.nome.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="descricao">Descrição</Label>
                            <Textarea
                                id="descricao"
                                placeholder="Descrição opcional da turma..."
                                {...register("descricao")}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="diaSemana">Dia da Semana</Label>
                                <Select
                                    onValueChange={(value) =>
                                        setValue("diaSemana", value as any)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {diasSemana.map((dia) => (
                                            <SelectItem key={dia.value} value={dia.value}>
                                                {dia.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="horario">Horário</Label>
                                <Input
                                    id="horario"
                                    type="time"
                                    {...register("horario")}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Seleção de Alunos */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Alunos da Turma
                            <span className="text-sm font-normal text-gray-500">
                                ({selectedAlunos.length} selecionado
                                {selectedAlunos.length !== 1 ? "s" : ""})
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Buscar aluno por nome ou instrumento..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {errors.alunoIds && (
                            <p className="text-sm text-red-500">{errors.alunoIds.message}</p>
                        )}

                        <div className="border rounded-lg max-h-[400px] overflow-y-auto">
                            {filteredAlunos.length === 0 ? (
                                <p className="p-4 text-center text-gray-500">
                                    Nenhum aluno encontrado
                                </p>
                            ) : (
                                <div className="divide-y">
                                    {filteredAlunos.map((aluno) => (
                                        <label
                                            key={aluno.id}
                                            className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                                        >
                                            <Checkbox
                                                checked={selectedAlunos.includes(aluno.id)}
                                                onCheckedChange={() => toggleAluno(aluno.id)}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 truncate">
                                                    {aluno.nome}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {aluno.instrumento.nome} • {aluno.fase.nome}
                                                </p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-3">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                >
                    Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Criando...
                        </>
                    ) : (
                        "Criar Turma"
                    )}
                </Button>
            </div>
        </form>
    );
}

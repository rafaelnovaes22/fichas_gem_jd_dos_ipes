
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Combobox } from "@/components/ui/combobox";
// Assuming Combobox exists or using a simple Select if not. 
// For now, I'll use a simple Select for students to keep it simple, 
// but if the list is long, a Combobox is better. 
// Given the current imports, I'll stick to native Select for simplicity in this artifact,
// but I'll check if a Combobox component exists.

interface AlunoOption {
    id: string;
    nome: string;
}

interface NovaFichaDialogProps {
    alunos: AlunoOption[];
}

const tiposAula = [
    { value: "SOLFEJO", label: "Solfejo" },
    { value: "TEORIA_MUSICAL", label: "Teoria Musical" },
    { value: "PRATICA_INSTRUMENTO", label: "Prática de Instrumento" },
    { value: "HINARIO", label: "Hinário" },
];

export function NovaFichaDialog({ alunos }: NovaFichaDialogProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [alunoId, setAlunoId] = useState("");
    const [tipoAula, setTipoAula] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/fichas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    alunoId,
                    tipoAula,
                }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Erro ao criar ficha");
            }

            const novaFicha = await res.json();
            toast.success("Ficha criada com sucesso!");
            setOpen(false);
            setAlunoId("");
            setTipoAula("");
            router.refresh();
            // Optional: Redirect to the new ficha
            // router.push(`/dashboard/fichas/${novaFicha.id}`);
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("Erro ao criar ficha");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Ficha
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Nova Ficha de Acompanhamento</DialogTitle>
                    <DialogDescription>
                        Selecione o aluno e o tipo de aula para criar uma nova ficha.
                        O sistema validará se o aluno já possui este tipo de ficha neste ano.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="aluno">Aluno</Label>
                        <Select value={alunoId} onValueChange={setAlunoId} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione um aluno..." />
                            </SelectTrigger>
                            <SelectContent className="max-h-[200px]">
                                {alunos.map((aluno) => (
                                    <SelectItem key={aluno.id} value={aluno.id}>
                                        {aluno.nome}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="tipo">Tipo de Aula</Label>
                        <Select value={tipoAula} onValueChange={setTipoAula} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo..." />
                            </SelectTrigger>
                            <SelectContent>
                                {tiposAula.map((tipo) => (
                                    <SelectItem key={tipo.value} value={tipo.value}>
                                        {tipo.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading || !alunoId || !tipoAula}>
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Criar Ficha
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    ArrowLeft,
    Plus,
    BookOpen,
    GraduationCap,
    Users,
    ListTodo,
    Pencil,
    Trash2,
    Loader2,
} from "lucide-react";

interface Fase {
    id: string;
    nome: string;
    descricao: string | null;
    ordem: number;
    ativo: boolean;
    _count: {
        alunos: number;
        topicos: number;
    };
}

export default function FasesPage() {
    const [fases, setFases] = useState<Fase[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    // Form states
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingFase, setEditingFase] = useState<Fase | null>(null);
    const [formData, setFormData] = useState({
        nome: "",
        descricao: "",
        ordem: 1,
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchFases();
        checkAdmin();
    }, []);

    const checkAdmin = async () => {
        try {
            const res = await fetch("/api/auth/session");
            const data = await res.json();
            setIsAdmin(data?.user?.role === "ADMIN" || data?.user?.role === "ENCARREGADO");
        } catch (error) {
            console.error("Erro ao verificar permissões:", error);
        }
    };

    const fetchFases = async () => {
        try {
            const res = await fetch("/api/fases");
            if (!res.ok) throw new Error("Erro ao carregar fases");
            const data = await res.json();
            setFases(data);
        } catch (error) {
            toast.error("Erro ao carregar fases");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (fase?: Fase) => {
        if (fase) {
            setEditingFase(fase);
            setFormData({
                nome: fase.nome,
                descricao: fase.descricao || "",
                ordem: fase.ordem,
            });
        } else {
            setEditingFase(null);
            setFormData({
                nome: "",
                descricao: "",
                ordem: fases.length + 1,
            });
        }
        setDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const url = editingFase ? `/api/fases/${editingFase.id}` : "/api/fases";
            const method = editingFase ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Erro ao salvar");
            }

            toast.success(editingFase ? "Fase atualizada!" : "Fase criada!");
            setDialogOpen(false);
            fetchFases();
        } catch (error: any) {
            toast.error(error.message || "Erro ao salvar fase");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (fase: Fase) => {
        if (fase._count.alunos > 0) {
            toast.error(`Não é possível excluir: fase possui ${fase._count.alunos} aluno(s)`);
            return;
        }

        if (!confirm(`Tem certeza que deseja excluir a fase "${fase.nome}"?`)) {
            return;
        }

        try {
            const res = await fetch(`/api/fases/${fase.id}`, {
                method: "DELETE",
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Erro ao excluir");
            }

            toast.success("Fase removida com sucesso!");
            fetchFases();
        } catch (error: any) {
            toast.error(error.message || "Erro ao excluir fase");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/aulas">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Fases do MSA</h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            Gerencie as fases do Método de Solfejo e Análise
                        </p>
                    </div>
                </div>

                {isAdmin && (
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => handleOpenDialog()}>
                                <Plus className="w-4 h-4 mr-2" />
                                Nova Fase
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    {editingFase ? "Editar Fase" : "Nova Fase"}
                                </DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="nome">Nome *</Label>
                                    <Input
                                        id="nome"
                                        value={formData.nome}
                                        onChange={(e) =>
                                            setFormData({ ...formData, nome: e.target.value })
                                        }
                                        placeholder="Ex: Fase 1"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="descricao">Descrição</Label>
                                    <Input
                                        id="descricao"
                                        value={formData.descricao}
                                        onChange={(e) =>
                                            setFormData({ ...formData, descricao: e.target.value })
                                        }
                                        placeholder="Ex: Música e Som"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="ordem">Ordem *</Label>
                                    <Input
                                        id="ordem"
                                        type="number"
                                        min={1}
                                        value={formData.ordem}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                ordem: parseInt(e.target.value) || 1,
                                            })
                                        }
                                        required
                                    />
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => setDialogOpen(false)}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button type="submit" className="flex-1" disabled={saving}>
                                        {saving ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            "Salvar"
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            {/* Info Card */}
            <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-100 dark:from-indigo-950/50 dark:to-blue-950/50 dark:border-indigo-900/50">
                <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0">
                            <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">Sobre as Fases do MSA</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                O Método de Solfejo e Análise (MSA) é dividido em fases que
                                abordam progressivamente os conceitos musicais. Cada fase contém
                                tópicos específicos que são utilizados nas aulas teóricas.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Lista de Fases */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {fases.map((fase) => (
                    <Card key={fase.id} className="group hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center font-bold">
                                        {fase.ordem}
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">{fase.nome}</CardTitle>
                                        {fase.descricao && (
                                            <p className="text-sm text-gray-500">{fase.descricao}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                                <div className="flex items-center gap-1">
                                    <GraduationCap className="w-4 h-4" />
                                    <span>{fase._count.topicos} tópicos</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    <span>{fase._count.alunos} alunos</span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Link href={`/dashboard/aulas/fases/${fase.id}`} className="flex-1">
                                    <Button variant="outline" className="w-full" size="sm">
                                        <ListTodo className="w-4 h-4 mr-1" />
                                        Tópicos
                                    </Button>
                                </Link>

                                {isAdmin && (
                                    <>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handleOpenDialog(fase)}
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="text-red-600 hover:text-red-700"
                                            onClick={() => handleDelete(fase)}
                                            disabled={fase._count.alunos > 0}
                                            title={
                                                fase._count.alunos > 0
                                                    ? "Não é possível excluir fase com alunos"
                                                    : "Excluir fase"
                                            }
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {fases.length === 0 && (
                <Card>
                    <CardContent className="py-12 text-center">
                        <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Nenhuma fase cadastrada.</p>
                        {isAdmin && (
                            <p className="text-sm text-gray-400 mt-2">
                                Clique em "Nova Fase" para começar.
                            </p>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

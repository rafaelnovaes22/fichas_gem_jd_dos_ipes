"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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
    Hash,
    Pencil,
    Trash2,
    Loader2,
    ChevronRight,
} from "lucide-react";

interface Topico {
    id: string;
    numero: string;
    titulo: string;
    descricao: string | null;
}

interface Fase {
    id: string;
    nome: string;
    descricao: string | null;
    ordem: number;
    topicos: Topico[];
    _count: {
        alunos: number;
        topicos: number;
    };
}

export default function FaseDetailPage() {
    const params = useParams();
    const faseId = params.id as string;

    const [fase, setFase] = useState<Fase | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    // Dialog states
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingTopico, setEditingTopico] = useState<Topico | null>(null);
    const [formData, setFormData] = useState({
        numero: "",
        titulo: "",
        descricao: "",
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchFase();
        checkAdmin();
    }, [faseId]);

    const checkAdmin = async () => {
        try {
            const res = await fetch("/api/auth/session");
            const data = await res.json();
            setIsAdmin(data?.user?.role === "ADMIN");
        } catch (error) {
            console.error("Erro ao verificar permissões:", error);
        }
    };

    const fetchFase = async () => {
        try {
            const res = await fetch(`/api/fases/${faseId}`);
            if (!res.ok) throw new Error("Erro ao carregar fase");
            const data = await res.json();
            setFase(data);
        } catch (error) {
            toast.error("Erro ao carregar fase");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (topico?: Topico) => {
        if (topico) {
            setEditingTopico(topico);
            setFormData({
                numero: topico.numero,
                titulo: topico.titulo,
                descricao: topico.descricao || "",
            });
        } else {
            setEditingTopico(null);
            // Sugerir próximo número
            const nextNum = fase?.topicos.length
                ? (parseFloat(fase.topicos[fase.topicos.length - 1].numero) + 0.1).toFixed(1)
                : `${fase?.ordem || 1}.1`;
            setFormData({
                numero: nextNum,
                titulo: "",
                descricao: "",
            });
        }
        setDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const url = editingTopico
                ? `/api/fases/${faseId}/topicos/${editingTopico.id}`
                : `/api/fases/${faseId}/topicos`;
            const method = editingTopico ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Erro ao salvar");
            }

            toast.success(editingTopico ? "Tópico atualizado!" : "Tópico criado!");
            setDialogOpen(false);
            fetchFase();
        } catch (error: any) {
            toast.error(error.message || "Erro ao salvar tópico");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (topico: Topico) => {
        if (!confirm(`Tem certeza que deseja excluir o tópico "${topico.numero} - ${topico.titulo}"?`)) {
            return;
        }

        try {
            const res = await fetch(`/api/fases/${faseId}/topicos/${topico.id}`, {
                method: "DELETE",
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Erro ao excluir");
            }

            toast.success("Tópico removido com sucesso!");
            fetchFase();
        } catch (error: any) {
            toast.error(error.message || "Erro ao excluir tópico");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!fase) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Fase não encontrada</p>
                <Link href="/dashboard/aulas/fases">
                    <Button variant="outline" className="mt-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/aulas/fases">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>Fase {fase.ordem}</span>
                            <ChevronRight className="w-4 h-4" />
                            <span>Tópicos</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">{fase.nome}</h1>
                        {fase.descricao && (
                            <p className="text-gray-500">{fase.descricao}</p>
                        )}
                    </div>
                </div>

                {isAdmin && (
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => handleOpenDialog()}>
                                <Plus className="w-4 h-4 mr-2" />
                                Novo Tópico
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    {editingTopico ? "Editar Tópico" : "Novo Tópico"}
                                </DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="numero">Número *</Label>
                                    <Input
                                        id="numero"
                                        value={formData.numero}
                                        onChange={(e) =>
                                            setFormData({ ...formData, numero: e.target.value })
                                        }
                                        placeholder="Ex: 1.1"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="titulo">Título *</Label>
                                    <Input
                                        id="titulo"
                                        value={formData.titulo}
                                        onChange={(e) =>
                                            setFormData({ ...formData, titulo: e.target.value })
                                        }
                                        placeholder="Ex: Música e som"
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
                                        placeholder="Descrição opcional"
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
            <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-100">
                <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                            <BookOpen className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">Tópicos da Fase</p>
                            <p className="text-sm text-gray-600 mt-1">
                                Esta fase possui {fase._count.topicos} tópico(s) e {fase._count.alunos} aluno(s) associado(s).
                                Os tópicos são usados para registrar o conteúdo das aulas teóricas.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Lista de Tópicos */}
            <div className="space-y-3">
                {fase.topicos.map((topico) => (
                    <Card key={topico.id} className="hover:shadow-sm transition-shadow">
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                                        {topico.numero}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{topico.titulo}</h3>
                                        {topico.descricao && (
                                            <p className="text-sm text-gray-500 mt-1">{topico.descricao}</p>
                                        )}
                                    </div>
                                </div>

                                {isAdmin && (
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handleOpenDialog(topico)}
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="text-red-600 hover:text-red-700"
                                            onClick={() => handleDelete(topico)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {fase.topicos.length === 0 && (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Hash className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Nenhum tópico cadastrado.</p>
                        {isAdmin && (
                            <p className="text-sm text-gray-400 mt-2">
                                Clique em "Novo Tópico" para começar.
                            </p>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

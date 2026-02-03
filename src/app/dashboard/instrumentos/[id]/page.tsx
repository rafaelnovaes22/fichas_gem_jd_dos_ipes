"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Trash2 } from "lucide-react";
import { use } from "react";

const CATEGORIAS = [
    "Cordas",
    "Madeiras",
    "Metais",
    "Saxofones",
    "Teclas",
    "Percussão",
];

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function EditarInstrumentoPage({ params }: PageProps) {
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");
    const [nome, setNome] = useState("");
    const [categoria, setCategoria] = useState("");
    const [ativo, setAtivo] = useState(true);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        fetch(`/api/instrumentos/${id}`)
            .then((res) => res.json())
            .then((data) => {
                setNome(data.nome);
                setCategoria(data.categoria);
                setAtivo(data.ativo);
            })
            .catch((err) => setError("Erro ao carregar instrumento"))
            .finally(() => setFetching(false));
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch(`/api/instrumentos/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nome, categoria, ativo }),
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || "Erro ao atualizar instrumento");
            }

            router.push("/dashboard/instrumentos");
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao atualizar instrumento");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Tem certeza que deseja desativar este instrumento?")) return;

        setDeleting(true);
        try {
            const response = await fetch(`/api/instrumentos/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Erro ao desativar instrumento");
            }

            router.push("/dashboard/instrumentos");
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao desativar instrumento");
        } finally {
            setDeleting(false);
        }
    };

    if (fetching) {
        return <div className="text-center py-12">Carregando...</div>;
    }

    return (
        <div className="max-w-lg mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/instrumentos">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Editar Instrumento</h1>
                        <p className="text-gray-500">{nome}</p>
                    </div>
                </div>
                <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    {deleting ? "Desativando..." : "Desativar"}
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Dados do Instrumento</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="nome">Nome *</Label>
                            <Input
                                id="nome"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                placeholder="Ex: Violino"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="categoria">Categoria *</Label>
                            <select
                                id="categoria"
                                value={categoria}
                                onChange={(e) => setCategoria(e.target.value)}
                                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                                required
                            >
                                <option value="">Selecione...</option>
                                {CATEGORIAS.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="ativo"
                                checked={ativo}
                                onChange={(e) => setAtivo(e.target.checked)}
                                className="h-4 w-4"
                            />
                            <Label htmlFor="ativo" className="font-normal">
                                Instrumento Ativo
                            </Label>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Link href="/dashboard/instrumentos" className="flex-1">
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

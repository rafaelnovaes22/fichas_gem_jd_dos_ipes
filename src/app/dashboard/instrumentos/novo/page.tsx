"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BackButton } from "@/components/ui/back-button";
import { ArrowLeft } from "lucide-react";

const CATEGORIAS = [
    "Cordas",
    "Madeiras",
    "Metais",
    "Saxofones",
    "Teclas",
    "Percussão",
];

export default function NovoInstrumentoPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [nome, setNome] = useState("");
    const [categoria, setCategoria] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/instrumentos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nome, categoria }),
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || "Erro ao criar instrumento");
            }

            router.push("/dashboard/instrumentos");
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao criar instrumento");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-lg mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <BackButton />
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Novo Instrumento</h1>
                    <p className="text-gray-500">Cadastre um novo instrumento</p>
                </div>
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

                        <div className="flex gap-4 pt-4">
                            <Link href="/dashboard/instrumentos" className="flex-1">
                                <Button type="button" variant="outline" className="w-full">
                                    Cancelar
                                </Button>
                            </Link>
                            <Button type="submit" className="flex-1" disabled={loading}>
                                {loading ? "Salvando..." : "Criar Instrumento"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

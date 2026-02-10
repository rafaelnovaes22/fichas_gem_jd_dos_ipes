"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

interface Instrumento {
    id: string;
    nome: string;
    categoria: string;
}

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        nome: "",
        email: "",
        telefone: "",
        senha: "",
        confirmarSenha: "",
    });

    const CONGREGACAO_FIXA = "Jardim dos Ipês";
    const [instrumentos, setInstrumentos] = useState<Instrumento[]>([]);
    const [instrumentosSelecionados, setInstrumentosSelecionados] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [isEncarregado, setIsEncarregado] = useState(false);
    const [encarregadoExists, setEncarregadoExists] = useState(false);
    const [checkingEncarregado, setCheckingEncarregado] = useState(true);

    useEffect(() => {
        async function fetchInstrumentos() {
            try {
                const response = await fetch("/api/instrumentos");
                if (response.ok) {
                    const data = await response.json();
                    setInstrumentos(data);
                }
            } catch (error) {
                console.error("Erro ao carregar instrumentos:", error);
            }
        }
        fetchInstrumentos();
    }, []);

    // Verificar se já existe ENCARREGADO
    useEffect(() => {
        async function checkEncarregado() {
            try {
                const response = await fetch("/api/auth/check-encarregado");
                if (response.ok) {
                    const data = await response.json();
                    setEncarregadoExists(data.exists);
                }
            } catch (error) {
                console.error("Erro ao verificar encarregado:", error);
            } finally {
                setCheckingEncarregado(false);
            }
        }
        checkEncarregado();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const toggleInstrumento = (instrumentoId: string) => {
        setInstrumentosSelecionados((prev) =>
            prev.includes(instrumentoId)
                ? prev.filter((id) => id !== instrumentoId)
                : [...prev, instrumentoId]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess(false);

        // Validações
        if (formData.senha.length < 6) {
            setError("A senha deve ter pelo menos 6 caracteres");
            return;
        }

        if (formData.senha !== formData.confirmarSenha) {
            setError("As senhas não coincidem");
            return;
        }

        if (instrumentosSelecionados.length === 0) {
            setError("Selecione pelo menos um instrumento que você leciona");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nome: formData.nome,
                    email: formData.email,
                    telefone: formData.telefone,
                    senha: formData.senha,
                    congregacao: CONGREGACAO_FIXA,
                    instrumentos: instrumentosSelecionados,
                    role: isEncarregado ? "ENCARREGADO" : "INSTRUTOR",
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Erro ao realizar cadastro");
                return;
            }

            setSuccess(true);
            // Redirecionar para login após 2 segundos
            setTimeout(() => {
                router.push("/login");
            }, 2000);
        } catch {
            setError("Erro ao realizar cadastro. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    // Agrupar instrumentos por categoria
    const instrumentosPorCategoria = instrumentos.reduce((acc, inst) => {
        if (!acc[inst.categoria]) {
            acc[inst.categoria] = [];
        }
        acc[inst.categoria].push(inst);
        return acc;
    }, {} as Record<string, Instrumento[]>);

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <Link href="/" className="inline-flex items-center gap-3">
                            <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                                <span className="text-3xl font-bold text-white">♪</span>
                            </div>
                            <span className="text-2xl font-bold text-white">GGEM</span>
                        </Link>
                    </div>

                    <Card className="border-0 shadow-2xl">
                        <CardContent className="pt-8 pb-8 text-center">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg
                                    className="w-8 h-8 text-green-600 dark:text-green-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                Cadastro realizado!
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-6">
                                Seu cadastro foi criado com sucesso. Você será redirecionado para a página de login.
                            </p>
                            <Link href="/login">
                                <Button className="w-full">Ir para o login</Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Logo */}
                <div className="text-center mb-8 relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 hidden md:block">
                        <BackButton
                            variant="ghost"
                            className="text-white hover:text-white/80 hover:bg-white/10"
                        />
                    </div>
                    <Link href="/" className="inline-flex items-center gap-3">
                        <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                            <span className="text-3xl font-bold text-white">♪</span>
                        </div>
                        <span className="text-2xl font-bold text-white">GGEM</span>
                    </Link>
                </div>

                {/* Register Card */}
                <Card className="border-0 shadow-2xl">
                    <CardHeader className="space-y-1 pb-4">
                        <CardTitle className="text-2xl font-bold text-center">
                            Cadastro de Instrutor
                        </CardTitle>
                        <CardDescription className="text-center">
                            Crie sua conta para começar a usar o sistema GGEM
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nome">Nome completo *</Label>
                                    <Input
                                        id="nome"
                                        name="nome"
                                        type="text"
                                        placeholder="Seu nome completo"
                                        value={formData.nome}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email *</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="seu@email.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="telefone">Telefone</Label>
                                    <Input
                                        id="telefone"
                                        name="telefone"
                                        type="tel"
                                        placeholder="(00) 00000-0000"
                                        value={formData.telefone}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Congregação</Label>
                                    <div className="h-10 px-3 py-2 border rounded-md bg-gray-50 dark:bg-zinc-900/50 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-zinc-800 flex items-center">
                                        {CONGREGACAO_FIXA}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="senha">Senha *</Label>
                                    <PasswordInput
                                        id="senha"
                                        name="senha"
                                        placeholder="Mínimo 6 caracteres"
                                        value={formData.senha}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                        minLength={6}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmarSenha">Confirmar senha *</Label>
                                    <PasswordInput
                                        id="confirmarSenha"
                                        name="confirmarSenha"
                                        placeholder="Digite a senha novamente"
                                        value={formData.confirmarSenha}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            {/* Opção de Encarregado */}
                            {/* Opção de Encarregado - Só exibe se não existir um cadastrado */}
                            {!encarregadoExists && !checkingEncarregado && (
                                <div className="space-y-3 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                    <div className="flex items-start space-x-3">
                                        <Checkbox
                                            id="encarregado"
                                            checked={isEncarregado}
                                            onCheckedChange={(checked) => setIsEncarregado(checked === true)}
                                            disabled={loading}
                                        />
                                        <div className="space-y-1">
                                            <Label
                                                htmlFor="encarregado"
                                                className="font-medium cursor-pointer text-gray-900 dark:text-gray-100"
                                            >
                                                Sou o Encarregado de Orquestra desta congregação
                                            </Label>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Marque esta opção se você é responsável pela orquestra. Você terá acesso administrativo completo.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3">
                                <Label>Instrumentos que leciona *</Label>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Selecione pelo menos um instrumento
                                </p>
                                <div className="border rounded-lg p-4 space-y-4 dark:border-zinc-800">
                                    {Object.entries(instrumentosPorCategoria).map(
                                        ([categoria, insts]) => (
                                            <div key={categoria}>
                                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                    {categoria}
                                                </h4>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                    {insts.map((inst) => (
                                                        <div
                                                            key={inst.id}
                                                            className="flex items-center space-x-2"
                                                        >
                                                            <Checkbox
                                                                id={inst.id}
                                                                checked={instrumentosSelecionados.includes(
                                                                    inst.id
                                                                )}
                                                                onCheckedChange={() =>
                                                                    toggleInstrumento(inst.id)
                                                                }
                                                                disabled={loading}
                                                            />
                                                            <Label
                                                                htmlFor={inst.id}
                                                                className="text-sm font-normal cursor-pointer text-gray-700 dark:text-gray-300"
                                                            >
                                                                {inst.nome}
                                                            </Label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-11 text-base"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                                fill="none"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            />
                                        </svg>
                                        Cadastrando...
                                    </span>
                                ) : (
                                    "Criar conta"
                                )}
                            </Button>

                            <p className="text-center text-sm text-gray-600">
                                Já tem uma conta?{" "}
                                <Link
                                    href="/login"
                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    Faça login
                                </Link>
                            </p>
                        </form>
                    </CardContent>
                </Card>

                {/* Footer */}
                <p className="text-center text-blue-200/60 text-sm mt-6">
                    Sistema GGEM - Gestão de Grupo de Ensino Musical
                </p>
            </div>
        </div>
    );
}

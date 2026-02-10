"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await signIn("credentials", {
                email,
                password: senha,
                redirect: false,
            });

            if (result?.error) {
                setError("Email ou senha inválidos");
            } else {
                router.push("/dashboard");
                router.refresh();
            }
        } catch {
            setError("Erro ao fazer login. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-3">
                        <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                            <span className="text-3xl font-bold text-white">♪</span>
                        </div>
                        <span className="text-2xl font-bold text-white">GGEM</span>
                    </Link>
                </div>

                {/* Login Card */}
                <Card className="border-0 shadow-2xl">
                    <CardHeader className="space-y-1 pb-4">
                        <CardTitle className="text-2xl font-bold text-center">
                            Bem-vindo de volta
                        </CardTitle>
                        <CardDescription className="text-center">
                            Entre com suas credenciais para acessar o sistema
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="senha">Senha</Label>
                                <PasswordInput
                                    id="senha"
                                    placeholder="••••••••"
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                    required
                                    disabled={loading}
                                />
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
                                        Entrando...
                                    </span>
                                ) : (
                                    "Entrar"
                                )}
                            </Button>

                            <p className="text-center text-sm text-gray-600 dark:text-gray-400 pt-2">
                                Ainda não tem uma conta?{" "}
                                <Link
                                    href="/register"
                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                                >
                                    Cadastre-se
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

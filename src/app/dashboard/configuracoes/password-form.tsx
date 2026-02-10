
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2, Eye, EyeOff } from "lucide-react";

const passwordSchema = z
    .object({
        senhaAtual: z.string().min(1, "Senha atual é obrigatória"),
        novaSenha: z.string().min(6, "A nova senha deve ter no mínimo 6 caracteres"),
        confirmarSenha: z.string().min(1, "Confirme a nova senha"),
    })
    .refine((data) => data.novaSenha === data.confirmarSenha, {
        message: "As senhas não coincidem",
        path: ["confirmarSenha"],
    });

export function PasswordForm() {
    const [loading, setLoading] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const form = useForm<z.infer<typeof passwordSchema>>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            senhaAtual: "",
            novaSenha: "",
            confirmarSenha: "",
        },
    });

    async function onSubmit(values: z.infer<typeof passwordSchema>) {
        setLoading(true);
        try {
            const res = await fetch("/api/profile/password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    senhaAtual: values.senhaAtual,
                    novaSenha: values.novaSenha,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Erro ao alterar senha");
            }

            toast.success("Senha alterada com sucesso!");
            form.reset();
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("Erro ao alterar senha");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-md">
                <FormField
                    control={form.control}
                    name="senhaAtual"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Senha Atual</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input
                                        type={showCurrentPassword ? "text" : "password"}
                                        placeholder="Sua senha atual"
                                        {...field}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowCurrentPassword((prev) => !prev)}
                                    >
                                        {showCurrentPassword ? (
                                            <EyeOff className="h-4 w-4" aria-hidden="true" />
                                        ) : (
                                            <Eye className="h-4 w-4" aria-hidden="true" />
                                        )}
                                        <span className="sr-only">
                                            {showCurrentPassword ? "Hide password" : "Show password"}
                                        </span>
                                    </Button>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="novaSenha"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nova Senha</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input
                                        type={showNewPassword ? "text" : "password"}
                                        placeholder="Mínimo 6 caracteres"
                                        {...field}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowNewPassword((prev) => !prev)}
                                    >
                                        {showNewPassword ? (
                                            <EyeOff className="h-4 w-4" aria-hidden="true" />
                                        ) : (
                                            <Eye className="h-4 w-4" aria-hidden="true" />
                                        )}
                                        <span className="sr-only">
                                            {showNewPassword ? "Hide password" : "Show password"}
                                        </span>
                                    </Button>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="confirmarSenha"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Confirmar Nova Senha</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Repita a nova senha"
                                        {...field}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-4 w-4" aria-hidden="true" />
                                        ) : (
                                            <Eye className="h-4 w-4" aria-hidden="true" />
                                        )}
                                        <span className="sr-only">
                                            {showConfirmPassword ? "Hide password" : "Show password"}
                                        </span>
                                    </Button>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Alterar Senha
                </Button>
            </form>
        </Form>
    );
}


"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const profileSchema = z.object({
    nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    email: z.string().email(),
    telefone: z.string().optional(),
});

export function ProfileForm() {
    const { data: session, update } = useSession();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            nome: "",
            email: "",
            telefone: "",
        },
    });

    useEffect(() => {
        async function fetchProfile() {
            try {
                const res = await fetch("/api/profile");
                if (res.ok) {
                    const data = await res.json();
                    form.reset({
                        nome: data.nome,
                        email: data.email,
                        telefone: data.telefone || "",
                    });
                }
            } catch (error) {
                console.error("Erro ao buscar perfil", error);
                toast.error("Erro ao carregar dados do perfil");
            } finally {
                setFetching(false);
            }
        }
        fetchProfile();
    }, [form]);

    async function onSubmit(values: z.infer<typeof profileSchema>) {
        setLoading(true);
        try {
            const res = await fetch("/api/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nome: values.nome,
                    telefone: values.telefone,
                }),
            });

            if (!res.ok) {
                throw new Error("Falha ao atualizar");
            }

            await update({
                ...session,
                user: { ...session?.user, name: values.nome },
            });

            toast.success("Perfil atualizado com sucesso!");
        } catch (error) {
            toast.error("Erro ao atualizar perfil");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    if (fetching) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-md">
                <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nome Completo</FormLabel>
                            <FormControl>
                                <Input placeholder="Seu nome" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input {...field} disabled className="bg-gray-100 dark:bg-zinc-800" />
                            </FormControl>
                            <FormDescription>
                                O email não pode ser alterado. Contate um administrador.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="telefone"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Telefone</FormLabel>
                            <FormControl>
                                <Input placeholder="(00) 00000-0000" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Salvar Alterações
                </Button>
            </form>
        </Form>
    );
}


import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";

const changePasswordSchema = z.object({
    senhaAtual: z.string().min(1, "Senha atual é obrigatória"),
    novaSenha: z.string().min(6, "Nova senha deve ter pelo menos 6 caracteres"),
});

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return new NextResponse("Não autorizado", { status: 401 });
    }

    try {
        const body = await req.json();
        const { senhaAtual, novaSenha } = changePasswordSchema.parse(body);

        const usuario = await prisma.usuario.findUnique({
            where: { email: session.user.email },
        });

        if (!usuario) {
            return new NextResponse("Usuário não encontrado", { status: 404 });
        }

        const senhaValida = await bcrypt.compare(senhaAtual, usuario.senha);

        if (!senhaValida) {
            return new NextResponse("Senha atual incorreta", { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(novaSenha, 10);

        await prisma.usuario.update({
            where: { email: session.user.email },
            data: {
                senha: hashedPassword,
            },
        });

        return NextResponse.json({ message: "Senha alterada com sucesso" });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse("Dados inválidos", { status: 400 });
        }
        console.error("[PASSWORD_UPDATE]", error);
        return new NextResponse("Erro interno", { status: 500 });
    }
}

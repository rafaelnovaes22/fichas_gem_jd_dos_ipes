import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Verifica se já existe um ENCARREGADO cadastrado na congregação
 * Endpoint público para uso na página de registro
 */
export async function GET() {
    try {
        const encarregado = await prisma.usuario.findFirst({
            where: {
                role: "ENCARREGADO",
                ativo: true,
            },
            select: { id: true },
        });

        return NextResponse.json({
            exists: !!encarregado,
        });
    } catch (error) {
        console.error("Erro ao verificar encarregado:", error);
        return NextResponse.json(
            { error: "Erro ao verificar status" },
            { status: 500 }
        );
    }
}

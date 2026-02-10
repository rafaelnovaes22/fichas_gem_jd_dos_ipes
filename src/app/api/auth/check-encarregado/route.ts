import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Verifica se já existe um ENCARREGADO cadastrado na congregação
 * Endpoint público para uso na página de registro
 */
export async function GET() {
    try {
        const encarregadoCount = await prisma.usuario.count({
            where: {
                role: "ENCARREGADO",
                ativo: true,
            },
        });

        const registrationOpen = process.env.REGISTRATION_OPEN === "true";

        // Permitir até 4 Encarregados/Admins (1 titular + 3 auxiliares)
        return NextResponse.json({
            exists: encarregadoCount >= 4,
            count: encarregadoCount,
            limit: 4,
            registrationOpen
        });
    } catch (error) {
        console.error("Erro ao verificar encarregado:", error);
        return NextResponse.json(
            { error: "Erro ao verificar status" },
            { status: 500 }
        );
    }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const fases = await prisma.fase.findMany({
            include: {
                topicos: {
                    orderBy: { numero: "asc" },
                },
            },
            orderBy: { ordem: "asc" },
        });

        return NextResponse.json(fases);
    } catch (error) {
        console.error("Erro ao buscar fases MSA:", error);
        return NextResponse.json(
            { error: "Erro interno ao buscar fases" },
            { status: 500 }
        );
    }
}

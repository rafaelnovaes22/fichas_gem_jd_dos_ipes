import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const finalizarSchema = z.object({
    encarregadoLocal: z.string().min(1, "Nome do encarregado é obrigatório"),
    resultadoFinal: z.string().optional(),
    apto: z.boolean(),
});

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions);
        const { id: fichaId } = await params;

        if (!session) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        // Apenas ADMIN ou ENCARREGADO podem finalizar
        if (session.user.role !== "ADMIN" && session.user.role !== "ENCARREGADO") {
            return NextResponse.json({ error: "Apenas administradores ou encarregados podem finalizar fichas" }, { status: 403 });
        }

        const body = await request.json();
        const result = finalizarSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: "Dados inválidos", details: result.error.issues },
                { status: 400 }
            );
        }

        // Buscar ficha com avaliações
        const ficha = await prisma.fichaAcompanhamento.findUnique({
            where: { id: fichaId },
            include: {
                avaliacoes: true,
                aulas: true,
            },
        });

        if (!ficha) {
            return NextResponse.json({ error: "Ficha não encontrada" }, { status: 404 });
        }

        // Verificar se já está finalizada
        if (ficha.dataFinalizacao) {
            return NextResponse.json({ error: "Ficha já foi finalizada" }, { status: 400 });
        }

        // Calcular média final
        const notasValidas = ficha.avaliacoes
            .filter((a) => a.nota !== null)
            .map((a) => a.nota as number);

        const mediaFinal = notasValidas.length > 0
            ? notasValidas.reduce((a, b) => a + b, 0) / notasValidas.length
            : null;

        // Verificar requisitos para aprovação
        // Regra: média >= 7.0 e presença em pelo menos 15 aulas
        const aulasPresentes = ficha.aulas.filter((a) => a.presenca).length;
        const aprovadoPorMedia = mediaFinal !== null && mediaFinal >= 7.0;
        const aprovadoPorPresenca = aulasPresentes >= 15;

        // O valor de 'apto' vem do formulário, mas podemos validar:
        const { encarregadoLocal, resultadoFinal, apto } = result.data;

        // Atualizar ficha
        const fichaFinalizada = await prisma.fichaAcompanhamento.update({
            where: { id: fichaId },
            data: {
                mediaFinal,
                apto,
                resultadoFinal,
                encarregadoLocal,
                dataFinalizacao: new Date(),
            },
        });

        return NextResponse.json({
            ...fichaFinalizada,
            validacao: {
                aprovadoPorMedia,
                aprovadoPorPresenca,
                mediaCalculada: mediaFinal,
                aulasPresentes,
            },
        });
    } catch (error) {
        console.error("Erro ao finalizar ficha:", error);
        return NextResponse.json(
            { error: "Erro ao finalizar ficha" },
            { status: 500 }
        );
    }
}

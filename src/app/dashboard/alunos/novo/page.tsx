import { prisma } from "@/lib/prisma";
import { NovoAlunoForm } from "./form";

export default async function NovoAlunoPage() {
    const [instrumentos, fases, instrutores] = await Promise.all([
        prisma.instrumento.findMany({
            where: { ativo: true },
            orderBy: [{ categoria: "asc" }, { nome: "asc" }],
        }),
        prisma.fase.findMany({
            where: { ativo: true },
            orderBy: { ordem: "asc" },
        }),
        prisma.instrutor.findMany({
            include: { usuario: true },
            orderBy: { usuario: { nome: "asc" } },
        }),
    ]);

    return <NovoAlunoForm instrumentos={instrumentos} fases={fases} instrutores={instrutores} />;
}

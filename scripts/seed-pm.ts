
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding Programa Mínimo...");

    const violino = await prisma.instrumento.findUnique({
        where: { nome: "Violino" },
    });

    if (!violino) {
        console.error("❌ Violino não encontrado!");
        return;
    }

    const niveis = ["RJM", "CULTO", "OFICIALIZACAO"] as const;

    for (const nivel of niveis) {
        const pm = await prisma.programaMinimo.upsert({
            where: {
                instrumentoId_nivel: {
                    instrumentoId: violino.id,
                    nivel: nivel
                }
            },
            update: {},
            create: {
                instrumentoId: violino.id,
                nivel: nivel,
            }
        });

        // Adicionar itens de exemplo
        await prisma.programaMinimoItem.create({
            data: {
                programaMinimoId: pm.id,
                tipo: "METODO_INSTRUMENTO",
                descricao: `Método ${nivel} para Violino`,
                obrigatorio: true,
            }
        });
        console.log(`✅ ${nivel} criado`);
    }

    console.log("✅ Programa Mínimo concluído");
}

main()
    .catch((e) => {
        console.error("❌ Erro:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

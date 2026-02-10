import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const instrutores = await prisma.instrutor.findMany({
        select: {
            id: true,
            usuario: { select: { nome: true } },
            instrumentos: true
        }
    });

    const instrumentos = await prisma.instrumento.findMany();

    console.log("--- Instrutores e seus Instrumentos ---");
    instrutores.forEach(inst => {
        console.log(`${inst.usuario.nome}: ${JSON.stringify(inst.instrumentos)}`);
    });

    console.log("\n--- Instrumentos Cadastrados (Amostra) ---");
    instrumentos.slice(0, 5).forEach(inst => {
        console.log(`ID: ${inst.id}, Nome: ${inst.nome}`);
    });
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());

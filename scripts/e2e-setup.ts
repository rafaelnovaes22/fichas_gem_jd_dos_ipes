/**
 * Script para preparar o banco de dados local para testes E2E.
 *
 * 1. Aguarda o banco de dados ficar disponível
 * 2. Reseta o schema (drop + create)
 * 3. Executa o seed
 *
 * Requer:
 * - Docker rodando com postgres-test (npm run test:db:up)
 * - DATABASE_URL definida via .env.test (gerenciado pelo dotenv-cli)
 */

import { execSync } from "child_process";

function run(cmd: string, label: string) {
    console.log(`\n▶ ${label}...`);
    try {
        execSync(cmd, { stdio: "inherit" });
        console.log(`✅ ${label} concluído`);
    } catch {
        console.error(`❌ Falha em: ${label}`);
        process.exit(1);
    }
}

async function waitForDb(maxRetries = 15) {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    for (let i = 0; i < maxRetries; i++) {
        try {
            await prisma.$queryRaw`SELECT 1`;
            console.log("✅ Banco de dados disponível");
            await prisma.$disconnect();
            return;
        } catch {
            console.log(
                `⏳ Aguardando banco de dados... (${i + 1}/${maxRetries})`
            );
            await new Promise((r) => setTimeout(r, 2000));
        }
    }
    await prisma.$disconnect();
    console.error("❌ Banco de dados não respondeu a tempo");
    process.exit(1);
}

async function main() {
    console.log("🧪 Preparando banco de dados para testes E2E...");
    console.log(`   DATABASE_URL: ${process.env.DATABASE_URL}\n`);

    await waitForDb();

    // Reset completo: dropa e recria tudo
    run("npx prisma db push --force-reset --accept-data-loss", "Reset do schema");

    // Seed
    run("npx tsx prisma/seed.ts", "Seed do banco de dados");

    console.log("\n🎉 Banco de testes pronto!");
}

main();

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const force = process.argv.includes("--force");

async function main() {
    console.log("⚠️  ATENÇÃO: ESTE SCRIPT IRÁ APAGAR TODOS OS DADOS DO BANCO DE DADOS!");
    console.log("   Banco de dados alvo:", process.env.DATABASE_URL);

    if (!process.env.DATABASE_URL) {
        console.error("❌ DATABASE_URL não definida.");
        process.exit(1);
    }

    if (!force) {
        const readline = await import("readline");
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        const answer = await new Promise<string>(resolve => rl.question("Digite 'SIM' para confirmar: ", resolve));
        rl.close();
        if (answer.trim() !== "SIM") {
            console.log("Operação cancelada.");
            process.exit(0);
        }
    } else {
        console.log("🔧 Modo --force ativado, pulando confirmação.");
    }

    console.log("\n🗑️  Iniciando limpeza do banco de dados...\n");

    try {
        console.log("1/15  SessaoAulaRegistro...");
        await prisma.sessaoAulaRegistro.deleteMany({});

        console.log("2/15  SessaoAula...");
        await prisma.sessaoAula.deleteMany({});

        console.log("3/15  TurmaAluno...");
        await prisma.turmaAluno.deleteMany({});

        console.log("4/15  Turma...");
        await prisma.turma.deleteMany({});

        console.log("5/15  Avaliacao...");
        await prisma.avaliacao.deleteMany({});

        console.log("6/15  AulaRegistro...");
        await prisma.aulaRegistro.deleteMany({});

        console.log("7/15  FichaAcompanhamento...");
        await prisma.fichaAcompanhamento.deleteMany({});

        console.log("8/15  Aluno...");
        await prisma.aluno.deleteMany({});

        console.log("9/15  ProgramaMinimoItem...");
        await prisma.programaMinimoItem.deleteMany({});

        console.log("10/15 ProgramaMinimo...");
        await prisma.programaMinimo.deleteMany({});

        console.log("11/15 TopicoMSA...");
        await prisma.topicoMSA.deleteMany({});

        console.log("12/15 Fase...");
        await prisma.fase.deleteMany({});

        console.log("13/15 Instrumento...");
        await prisma.instrumento.deleteMany({});

        console.log("14/15 Instrutor...");
        await prisma.instrutor.deleteMany({});

        console.log("15/15 Usuario...");
        await prisma.usuario.deleteMany({});

        console.log("\n✅ Banco de dados limpo com sucesso!");
    } catch (error) {
        console.error("\n❌ Erro ao limpar banco de dados:", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();

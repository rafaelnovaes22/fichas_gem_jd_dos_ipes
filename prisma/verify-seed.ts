import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function verify() {
  const programas = await prisma.programaMinimo.count();
  const itens = await prisma.programaMinimoItem.count();
  const detalhes = await prisma.programaMinimo.findMany({
    include: {
      instrumento: { select: { nome: true } },
      _count: { select: { itens: true } }
    }
  });

  console.log(`✅ Programas Mínimos criados: ${programas}`);
  console.log(`✅ Total de itens: ${itens}\n`);

  console.log("📋 Detalhes:");
  for (const p of detalhes) {
    console.log(`  • ${p.instrumento.nome} - ${p.nivel} (${p._count.itens} itens)`);
  }

  await prisma.$disconnect();
}

verify().catch(console.error);

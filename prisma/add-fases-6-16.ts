import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Script para adicionar as fases 6-16 ao banco de dados existente.
 * Este script usa upsert para não duplicar dados.
 * 
 * Executar com: npx ts-node prisma/add-fases-6-16.ts
 */

async function main() {
    console.log("🌱 Adicionando fases 6-16 ao banco de dados...\n");

    const novasFases = [
        {
            nome: "Fase 6",
            descricao: "Tom e semitom",
            ordem: 6,
            topicos: [
                { numero: "6.1", titulo: "Tom e semitom" },
                { numero: "6.2", titulo: "Acidentes - sustenido e bemol" },
                { numero: "6.3", titulo: "Escalas" },
                { numero: "6.4", titulo: "Escalas diatônicas" },
                { numero: "6.5", titulo: "Escalas maiores" },
                { numero: "6.6", titulo: "Escalas maiores com sustenidos" },
                { numero: "6.7", titulo: "Escalas maiores com bemóis" },
            ]
        },
        {
            nome: "Fase 7",
            descricao: "Armadura de clave",
            ordem: 7,
            topicos: [
                { numero: "7.1", titulo: "Armadura de clave" },
                { numero: "7.2", titulo: "Fórmula de compasso em 9" },
                { numero: "7.3", titulo: "Movimento de solfejo em 9" },
                { numero: "7.4", titulo: "Movimento alternativo para solfejo em 9" },
                { numero: "7.5", titulo: "Fórmula de compasso em 12" },
                { numero: "7.6", titulo: "Movimento de solfejo em 12" },
                { numero: "7.7", titulo: "Movimento alternativo para solfejo em 12" },
            ]
        },
        {
            nome: "Fase 8",
            descricao: "Tonalidade",
            ordem: 8,
            topicos: [
                { numero: "8.1", titulo: "Tonalidade" },
                { numero: "8.2", titulo: "Acidentes ocorrentes e de precaução" },
            ]
        },
        {
            nome: "Fase 9",
            descricao: "Barra de compasso",
            ordem: 9,
            topicos: [
                { numero: "9.1", titulo: "Barra de compasso - repetição" },
            ]
        },
        {
            nome: "Fase 10",
            descricao: "Dinâmica",
            ordem: 10,
            topicos: [
                { numero: "10.1", titulo: "Dinâmica" },
            ]
        },
        {
            nome: "Fase 11",
            descricao: "Acento métrico",
            ordem: 11,
            topicos: [
                { numero: "11.1", titulo: "Acento métrico" },
                { numero: "11.2", titulo: "Compasso simples" },
                { numero: "11.3", titulo: "Compasso composto" },
                { numero: "11.4", titulo: "Compassos alternados" },
            ]
        },
        {
            nome: "Fase 12",
            descricao: "Síncopa",
            ordem: 12,
            topicos: [
                { numero: "12.1", titulo: "Síncopa" },
                { numero: "12.2", titulo: "Contratempo" },
            ]
        },
        {
            nome: "Fase 13",
            descricao: "Ritmos iniciais",
            ordem: 13,
            topicos: [
                { numero: "13.1", titulo: "Ritmos iniciais" },
            ]
        },
        {
            nome: "Fase 14",
            descricao: "Notas pontuadas",
            ordem: 14,
            topicos: [
                { numero: "14.1", titulo: "Notas pontuadas - diferenças na subdivisão" },
            ]
        },
        {
            nome: "Fase 15",
            descricao: "Andamento",
            ordem: 15,
            topicos: [
                { numero: "15.1", titulo: "Andamento" },
                { numero: "15.2", titulo: "Modificação de andamento - poco rallentando" },
                { numero: "15.3", titulo: "Modificação indevida de andamento" },
            ]
        },
        {
            nome: "Fase 16",
            descricao: "Frases e semifrases",
            ordem: 16,
            topicos: [
                { numero: "16.1", titulo: "Frases e semifrases" },
                { numero: "16.2", titulo: "Interpretação musical" },
                { numero: "16.3", titulo: "Indicações interpretativas" },
            ]
        }
    ];

    let fasesAdicionadas = 0;
    let topicosAdicionados = 0;

    for (const faseData of novasFases) {
        // Criar ou atualizar a Fase
        const fase = await prisma.fase.upsert({
            where: { nome: faseData.nome },
            update: { descricao: faseData.descricao, ordem: faseData.ordem },
            create: { nome: faseData.nome, descricao: faseData.descricao, ordem: faseData.ordem },
        });

        console.log(`✅ ${faseData.nome} - ${faseData.descricao}`);
        fasesAdicionadas++;

        // Criar ou atualizar Tópicos da Fase
        for (const topico of faseData.topicos) {
            const topicoExistente = await prisma.topicoMSA.findFirst({
                where: { faseId: fase.id, numero: topico.numero }
            });

            if (topicoExistente) {
                await prisma.topicoMSA.update({
                    where: { id: topicoExistente.id },
                    data: { titulo: topico.titulo }
                });
            } else {
                await prisma.topicoMSA.create({
                    data: {
                        faseId: fase.id,
                        numero: topico.numero,
                        titulo: topico.titulo
                    }
                });
            }
            topicosAdicionados++;
        }
    }

    console.log(`\n🎉 Migração concluída!`);
    console.log(`   📁 Fases processadas: ${fasesAdicionadas}`);
    console.log(`   📝 Tópicos processados: ${topicosAdicionados}`);

    // Verificar total de fases no banco
    const totalFases = await prisma.fase.count();
    const totalTopicos = await prisma.topicoMSA.count();
    console.log(`\n📊 Total no banco: ${totalFases} fases, ${totalTopicos} tópicos`);
}

main()
    .catch((e) => {
        console.error("❌ Erro na migração:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

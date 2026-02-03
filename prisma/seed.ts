import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Iniciando seed do banco de dados...");

    // Criar usuário admin
    const senhaHash = await bcrypt.hash("admin123", 10);

    const admin = await prisma.usuario.upsert({
        where: { email: "admin@gem.com.br" },
        update: {},
        create: {
            email: "admin@gem.com.br",
            senha: senhaHash,
            nome: "Administrador",
            role: "ADMIN",
            telefone: "(11) 99999-0000",
        },
    });

    console.log("✅ Usuário admin criado:", admin.email);

    // Criar usuário instrutor de exemplo
    const instrutorUser = await prisma.usuario.upsert({
        where: { email: "instrutor@gem.com.br" },
        update: {},
        create: {
            email: "instrutor@gem.com.br",
            senha: senhaHash,
            nome: "João Silva",
            role: "INSTRUTOR",
            telefone: "(11) 99999-1111",
        },
    });

    const instrutor = await prisma.instrutor.upsert({
        where: { usuarioId: instrutorUser.id },
        update: {},
        create: {
            usuarioId: instrutorUser.id,
            congregacao: "São Paulo - Central",
            instrumentos: ["Violino", "Viola"],
        },
    });

    console.log("✅ Instrutor criado:", instrutorUser.nome);

    // Criar instrumentos de exemplo
    // Criar instrumentos oficiais (MOO - Manual de Orientação Orquestral)
    const instrumentos = [
        // Família das Cordas
        { nome: "Violino", categoria: "Cordas" },
        { nome: "Viola", categoria: "Cordas" },
        { nome: "Violoncelo", categoria: "Cordas" },

        // Família das Madeiras
        { nome: "Flauta Transversal", categoria: "Madeiras" },
        { nome: "Oboé", categoria: "Madeiras" },
        { nome: "Oboé d'Amore", categoria: "Madeiras" },
        { nome: "Corne Inglês", categoria: "Madeiras" },
        { nome: "Fagote", categoria: "Madeiras" },
        { nome: "Clarinete", categoria: "Madeiras" },
        { nome: "Clarinete Alto", categoria: "Madeiras" },
        { nome: "Clarinete Baixo", categoria: "Madeiras" },

        // Família dos Saxofones
        { nome: "Saxofone Soprano", categoria: "Saxofones" },
        { nome: "Saxofone Alto", categoria: "Saxofones" },
        { nome: "Saxofone Tenor", categoria: "Saxofones" },
        { nome: "Saxofone Barítono", categoria: "Saxofones" },

        // Família dos Metais
        { nome: "Trompete", categoria: "Metais" },
        { nome: "Cornet", categoria: "Metais" },
        { nome: "Flugelhorn", categoria: "Metais" },
        { nome: "Trompa", categoria: "Metais" },
        { nome: "Trombone", categoria: "Metais" },
        { nome: "Trombonito", categoria: "Metais" },
        { nome: "Eufônio (Bombardino)", categoria: "Metais" },
        { nome: "Tuba", categoria: "Metais" },

        // Teclas e Outros
        { nome: "Órgão Eletrônico", categoria: "Teclas" },
    ];

    for (const inst of instrumentos) {
        await prisma.instrumento.upsert({
            where: { nome: inst.nome },
            update: inst,
            create: inst,
        });
    }

    console.log("✅ Instrumentos criados:", instrumentos.length);

    console.log("✅ Instrumentos criados:", instrumentos.length);

    // Criar Fases e Tópicos MSA (Baseado nas imagens)
    const fasesMsa = [
        {
            nome: "Fase 1",
            descricao: "Música e Som",
            ordem: 1,
            topicos: [
                { numero: "1.1", titulo: "Música e som" },
                { numero: "1.2", titulo: "Elementos da música" },
                { numero: "1.3", titulo: "Propriedades do som" },
                { numero: "1.4", titulo: "Notas musicais" },
                { numero: "1.5", titulo: "Pentagrama (pauta musical)" },
                { numero: "1.6", titulo: "Claves" },
            ]
        },
        {
            nome: "Fase 2",
            descricao: "Figuras e Compasso",
            ordem: 2,
            topicos: [
                { numero: "2.1", titulo: "Figuras musicais" },
                { numero: "2.2", titulo: "Compasso" },
                { numero: "2.3", titulo: "Barras de compasso simples, dupla e final" },
                { numero: "2.4", titulo: "Fórmula de compasso em 4" },
                { numero: "2.5", titulo: "Ritmo e pulsação" },
                { numero: "2.6", titulo: "Forma de realização dos exercícios rítmicos" },
            ]
        },
        {
            nome: "Fase 3",
            descricao: "Leitura Rítmica e Métrica",
            ordem: 3,
            topicos: [
                { numero: "3.1", titulo: "Endecagrama" },
                { numero: "3.2", titulo: "Leitura rítmica, leitura métrica e solfejo" },
                { numero: "3.3", titulo: "Movimentos de condução para solfejo" },
                { numero: "3.4", titulo: "Movimento de solfejo em 4" },
                { numero: "3.5", titulo: "Metrônomo" },
            ]
        },
        {
            nome: "Fase 4",
            descricao: "Ligadura e Intervalos",
            ordem: 4,
            topicos: [
                { numero: "4.1", titulo: "Ligadura" },
                { numero: "4.2", titulo: "Ponto de aumento" },
                { numero: "4.3", titulo: "Intervalo" },
                { numero: "4.4", titulo: "Fórmula de compasso em 3" },
                { numero: "4.5", titulo: "Movimento de solfejo em 3" },
                { numero: "4.6", titulo: "Fórmula de compasso em 2" },
                { numero: "4.7", titulo: "Movimento de solfejo em 2" },
            ]
        },
        {
            nome: "Fase 5",
            descricao: "Tercinas e Fermata",
            ordem: 5,
            topicos: [
                { numero: "5.1", titulo: "Tercinas" },
                { numero: "5.2", titulo: "Fermata" },
                { numero: "5.3", titulo: "Fórmula de compasso em 6" },
                { numero: "5.4", titulo: "Movimento de solfejo em 6" },
                { numero: "5.5", titulo: "Movimento alternativo para solfejo em 6" },
            ]
        }
    ];

    for (const faseData of fasesMsa) {
        // Criar ou atualizar a Fase
        const fase = await prisma.fase.upsert({
            where: { nome: faseData.nome },
            update: { descricao: faseData.descricao, ordem: faseData.ordem },
            create: { nome: faseData.nome, descricao: faseData.descricao, ordem: faseData.ordem },
        });

        // Criar ou atualizar Tópicos da Fase
        for (const topico of faseData.topicos) {
            // Buscando tópicos já existentes para não duplicar grosseiramente
            // Como não temos unique constraints complexas, vamos buscar pelo titulo E faseId
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
        }
    }

    console.log("✅ Fases e Tópicos MSA criados:", fasesMsa.length);

    // Criar aluno de exemplo
    const violino = await prisma.instrumento.findUnique({
        where: { nome: "Violino" },
    });
    const fase1 = await prisma.fase.findUnique({
        where: { nome: "Fase 1" },
    });

    if (violino && fase1) {
        const aluno = await prisma.aluno.create({
            data: {
                nome: "Maria Santos",
                dataNascimento: new Date("2010-05-15"),
                telefone: "(11) 98888-0000",
                email: "maria.santos@email.com",
                congregacao: "São Paulo - Central",
                instrutorId: instrutor.id,
                instrumentoId: violino.id,
                faseId: fase1.id,
                autorizacaoDados: true,
            },
        });

        // Criar ficha de acompanhamento para o aluno
        await prisma.fichaAcompanhamento.create({
            data: {
                alunoId: aluno.id,
                tipoAula: "TEORIA_MUSICAL",
            },
        });

        console.log("✅ Aluno de exemplo criado:", aluno.nome);
    }

    console.log("\n🎉 Seed concluído com sucesso!");
    console.log("\n📋 Credenciais de acesso:");
    console.log("  Admin: admin@gem.com.br / admin123");
    console.log("  Instrutor: instrutor@gem.com.br / admin123");
}

main()
    .catch((e) => {
        console.error("❌ Erro no seed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

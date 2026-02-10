import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Iniciando seed do banco de dados...");

    // Criar usuário ENCARREGADO (administrador principal, único por congregação)
    const senhaHash = await bcrypt.hash("admin123", 10);

    const encarregado = await prisma.usuario.upsert({
        where: { email: "encarregado@gem.com.br" },
        update: {},
        create: {
            email: "encarregado@gem.com.br",
            senha: senhaHash,
            nome: "Encarregado de Orquestra",
            role: "ENCARREGADO",
            telefone: "(11) 99999-0000",
        },
    });

    // Criar registro de Instrutor para o ENCARREGADO (ele também pode ensinar)
    await prisma.instrutor.upsert({
        where: { usuarioId: encarregado.id },
        update: {},
        create: {
            usuarioId: encarregado.id,
            congregacao: "Jardim dos Ipês",
            instrumentos: ["Violino"],
        },
    });

    console.log("✅ Encarregado de Orquestra criado:", encarregado.email);

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
            congregacao: "Jardim dos Ipês",
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
        },
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

    // Criar Programa Mínimo para Violino
    const violinoParaPM = await prisma.instrumento.findUnique({
        where: { nome: "Violino" },
    });

    if (violinoParaPM) {
        const niveis = ["RJM", "CULTO", "OFICIALIZACAO"] as const;

        for (const nivel of niveis) {
            const pm = await prisma.programaMinimo.upsert({
                where: {
                    instrumentoId_nivel: {
                        instrumentoId: violinoParaPM.id,
                        nivel: nivel
                    }
                },
                update: {},
                create: {
                    instrumentoId: violinoParaPM.id,
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
        }
        console.log("✅ Programa Mínimo criado para Violino");
    }

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

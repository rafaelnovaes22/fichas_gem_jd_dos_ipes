import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("🔧 Verificando usuário admin@gem.com.br...");

    const email = "admin@gem.com.br";
    const senha = "admin123";
    const senhaHash = await bcrypt.hash(senha, 10);

    // Verificar se existe
    const existingUser = await prisma.usuario.findUnique({
        where: { email },
    });

    if (existingUser) {
        console.log("⚠️ Usuário já existe. Atualizando senha e role...");
        await prisma.usuario.update({
            where: { email },
            data: {
                senha: senhaHash,
                role: "ADMIN", // Garantir role de ADMIN
                ativo: true,
            },
        });
        console.log("✅ Usuário atualizado com sucesso!");
    } else {
        console.log("⚠️ Usuário não encontrado. Criando novo...");
        const user = await prisma.usuario.create({
            data: {
                email,
                senha: senhaHash,
                nome: "Administrador do Sistema",
                role: "ADMIN",
                telefone: "(11) 99999-9999",
                ativo: true,
            },
        });

        // Criar registro de Instrutor para o ADMIN (opcional, mas bom para evitar erros em telas que buscam instrutor)
        // Como o admin pode não dar aula, vamos criar apenas se necessário, mas o sistema parece ligar usuários a instrutores.
        // Vamos criar um perfil de instrutor para ele para garantir acesso a tudo.
        await prisma.instrutor.create({
            data: {
                usuarioId: user.id,
                congregacao: "Administração",
                instrumentos: [],
            },
        });

        console.log("✅ Usuário criado com sucesso!");
    }

    console.log("\n📋 Credenciais confirmadas:");
    console.log(`  Email: ${email}`);
    console.log(`  Senha: ${senha}`);
}

main()
    .catch((e) => {
        console.error("❌ Erro ao corrigir admin:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

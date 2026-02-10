
import { prisma } from "@/lib/prisma";

async function verifyEncarregado() {
    console.log("Verificando registro de ENCARREGADO...");

    try {
        // Tentar buscar usuário com role ENCARREGADO
        const encarregado = await prisma.usuario.findFirst({
            where: {
                role: "ENCARREGADO",
                ativo: true,
            },
        });

        if (encarregado) {
            console.log("✅ ENCARREGADO encontrado:", encarregado.nome, `(${encarregado.email})`);
        } else {
            console.log("⚠️ Nenhum ENCARREGADO encontrado. Teste manual necessário.");
        }

        // Tentar simular a verificação da API check-encarregado
        const exists = !!encarregado;
        console.log("API check-encarregado retornaria:", { exists });

    } catch (error) {
        console.error("Erro ao verificar:", error);
    } finally {
        await prisma.$disconnect();
    }
}

verifyEncarregado();

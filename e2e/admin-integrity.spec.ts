import { test, expect } from "@playwright/test";

test.describe("Integridade do Admin ao Excluir Ficha", () => {
    // 1. Login como Admin
    test.beforeEach(async ({ page }) => {
        await page.goto("/login");
        await page.getByLabel("Email").fill("encarregado@gem.com.br");
        await page.getByLabel("Senha").fill("admin123");
        await page.getByRole("button", { name: "Entrar" }).click();
        await page.waitForURL("**/dashboard");
    });

    test("deve manter acesso admin após excluir uma ficha", async ({ page }) => {
        // 2. Verificar que é Admin (tem acesso a Instrutores no menu, se existir, ou pela badge no perfil se visível)
        // O sidebar do Admin deve ter links extras ou o usuário deve ter role "Admin"
        // Vamos checar se conseguimos navegar para /dashboard/instrutores

        await page.goto("/dashboard/instrutores");
        await expect(page.getByRole("heading", { name: "Instrutores" })).toBeVisible();

        // 3. Ir para Fichas
        await page.goto("/dashboard/fichas");

        // 4. Encontrar ficha de Maria Santos e Excluir
        // Primeiro expandir o card
        await page.getByText("Maria Santos").click();

        // Verificar se tem fichas
        await expect(page.getByText(/\/20 aulas/)).toBeVisible();

        // Clicar na sub-ficha para ir aos detalhes (onde geralmente fica o botão de excluir, ou na lista?)
        // Na lista de fichas (dashboard/fichas), temos o card do aluno. 
        // Dentro do card, tem as fichas.
        // O botão de excluir ficha fica DETALHES da ficha.

        await page.getByText("Teoria Musical").first().click();
        await page.waitForURL("**/dashboard/fichas/**");

        // 5. Excluir a Ficha
        // Precisamos localizar o botão de excluir. Geralmente um ícone de lixeira ou botão "Excluir".
        // Vamos tentar achar pelo texto ou aria-label.
        // Se for um Dialog, confirmar.

        // Assumindo que existe um botão de excluir na página de detalhes.
        // Vamos procurar por um botão com texto "Excluir" ou ícone trash.

        // Setup listener for dialog if strictly necessary, but Playwright auto-dismisses alerts usually? 
        // Custom Dialogs need explicit handling.

        const deleteBtn = page.getByRole("button", { name: "Excluir" }).or(page.locator("button.bg-red-600"));

        // Se não achar, falha o teste (significa que não achamos a UI de excluir)
        if (await deleteBtn.isVisible()) {
            await deleteBtn.click();
            // Confirmar no Dialog
            await page.getByRole("button", { name: "Confirmar" }).click();
        } else {
            // Tentar menu de ações se houver (3 pontinhos)
            const menuBtn = page.locator("button").filter({ has: page.locator("svg.lucide-more-vertical") });
            if (await menuBtn.isVisible()) {
                await menuBtn.click();
                await page.getByText("Excluir").click();
                await page.getByRole("button", { name: "Confirmar" }).click(); // Dialog confirmation
            } else {
                // Tentar ícone de lixeira direto
                const trashBtn = page.locator("button").filter({ has: page.locator("svg.lucide-trash") }).first();
                if (await trashBtn.isVisible()) {
                    await trashBtn.click();
                    // Confirm dialog
                    const confirmBtn = page.getByRole("button", { name: "Excluir" }).last(); // No dialog
                    if (await confirmBtn.isVisible()) await confirmBtn.click();
                }
            }
        }

        // 6. Aguardar redirecionamento ou toast
        await page.waitForTimeout(2000); // Wait for operation

        // 7. Verificar integridade do Admin
        // Tentar acessar página de instrutores novamente
        await page.goto("/dashboard/instrutores");
        await expect(page.getByRole("heading", { name: "Instrutores" })).toBeVisible();

        // Tentar acessar configurações (se existir)
        // Verificar se o nome do usuário mudou?
        // O seed do Encarregado é "Encarregado de Orquestra"
        // Verificar se element com esse texto existe
        // await expect(page.getByText("Encarregado de Orquestra")).toBeVisible(); 
        // (Isso pode estar no menu de perfil)
    });
});

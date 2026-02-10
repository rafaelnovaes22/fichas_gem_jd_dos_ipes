import { test, expect } from "@playwright/test";

test.describe("Formulário de Registro", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("deve exibir o formulário de registro corretamente", async ({ page }) => {
        await page.goto("/register");

        // Verificar título da página
        await expect(page.getByRole("heading", { name: "Cadastro de Instrutor" })).toBeVisible();

        // Verificar se todos os campos estão presentes
        await expect(page.getByLabel("Nome completo *")).toBeVisible();
        await expect(page.getByLabel("Email *")).toBeVisible();
        await expect(page.getByLabel("Telefone")).toBeVisible();
        // Usar IDs pois "Senha *" aparece em dois labels
        await expect(page.locator("#senha")).toBeVisible();
        await expect(page.locator("#confirmarSenha")).toBeVisible();

        // Congregação fixa (não é input, é um div)
        await expect(page.getByText("Jardim dos Ipês")).toBeVisible();

        // Seção de instrumentos
        await expect(page.getByText("Instrumentos que leciona *")).toBeVisible();

        // Botão de submissão
        await expect(page.getByRole("button", { name: "Criar conta" })).toBeVisible();

        // Link para login
        await expect(page.getByText("Faça login")).toBeVisible();
    });

    test("deve validar senha curta ao submeter", async ({ page }) => {
        await page.goto("/register");

        // Preencher dados com senha curta
        await page.getByLabel("Nome completo *").fill("Teste Nome");
        await page.getByLabel("Email *").fill("teste@teste.com");
        await page.locator("#senha").fill("123");
        await page.locator("#confirmarSenha").fill("123");

        // Selecionar um instrumento (primeiro checkbox disponível)
        await page.locator('[role="checkbox"]').first().click();

        // Submeter o formulário
        await page.getByRole("button", { name: "Criar conta" }).click();

        // A validação nativa do browser bloqueia o submit (minLength=6)
        const senhaInvalid = await page.locator("#senha").evaluate(
            (el: HTMLInputElement) => !el.validity.valid
        );
        expect(senhaInvalid).toBe(true);

        // Verificar que a página permanece no /register (não fez submit)
        expect(page.url()).toContain("/register");
    });

    test("deve validar senhas diferentes", async ({ page }) => {
        await page.goto("/register");

        // Preencher senha e confirmação diferentes
        await page.getByLabel("Nome completo *").fill("Teste Nome");
        await page.getByLabel("Email *").fill("teste@teste.com");
        await page.locator("#senha").fill("senha123456");
        await page.locator("#confirmarSenha").fill("senha654321");

        // Selecionar um instrumento
        await page.locator('[role="checkbox"]').first().click();

        // Submeter o formulário
        await page.getByRole("button", { name: "Criar conta" }).click();

        // Deve mostrar erro de senhas não coincidentes
        await expect(page.getByText("As senhas não coincidem")).toBeVisible();
    });

    test("deve validar instrumento obrigatório", async ({ page }) => {
        await page.goto("/register");

        // Preencher dados válidos mas NÃO selecionar instrumento
        await page.getByLabel("Nome completo *").fill("Teste Nome");
        await page.getByLabel("Email *").fill("teste@teste.com");
        await page.locator("#senha").fill("senha123456");
        await page.locator("#confirmarSenha").fill("senha123456");

        // Submeter o formulário sem selecionar instrumento
        await page.getByRole("button", { name: "Criar conta" }).click();

        // Deve mostrar erro de instrumento obrigatório
        await expect(page.getByText("Selecione pelo menos um instrumento que você leciona")).toBeVisible();
    });

    test("deve permitir registro de instrutor com dados válidos", async ({ page }) => {
        await page.goto("/register");

        // Preencher dados válidos para um instrutor
        await page.getByLabel("Nome completo *").fill("Teste Instrutor E2E");
        await page.getByLabel("Email *").fill(`teste.e2e.${Date.now()}@teste.com`);
        await page.getByLabel("Telefone").fill("(11) 99999-0000");
        await page.locator("#senha").fill("senha123456");
        await page.locator("#confirmarSenha").fill("senha123456");

        // Selecionar um instrumento (primeiro checkbox disponível)
        await page.locator('[role="checkbox"]').first().click();

        // Submeter o formulário
        await page.getByRole("button", { name: "Criar conta" }).click();

        // Deve exibir mensagem de sucesso
        await expect(page.getByText("Cadastro realizado!")).toBeVisible({ timeout: 10000 });
    });
});
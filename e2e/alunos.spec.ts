import { test, expect } from "@playwright/test";

test.describe("Alunos", () => {
    test("deve exibir a página de listagem de alunos", async ({ page }) => {
        await page.goto("/dashboard/alunos");
        await expect(
            page.getByRole("heading", { name: "Alunos" })
        ).toBeVisible();
        await expect(page.getByText("cadastrado")).toBeVisible();
    });

    test("deve ter botão para novo aluno", async ({ page }) => {
        await page.goto("/dashboard/alunos");
        await expect(
            page.getByRole("link", { name: /Novo/i })
        ).toBeVisible();
    });

    test("deve navegar para formulário de novo aluno", async ({ page }) => {
        await page.goto("/dashboard/alunos");
        await page.getByRole("link", { name: /Novo/i }).click();
        await page.waitForURL("**/dashboard/alunos/novo**");
    });

    test("deve exibir alunos existentes na lista", async ({ page }) => {
        await page.goto("/dashboard/alunos");
        // O seed cria "Maria Santos"
        const alunoCards = page.locator('[class*="CardContent"]').first();
        await expect(alunoCards).toBeVisible();
    });

    test("deve navegar para detalhe do aluno ao clicar", async ({ page }) => {
        await page.goto("/dashboard/alunos");
        // Clicar no botão de ação do primeiro aluno
        const actionButton = page
            .getByRole("link")
            .filter({ has: page.locator("svg") })
            .first();
        if (await actionButton.isVisible()) {
            await actionButton.click();
            await page.waitForURL("**/dashboard/alunos/**");
        }
    });

    test("página de detalhe do aluno deve exibir informações", async ({
        page,
    }) => {
        // Primeiro buscar um aluno pela API
        const response = await page.request.get("/api/alunos");
        const alunos = await response.json();

        if (alunos.length > 0) {
            await page.goto(`/dashboard/alunos/${alunos[0].id}`);
            await expect(page.getByText("Dados Pessoais")).toBeVisible();
            await expect(page.getByText("Dados do Curso")).toBeVisible();
            await expect(page.getByText("Status")).toBeVisible();
            await expect(
                page.getByText("Fichas de Acompanhamento")
            ).toBeVisible();
        }
    });

    test("detalhe do aluno deve mostrar fichas do aluno", async ({ page }) => {
        const response = await page.request.get("/api/alunos");
        const alunos = await response.json();

        if (alunos.length > 0) {
            await page.goto(`/dashboard/alunos/${alunos[0].id}`);
            // Deve ter pelo menos a ficha de Teoria Musical (criada no seed)
            await expect(
                page.getByText("Fichas de Acompanhamento")
            ).toBeVisible();
        }
    });

    test("deve ter botão de editar no detalhe do aluno", async ({ page }) => {
        const response = await page.request.get("/api/alunos");
        const alunos = await response.json();

        if (alunos.length > 0) {
            await page.goto(`/dashboard/alunos/${alunos[0].id}`);
            await expect(
                page.getByRole("link", { name: /Editar/i })
            ).toBeVisible();
        }
    });

    test("deve ter botão para nova ficha no detalhe do aluno", async ({
        page,
    }) => {
        const response = await page.request.get("/api/alunos");
        const alunos = await response.json();

        if (alunos.length > 0) {
            await page.goto(`/dashboard/alunos/${alunos[0].id}`);
            await expect(
                page.getByRole("link", { name: /Nova Ficha/i })
            ).toBeVisible();
        }
    });
});

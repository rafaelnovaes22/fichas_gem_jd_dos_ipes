import { test, expect } from "@playwright/test";

test.describe("Instrutores", () => {
    test("deve exibir a lista de instrutores", async ({ page }) => {
        await page.goto("/dashboard/instrutores");
        await expect(
            page.getByRole("heading", { name: "Instrutores" })
        ).toBeVisible();
    });

    test("deve listar instrutores do seed", async ({ page }) => {
        await page.goto("/dashboard/instrutores");
        // O seed cria "João Silva" como instrutor
        await expect(page.getByText("João Silva")).toBeVisible();
    });

    test("deve ter botão para novo instrutor", async ({ page }) => {
        await page.goto("/dashboard/instrutores");
        const novoBtn = page.getByRole("link", { name: /Novo/i });
        await expect(novoBtn).toBeVisible();
    });

    test("deve navegar para detalhe do instrutor", async ({ page }) => {
        const response = await page.request.get("/api/instrutores");
        const instrutores = await response.json();

        if (instrutores.length > 0) {
            await page.goto(`/dashboard/instrutores/${instrutores[0].id}`);
            await expect(page.getByText("João Silva")).toBeVisible();
        }
    });
});

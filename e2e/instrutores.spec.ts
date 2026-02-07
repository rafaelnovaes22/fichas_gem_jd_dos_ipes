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
        if (instrutores.length === 0) return;

        // Navigate to the first instrutor
        await page.goto(`/dashboard/instrutores/${instrutores[0].id}`);
        // Should show some info about the instrutor
        await expect(page.getByRole("heading", { name: instrutores[0].usuario.nome })).toBeVisible();
    });
});

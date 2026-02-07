import { test, expect } from "@playwright/test";

test.describe("Instrumentos", () => {
    test("deve exibir a lista de instrumentos", async ({ page }) => {
        await page.goto("/dashboard/instrumentos");
        await expect(
            page.getByRole("heading", { name: "Instrumentos" })
        ).toBeVisible();
    });

    test("deve listar instrumentos do seed", async ({ page }) => {
        await page.goto("/dashboard/instrumentos");
        // A tabela lista instrumentos por categoria - Violino está na seção Cordas
        await expect(page.getByText("Violino").first()).toBeVisible();
    });

    test("deve exibir categorias de instrumentos", async ({ page }) => {
        await page.goto("/dashboard/instrumentos");
        await expect(
            page.getByRole("heading", { name: "Cordas" })
        ).toBeVisible();
    });

    test("deve ter botão para novo instrumento", async ({ page }) => {
        await page.goto("/dashboard/instrumentos");
        await expect(
            page.getByRole("link", { name: /Novo Instrumento/i })
        ).toBeVisible();
    });
});

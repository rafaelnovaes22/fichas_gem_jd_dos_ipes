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
        await expect(page.getByText("Violino")).toBeVisible();
        await expect(page.getByText("Trompete")).toBeVisible();
    });

    test("deve exibir categorias de instrumentos", async ({ page }) => {
        await page.goto("/dashboard/instrumentos");
        await expect(page.getByText("Cordas")).toBeVisible();
        await expect(page.getByText("Metais")).toBeVisible();
    });

    test("deve ter botão para novo instrumento", async ({ page }) => {
        await page.goto("/dashboard/instrumentos");
        const novoBtn = page.getByRole("link", { name: /Novo/i });
        await expect(novoBtn).toBeVisible();
    });
});

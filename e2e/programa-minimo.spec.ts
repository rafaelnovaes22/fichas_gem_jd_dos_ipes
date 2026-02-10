import { test, expect } from "@playwright/test";

test.describe("Programa Mínimo", () => {
    test("deve exibir a página de programa mínimo", async ({ page }) => {
        await page.goto("/dashboard/aulas/programa-minimo");
        await expect(
            page.getByRole("heading", { name: "Programa Mínimo para Músicos" })
        ).toBeVisible();
    });

    test("deve exibir instrumentos com seus programas", async ({ page }) => {
        await page.goto("/dashboard/aulas/programa-minimo");

        // Verificar se há instrumentos listados (baseado no seed)
        await expect(page.getByText("Violino").first()).toBeVisible();
    });

    test("deve exibir níveis RJM, Culto e Oficialização", async ({ page }) => {
        await page.goto("/dashboard/aulas/programa-minimo");

        // Expandir um instrumento
        await page.getByText("Violino").first().click();

        // Verificar níveis
        await expect(page.getByText("RJM").first()).toBeVisible();
    });

    test("deve navegar da página de aulas para programa mínimo", async ({ page }) => {
        await page.goto("/dashboard/aulas");
        await page.getByRole("button", { name: "Ver" }).click();
        await expect(
            page.getByRole("heading", { name: "Programa Mínimo para Músicos" })
        ).toBeVisible();
    });
});

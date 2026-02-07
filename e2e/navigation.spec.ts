import { test, expect } from "@playwright/test";

test.describe("Navegação - Sidebar e Layout", () => {
    test("sidebar deve conter links principais", async ({ page }) => {
        await page.goto("/dashboard");
        await page.waitForLoadState("networkidle");

        await expect(
            page.getByRole("link", { name: /Dashboard/i }).first()
        ).toBeVisible();
        await expect(
            page.getByRole("link", { name: /Alunos/i }).first()
        ).toBeVisible();
        await expect(
            page.getByRole("link", { name: /Fichas/i }).first()
        ).toBeVisible();
    });

    test("deve navegar entre as páginas principais", async ({ page }) => {
        await page.goto("/dashboard");
        await page.getByRole("link", { name: /Alunos/i }).first().click();
        await page.waitForURL("**/dashboard/alunos**");
        await expect(
            page.getByRole("heading", { name: "Alunos" })
        ).toBeVisible();

        await page.getByRole("link", { name: /Fichas/i }).first().click();
        await page.waitForURL("**/dashboard/fichas**");
        await expect(
            page.getByRole("heading", { name: "Fichas de Acompanhamento" })
        ).toBeVisible();
    });

    test("deve navegar para instrumentos", async ({ page }) => {
        await page.goto("/dashboard/instrumentos");
        await expect(
            page.getByRole("heading", { name: "Instrumentos" })
        ).toBeVisible();
    });

    test("deve navegar para instrutores", async ({ page }) => {
        await page.goto("/dashboard/instrutores");
        await expect(
            page.getByRole("heading", { name: "Instrutores" })
        ).toBeVisible();
    });

    test("deve navegar para relatórios", async ({ page }) => {
        await page.goto("/dashboard/relatorios");
        await expect(
            page.getByRole("heading", { name: /Relat/i })
        ).toBeVisible();
    });

    test("deve navegar para aulas", async ({ page }) => {
        await page.goto("/dashboard/aulas");
        await expect(
            page.getByRole("heading", { name: "Aulas" })
        ).toBeVisible();
    });
});

test.describe("Navegação - Responsividade", () => {
    test.use({
        viewport: { width: 375, height: 812 },
    });

    test("mobile: deve exibir dashboard corretamente", async ({ page }) => {
        await page.goto("/dashboard");
        await expect(
            page.getByRole("heading", { name: "Dashboard" })
        ).toBeVisible();
    });

    test("mobile: deve exibir fichas corretamente", async ({ page }) => {
        await page.goto("/dashboard/fichas");
        await expect(
            page.getByRole("heading", { name: "Fichas de Acompanhamento" })
        ).toBeVisible();
    });

    test("mobile: deve exibir alunos corretamente", async ({ page }) => {
        await page.goto("/dashboard/alunos");
        await expect(
            page.getByRole("heading", { name: "Alunos" })
        ).toBeVisible();
    });
});

import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
    test("deve exibir o título do dashboard", async ({ page }) => {
        await page.goto("/dashboard");
        await expect(
            page.getByRole("heading", { name: "Dashboard" })
        ).toBeVisible();
    });

    test("deve exibir mensagem de boas-vindas", async ({ page }) => {
        await page.goto("/dashboard");
        await expect(page.getByText("Bem-vindo de volta")).toBeVisible();
    });

    test("deve exibir cards de estatísticas", async ({ page }) => {
        await page.goto("/dashboard");
        await expect(page.getByText("Total de Alunos")).toBeVisible();
        await expect(page.getByText("Fichas Ativas")).toBeVisible();
        await expect(page.getByText("Alunos Aptos")).toBeVisible();
    });

    test("admin deve ver card de Instrutores", async ({ page }) => {
        await page.goto("/dashboard");
        await expect(page.getByText("instrutores ativos")).toBeVisible();
    });

    test("deve exibir seção de alunos recentes", async ({ page }) => {
        await page.goto("/dashboard");
        await expect(
            page.getByRole("heading", { name: "Alunos Recentes" })
        ).toBeVisible();
    });

    test("deve exibir seção de avaliações pendentes", async ({ page }) => {
        await page.goto("/dashboard");
        await expect(
            page.getByRole("heading", { name: "Avaliações Pendentes" })
        ).toBeVisible();
    });

    test("links de navegação devem estar funcionais", async ({ page }) => {
        await page.goto("/dashboard");

        const verTodosLink = page
            .getByRole("link", { name: "Ver todos" })
            .first();
        await verTodosLink.click();
        await page.waitForURL("**/dashboard/alunos**");
        await expect(
            page.getByRole("heading", { name: "Alunos" })
        ).toBeVisible();
    });

    test("card de estatísticas deve navegar para a página correta", async ({
        page,
    }) => {
        await page.goto("/dashboard");
        await page.getByText("Total de Alunos").click();
        await page.waitForURL("**/dashboard/alunos**");
    });
});

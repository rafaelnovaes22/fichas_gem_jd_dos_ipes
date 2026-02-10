import { test, expect } from "@playwright/test";

test.describe("Autenticação", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("deve exibir a página de login", async ({ page }) => {
        await page.goto("/login");
        await expect(page.getByText("Bem-vindo de volta")).toBeVisible();
        await expect(page.getByLabel("Email")).toBeVisible();
        await expect(page.getByLabel("Senha")).toBeVisible();
        await expect(
            page.getByRole("button", { name: "Entrar" })
        ).toBeVisible();
    });

    test("deve exibir erro com credenciais inválidas", async ({ page }) => {
        await page.goto("/login");
        await page.getByLabel("Email").fill("invalido@teste.com");
        await page.getByLabel("Senha").fill("senhaerrada");
        await page.getByRole("button", { name: "Entrar" }).click();
        await expect(
            page.getByText("Email ou senha inválidos")
        ).toBeVisible();
    });

    test("deve fazer login com credenciais válidas (admin)", async ({
        page,
    }) => {
        await page.goto("/login");
        await page.getByLabel("Email").fill("encarregado@gem.com.br");
        await page.getByLabel("Senha").fill("admin123");
        await page.getByRole("button", { name: "Entrar" }).click();
        await page.waitForURL("**/dashboard**");
        await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    });

    test("deve fazer login com credenciais válidas (instrutor)", async ({
        page,
    }) => {
        await page.goto("/login");
        await page.getByLabel("Email").fill("instrutor@gem.com.br");
        await page.getByLabel("Senha").fill("admin123");
        await page.getByRole("button", { name: "Entrar" }).click();
        await page.waitForURL("**/dashboard**");
        await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    });

    test("deve redirecionar para login se não autenticado", async ({
        page,
    }) => {
        await page.goto("/dashboard");
        await page.waitForURL("**/login**");
        await expect(page.getByText("Bem-vindo de volta")).toBeVisible();
    });
});

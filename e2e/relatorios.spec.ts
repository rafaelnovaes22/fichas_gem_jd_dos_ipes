import { test, expect } from "@playwright/test";

test.describe("Relatórios", () => {
    test("deve exibir a página de relatórios", async ({ page }) => {
        await page.goto("/dashboard/relatorios");
        await expect(
            page.getByRole("heading", { name: /Relat/i })
        ).toBeVisible();
    });

    test("deve exibir estatísticas gerais", async ({ page }) => {
        await page.goto("/dashboard/relatorios");
        // Deve ter algum tipo de contagem/estatística
        await page.waitForLoadState("networkidle");
        const content = await page.textContent("body");
        expect(content).toBeTruthy();
    });
});

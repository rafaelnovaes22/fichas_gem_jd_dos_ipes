import { test as setup, expect } from "@playwright/test";

setup("authenticate as admin", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("encarregado@gem.com.br");
    await page.getByLabel("Senha").fill("admin123");
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.waitForURL("**/dashboard**");
    await expect(
        page.getByRole("heading", { name: "Dashboard" })
    ).toBeVisible();

    await page.context().storageState({ path: "./e2e/.auth/admin.json" });
});

import { Page, expect } from "@playwright/test";

/**
 * Login as a specific user via the UI.
 */
export async function login(page: Page, email: string, password: string) {
    await page.goto("/login");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Senha").fill(password);
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.waitForURL("**/dashboard**");
}

/**
 * Wait for page navigation to settle (Next.js client-side).
 */
export async function waitForPageLoad(page: Page) {
    await page.waitForLoadState("networkidle");
}

/**
 * Get text content trimmed from an element.
 */
export async function getTextContent(page: Page, selector: string) {
    const el = page.locator(selector).first();
    return (await el.textContent())?.trim() ?? "";
}

/**
 * Helper to create an aluno via API.
 */
export async function createAlunoViaAPI(
    page: Page,
    data: {
        nome: string;
        congregacao: string;
        instrumentoId: string;
        faseId: string;
    }
) {
    const response = await page.request.post("/api/alunos", { data });
    expect(response.ok()).toBeTruthy();
    return response.json();
}

/**
 * Helper to create a ficha via API.
 */
export async function createFichaViaAPI(
    page: Page,
    data: {
        alunoId: string;
        tipoAula: string;
    }
) {
    const response = await page.request.post("/api/fichas", { data });
    expect(response.ok()).toBeTruthy();
    return response.json();
}

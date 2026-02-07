import { test, expect } from "@playwright/test";

test.describe("Turmas (Aulas)", () => {
    test("deve exibir a página de aulas", async ({ page }) => {
        await page.goto("/dashboard/aulas");
        await expect(
            page.getByRole("heading", { name: "Aulas" })
        ).toBeVisible();
    });

    test("deve ter botão para nova turma", async ({ page }) => {
        await page.goto("/dashboard/aulas");
        await expect(
            page.getByRole("link", { name: /Nova Turma/i })
        ).toBeVisible();
    });

    test("deve navegar para formulário de nova turma", async ({ page }) => {
        await page.goto("/dashboard/aulas");
        await page.getByRole("link", { name: /Nova Turma/i }).click();
        await page.waitForURL("**/dashboard/aulas/turmas/nova**");
    });
});

test.describe("Turma - Criação e Detalhe via API", () => {
    test("deve criar uma turma via API", async ({ page }) => {
        const response = await page.request.post("/api/turmas", {
            data: {
                nome: "Turma Teste E2E",
                descricao: "Turma criada para testes",
                diaSemana: "SEGUNDA",
                horario: "14:00",
            },
        });
        expect(response.ok()).toBeTruthy();
        const turma = await response.json();
        expect(turma.nome).toBe("Turma Teste E2E");
    });

    test("deve listar turmas incluindo a criada", async ({ page }) => {
        const response = await page.request.get("/api/turmas");
        expect(response.ok()).toBeTruthy();
        const turmas = await response.json();
        expect(turmas.length).toBeGreaterThan(0);
    });

    test("deve navegar para detalhe da turma", async ({ page }) => {
        const response = await page.request.get("/api/turmas");
        const turmas = await response.json();
        if (turmas.length === 0) return;

        await page.goto(`/dashboard/aulas/turmas/${turmas[0].id}`);
        await expect(page.getByText(turmas[0].nome)).toBeVisible();
    });
});

test.describe("Sessões de Aula", () => {
    test("deve criar sessão via API", async ({ page }) => {
        const turmasRes = await page.request.get("/api/turmas");
        const turmas = await turmasRes.json();
        if (turmas.length === 0) return;

        const turmaId = turmas[0].id;
        const response = await page.request.post(
            `/api/turmas/${turmaId}/sessoes`,
            {
                data: {
                    data: new Date().toISOString(),
                    descricao: "Sessão de teste E2E",
                },
            }
        );
        expect(response.ok()).toBeTruthy();
        const sessao = await response.json();
        expect(sessao.descricao).toBe("Sessão de teste E2E");
    });

    test("deve listar sessões de uma turma", async ({ page }) => {
        const turmasRes = await page.request.get("/api/turmas");
        const turmas = await turmasRes.json();
        if (turmas.length === 0) return;

        const response = await page.request.get(
            `/api/turmas/${turmas[0].id}/sessoes`
        );
        expect(response.ok()).toBeTruthy();
        const sessoes = await response.json();
        expect(Array.isArray(sessoes)).toBeTruthy();
    });
});

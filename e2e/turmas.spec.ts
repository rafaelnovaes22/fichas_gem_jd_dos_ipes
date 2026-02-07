import { test, expect } from "@playwright/test";

test.describe("Turmas", () => {
    test("deve exibir a página de aulas/turmas", async ({ page }) => {
        await page.goto("/dashboard/aulas/turmas");
        await expect(
            page.getByRole("heading", { name: /Turma/i })
        ).toBeVisible();
    });

    test("deve ter botão para nova turma", async ({ page }) => {
        await page.goto("/dashboard/aulas/turmas");
        await expect(
            page.getByRole("link", { name: /Nov/i })
        ).toBeVisible();
    });

    test("deve navegar para formulário de nova turma", async ({ page }) => {
        await page.goto("/dashboard/aulas/turmas");
        await page.getByRole("link", { name: /Nov/i }).click();
        await page.waitForURL("**/dashboard/aulas/turmas/nova**");
    });
});

test.describe("Turma - Criação e Detalhe via API", () => {
    let turmaId: string;

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
        turmaId = turma.id;
        expect(turma.nome).toBe("Turma Teste E2E");
    });

    test("deve listar turmas incluindo a criada", async ({ page }) => {
        const response = await page.request.get("/api/turmas");
        expect(response.ok()).toBeTruthy();
        const turmas = await response.json();
        const found = turmas.find(
            (t: { nome: string }) => t.nome === "Turma Teste E2E"
        );
        expect(found).toBeTruthy();
    });

    test("deve navegar para detalhe da turma", async ({ page }) => {
        const response = await page.request.get("/api/turmas");
        const turmas = await response.json();
        const turma = turmas.find(
            (t: { nome: string }) => t.nome === "Turma Teste E2E"
        );
        if (turma) {
            await page.goto(`/dashboard/aulas/turmas/${turma.id}`);
            await expect(page.getByText("Turma Teste E2E")).toBeVisible();
        }
    });
});

test.describe("Sessões de Aula", () => {
    test("deve criar sessão via API", async ({ page }) => {
        // Buscar uma turma existente
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

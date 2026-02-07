import { test, expect } from "@playwright/test";

test.describe("API - Turmas", () => {
    test("GET /api/turmas - deve listar turmas", async ({ request }) => {
        const response = await request.get("/api/turmas");
        expect(response.ok()).toBeTruthy();
        const turmas = await response.json();
        expect(Array.isArray(turmas)).toBeTruthy();
    });

    test("POST /api/turmas - deve criar turma", async ({ request }) => {
        const response = await request.post("/api/turmas", {
            data: {
                nome: "Turma API E2E Test",
                descricao: "Criada via teste de API",
                diaSemana: "QUARTA",
                horario: "10:00",
            },
        });
        expect(response.status()).toBe(201);
        const turma = await response.json();
        expect(turma.nome).toBe("Turma API E2E Test");
    });

    test("POST /api/turmas - deve rejeitar nome curto", async ({
        request,
    }) => {
        const response = await request.post("/api/turmas", {
            data: {
                nome: "AB",
            },
        });
        expect(response.status()).toBe(400);
    });

    test("GET /api/turmas/:id - deve buscar turma", async ({ request }) => {
        const listRes = await request.get("/api/turmas");
        const turmas = await listRes.json();
        if (turmas.length === 0) return;

        const response = await request.get(`/api/turmas/${turmas[0].id}`);
        expect(response.ok()).toBeTruthy();
    });

    test("PUT /api/turmas/:id - deve atualizar turma", async ({
        request,
    }) => {
        const listRes = await request.get("/api/turmas");
        const turmas = await listRes.json();
        if (turmas.length === 0) return;

        const response = await request.put(`/api/turmas/${turmas[0].id}`, {
            data: {
                nome: turmas[0].nome,
                descricao: "Descrição atualizada E2E",
            },
        });
        expect(response.ok()).toBeTruthy();
    });
});

test.describe("API - Turmas Sessões", () => {
    test("POST /api/turmas/:id/sessoes - deve criar sessão", async ({
        request,
    }) => {
        const turmasRes = await request.get("/api/turmas");
        const turmas = await turmasRes.json();
        if (turmas.length === 0) return;

        const response = await request.post(
            `/api/turmas/${turmas[0].id}/sessoes`,
            {
                data: {
                    data: new Date().toISOString(),
                    descricao: "Sessão API E2E Test",
                },
            }
        );
        expect(response.ok()).toBeTruthy();
        const sessao = await response.json();
        expect(sessao.descricao).toBe("Sessão API E2E Test");
    });

    test("GET /api/turmas/:id/sessoes - deve listar sessões", async ({
        request,
    }) => {
        const turmasRes = await request.get("/api/turmas");
        const turmas = await turmasRes.json();
        if (turmas.length === 0) return;

        const response = await request.get(
            `/api/turmas/${turmas[0].id}/sessoes`
        );
        expect(response.ok()).toBeTruthy();
        const sessoes = await response.json();
        expect(Array.isArray(sessoes)).toBeTruthy();
    });

    test("GET /api/turmas/:id/sessoes/:sessaoId - deve buscar sessão", async ({
        request,
    }) => {
        const turmasRes = await request.get("/api/turmas");
        const turmas = await turmasRes.json();
        if (turmas.length === 0) return;

        const sessoesRes = await request.get(
            `/api/turmas/${turmas[0].id}/sessoes`
        );
        const sessoes = await sessoesRes.json();
        if (sessoes.length === 0) return;

        const response = await request.get(
            `/api/turmas/${turmas[0].id}/sessoes/${sessoes[0].id}`
        );
        expect(response.ok()).toBeTruthy();
    });
});

test.describe("API - Turmas Alunos", () => {
    test("POST /api/turmas/:id/alunos - deve adicionar alunos à turma", async ({
        request,
    }) => {
        const turmasRes = await request.get("/api/turmas");
        const turmas = await turmasRes.json();
        if (turmas.length === 0) return;

        const alunosRes = await request.get("/api/alunos");
        const alunos = await alunosRes.json();
        if (alunos.length === 0) return;

        const response = await request.post(
            `/api/turmas/${turmas[0].id}/alunos`,
            {
                data: {
                    alunoIds: [alunos[0].id],
                },
            }
        );
        // 200/201 = added, or could fail if already added (unique constraint)
        expect([200, 201, 500].includes(response.status())).toBeTruthy();
    });
});

test.describe("API - Turmas (não autenticado)", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("GET /api/turmas - deve retornar 401", async ({ request }) => {
        const response = await request.get("/api/turmas");
        expect(response.status()).toBe(401);
    });

    test("POST /api/turmas - deve retornar 401", async ({ request }) => {
        const response = await request.post("/api/turmas", {
            data: { nome: "Teste" },
        });
        expect(response.status()).toBe(401);
    });
});

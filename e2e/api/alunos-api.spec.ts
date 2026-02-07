import { test, expect } from "@playwright/test";

test.describe("API - Alunos", () => {
    let instrumentoId: string;
    let faseId: string;
    let createdAlunoId: string;

    test.beforeAll(async ({ request }) => {
        // Buscar IDs necessários para criar aluno
        const instrumentosRes = await request.get("/api/instrumentos");
        const instrumentos = await instrumentosRes.json();
        instrumentoId = instrumentos[0]?.id;

        const fasesRes = await request.get("/api/fases");
        const fases = await fasesRes.json();
        faseId = fases[0]?.id;
    });

    test("GET /api/alunos - deve listar alunos", async ({ request }) => {
        const response = await request.get("/api/alunos");
        expect(response.ok()).toBeTruthy();
        const alunos = await response.json();
        expect(Array.isArray(alunos)).toBeTruthy();
    });

    test("POST /api/alunos - deve criar aluno", async ({ request }) => {
        const response = await request.post("/api/alunos", {
            data: {
                nome: "Aluno Teste API E2E",
                congregacao: "Teste E2E",
                instrumentoId,
                faseId,
            },
        });
        expect(response.status()).toBe(201);
        const aluno = await response.json();
        expect(aluno.nome).toBe("Aluno Teste API E2E");
        createdAlunoId = aluno.id;
    });

    test("GET /api/alunos/:id - deve buscar aluno por ID", async ({
        request,
    }) => {
        // Buscar algum aluno existente
        const listRes = await request.get("/api/alunos");
        const alunos = await listRes.json();
        if (alunos.length === 0) return;

        const response = await request.get(`/api/alunos/${alunos[0].id}`);
        expect(response.ok()).toBeTruthy();
        const aluno = await response.json();
        expect(aluno.id).toBe(alunos[0].id);
    });

    test("POST /api/alunos - deve rejeitar dados inválidos", async ({
        request,
    }) => {
        const response = await request.post("/api/alunos", {
            data: {
                nome: "AB", // menos de 3 caracteres
                congregacao: "",
                instrumentoId: "",
                faseId: "",
            },
        });
        expect(response.status()).toBe(400);
    });

    test("PUT /api/alunos/:id - deve atualizar aluno", async ({
        request,
    }) => {
        const listRes = await request.get("/api/alunos");
        const alunos = await listRes.json();
        if (alunos.length === 0) return;

        const response = await request.put(`/api/alunos/${alunos[0].id}`, {
            data: {
                nome: alunos[0].nome,
                congregacao: alunos[0].congregacao,
                instrumentoId: alunos[0].instrumento.id,
                faseId: alunos[0].fase.id,
                telefone: "(11) 91234-5678",
            },
        });
        expect(response.ok()).toBeTruthy();
    });
});

test.describe("API - Alunos (não autenticado)", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("GET /api/alunos - deve retornar 401", async ({ request }) => {
        const response = await request.get("/api/alunos");
        expect(response.status()).toBe(401);
    });

    test("POST /api/alunos - deve retornar 401", async ({ request }) => {
        const response = await request.post("/api/alunos", {
            data: { nome: "Test" },
        });
        expect(response.status()).toBe(401);
    });
});

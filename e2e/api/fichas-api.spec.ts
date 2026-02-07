import { test, expect } from "@playwright/test";

test.describe("API - Fichas", () => {
    test("POST /api/fichas - deve criar ficha", async ({ request }) => {
        // Buscar aluno existente
        const alunosRes = await request.get("/api/alunos");
        const alunos = await alunosRes.json();
        if (alunos.length === 0) return;

        const response = await request.post("/api/fichas", {
            data: {
                alunoId: alunos[0].id,
                tipoAula: "SOLFEJO",
            },
        });
        expect(response.ok()).toBeTruthy();
        const ficha = await response.json();
        expect(ficha.tipoAula).toBe("SOLFEJO");
        expect(ficha.alunoId).toBe(alunos[0].id);
    });

    test("POST /api/fichas - deve rejeitar tipo de aula inválido", async ({
        request,
    }) => {
        const alunosRes = await request.get("/api/alunos");
        const alunos = await alunosRes.json();
        if (alunos.length === 0) return;

        const response = await request.post("/api/fichas", {
            data: {
                alunoId: alunos[0].id,
                tipoAula: "TIPO_INVALIDO",
            },
        });
        expect(response.status()).toBe(400);
    });

    test("POST /api/fichas - deve rejeitar sem alunoId", async ({
        request,
    }) => {
        const response = await request.post("/api/fichas", {
            data: {
                tipoAula: "SOLFEJO",
            },
        });
        expect(response.status()).toBe(400);
    });

    test("GET /api/alunos/:id - ficha incluída na resposta do aluno", async ({
        request,
    }) => {
        const alunosRes = await request.get("/api/alunos");
        const alunos = await alunosRes.json();
        if (alunos.length === 0) return;

        const alunoRes = await request.get(`/api/alunos/${alunos[0].id}`);
        const aluno = await alunoRes.json();
        expect(aluno.fichas).toBeDefined();
        expect(Array.isArray(aluno.fichas)).toBeTruthy();
    });
});

test.describe("API - Fichas Aulas e Avaliações", () => {
    let fichaId: string;

    test.beforeAll(async ({ request }) => {
        // Buscar uma ficha existente
        const alunosRes = await request.get("/api/alunos");
        const alunos = await alunosRes.json();
        if (alunos.length === 0) return;

        const alunoRes = await request.get(`/api/alunos/${alunos[0].id}`);
        const aluno = await alunoRes.json();
        if (aluno.fichas?.length > 0) {
            fichaId = aluno.fichas[0].id;
        }
    });

    test("POST /api/fichas/:id/aulas - deve salvar registro de aula", async ({
        request,
    }) => {
        if (!fichaId) return;

        // Buscar instrutor
        const instrutoresRes = await request.get("/api/instrutores");
        const instrutores = await instrutoresRes.json();
        if (instrutores.length === 0) return;

        const response = await request.post(`/api/fichas/${fichaId}/aulas`, {
            data: {
                numeroAula: 1,
                data: new Date().toISOString(),
                presenca: true,
                ausencia: false,
                anotacoes: "Teste E2E - aula registrada",
                instrutorId: instrutores[0].id,
                vistoInstrutor: false,
            },
        });
        expect(response.ok()).toBeTruthy();
    });

    test("GET /api/fichas/:id/aulas - deve listar aulas da ficha", async ({
        request,
    }) => {
        if (!fichaId) return;

        const response = await request.get(`/api/fichas/${fichaId}/aulas`);
        expect(response.ok()).toBeTruthy();
        const aulas = await response.json();
        expect(Array.isArray(aulas)).toBeTruthy();
    });

    test("POST /api/fichas/:id/avaliacoes - deve salvar avaliação", async ({
        request,
    }) => {
        if (!fichaId) return;

        const instrutoresRes = await request.get("/api/instrutores");
        const instrutores = await instrutoresRes.json();
        if (instrutores.length === 0) return;

        const response = await request.post(
            `/api/fichas/${fichaId}/avaliacoes`,
            {
                data: {
                    numeroAvaliacao: 1,
                    data: new Date().toISOString(),
                    nota: 8.5,
                    presenca: true,
                    ausencia: false,
                    anotacoes: "Teste E2E - avaliação",
                    instrutorId: instrutores[0].id,
                    vistoInstrutor: false,
                },
            }
        );
        expect(response.ok()).toBeTruthy();
    });

    test("GET /api/fichas/:id/avaliacoes - deve listar avaliações", async ({
        request,
    }) => {
        if (!fichaId) return;

        const response = await request.get(
            `/api/fichas/${fichaId}/avaliacoes`
        );
        expect(response.ok()).toBeTruthy();
        const avaliacoes = await response.json();
        expect(Array.isArray(avaliacoes)).toBeTruthy();
    });
});

test.describe("API - Fichas (não autenticado)", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("POST /api/fichas - deve retornar 401", async ({ request }) => {
        const response = await request.post("/api/fichas", {
            data: { alunoId: "xyz", tipoAula: "SOLFEJO" },
        });
        expect(response.status()).toBe(401);
    });
});

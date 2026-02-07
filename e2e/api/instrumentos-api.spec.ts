import { test, expect } from "@playwright/test";

test.describe("API - Instrumentos", () => {
    test("GET /api/instrumentos - deve listar instrumentos", async ({
        request,
    }) => {
        const response = await request.get("/api/instrumentos");
        expect(response.ok()).toBeTruthy();
        const instrumentos = await response.json();
        expect(Array.isArray(instrumentos)).toBeTruthy();
        expect(instrumentos.length).toBeGreaterThan(0);
    });

    test("GET /api/instrumentos - deve conter instrumentos do seed", async ({
        request,
    }) => {
        const response = await request.get("/api/instrumentos");
        const instrumentos = await response.json();
        const nomes = instrumentos.map((i: { nome: string }) => i.nome);
        expect(nomes).toContain("Violino");
        expect(nomes).toContain("Trompete");
        expect(nomes).toContain("Flauta Transversal");
    });

    test("POST /api/instrumentos - deve criar instrumento", async ({
        request,
    }) => {
        const response = await request.post("/api/instrumentos", {
            data: {
                nome: "Instrumento Teste E2E",
                categoria: "Teste",
            },
        });
        expect(response.ok()).toBeTruthy();
        const instrumento = await response.json();
        expect(instrumento.nome).toBe("Instrumento Teste E2E");
    });

    test("GET /api/instrumentos/:id - deve buscar instrumento", async ({
        request,
    }) => {
        const listRes = await request.get("/api/instrumentos");
        const instrumentos = await listRes.json();
        if (instrumentos.length === 0) return;

        const response = await request.get(
            `/api/instrumentos/${instrumentos[0].id}`
        );
        expect(response.ok()).toBeTruthy();
        const instrumento = await response.json();
        expect(instrumento.id).toBe(instrumentos[0].id);
    });
});

test.describe("API - Fases", () => {
    test("GET /api/fases - deve listar fases", async ({ request }) => {
        const response = await request.get("/api/fases");
        expect(response.ok()).toBeTruthy();
        const fases = await response.json();
        expect(Array.isArray(fases)).toBeTruthy();
        expect(fases.length).toBeGreaterThan(0);
    });

    test("GET /api/fases - deve conter fases do seed", async ({
        request,
    }) => {
        const response = await request.get("/api/fases");
        const fases = await response.json();
        const nomes = fases.map((f: { nome: string }) => f.nome);
        expect(nomes).toContain("Fase 1");
        expect(nomes).toContain("Fase 2");
    });

    test("GET /api/msa/fases - deve listar fases MSA com tópicos", async ({
        request,
    }) => {
        const response = await request.get("/api/msa/fases");
        expect(response.ok()).toBeTruthy();
        const fases = await response.json();
        expect(Array.isArray(fases)).toBeTruthy();
    });
});

test.describe("API - Instrutores", () => {
    test("GET /api/instrutores - deve listar instrutores", async ({
        request,
    }) => {
        const response = await request.get("/api/instrutores");
        expect(response.ok()).toBeTruthy();
        const instrutores = await response.json();
        expect(Array.isArray(instrutores)).toBeTruthy();
        expect(instrutores.length).toBeGreaterThan(0);
    });

    test("GET /api/instrutores/:id - deve buscar instrutor", async ({
        request,
    }) => {
        const listRes = await request.get("/api/instrutores");
        const instrutores = await listRes.json();
        if (instrutores.length === 0) return;

        const response = await request.get(
            `/api/instrutores/${instrutores[0].id}`
        );
        expect(response.ok()).toBeTruthy();
    });
});

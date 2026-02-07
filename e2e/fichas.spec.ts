import { test, expect } from "@playwright/test";

test.describe("Fichas de Acompanhamento", () => {
    test("deve exibir a página de fichas com título", async ({ page }) => {
        await page.goto("/dashboard/fichas");
        await expect(
            page.getByRole("heading", { name: "Fichas de Acompanhamento" })
        ).toBeVisible();
    });

    test("deve exibir contagem de alunos e fichas", async ({ page }) => {
        await page.goto("/dashboard/fichas");
        await expect(page.getByText(/aluno/i)).toBeVisible();
        await expect(page.getByText(/ficha/i)).toBeVisible();
    });

    test("deve exibir barra de busca", async ({ page }) => {
        await page.goto("/dashboard/fichas");
        await expect(
            page.getByPlaceholder("Buscar por nome do aluno...")
        ).toBeVisible();
    });

    test("deve exibir cards de alunos agrupados", async ({ page }) => {
        await page.goto("/dashboard/fichas");
        // Deve haver pelo menos um card de aluno (do seed)
        const alunoCards = page.locator("button.w-full.text-left");
        const count = await alunoCards.count();
        expect(count).toBeGreaterThan(0);
    });

    test("deve exibir badge com quantidade de fichas", async ({ page }) => {
        await page.goto("/dashboard/fichas");
        // Badge mostra "X de 4"
        await expect(page.getByText(/de 4/)).toBeVisible();
    });

    test("deve expandir card do aluno ao clicar", async ({ page }) => {
        await page.goto("/dashboard/fichas");
        // Clicar no primeiro card de aluno
        const firstCard = page.locator("button.w-full.text-left").first();
        await firstCard.click();

        // Deve mostrar a área expandida com sub-fichas
        await expect(page.locator(".border-t.bg-gray-50\\/50").first()).toBeVisible();
    });

    test("deve mostrar sub-fichas ao expandir", async ({ page }) => {
        await page.goto("/dashboard/fichas");
        const firstCard = page.locator("button.w-full.text-left").first();
        await firstCard.click();

        // Deve mostrar pelo menos uma sub-ficha com info de aulas
        await expect(page.getByText(/\/20 aulas/)).toBeVisible();
        await expect(page.getByText(/\/3 aval/)).toBeVisible();
    });

    test("sub-ficha deve mostrar status", async ({ page }) => {
        await page.goto("/dashboard/fichas");
        const firstCard = page.locator("button.w-full.text-left").first();
        await firstCard.click();

        // Deve mostrar status (Em andamento, APTO, ou N/APTO)
        const statusBadge = page.locator(
            ".border-t .rounded-full"
        );
        const count = await statusBadge.count();
        expect(count).toBeGreaterThan(0);
    });

    test("sub-ficha deve navegar para detalhe ao clicar", async ({
        page,
    }) => {
        await page.goto("/dashboard/fichas");
        const firstCard = page.locator("button.w-full.text-left").first();
        await firstCard.click();

        // Clicar na primeira sub-ficha (link dentro da área expandida)
        const subFichaLink = page
            .locator(".border-t a")
            .first();
        await subFichaLink.click();
        await page.waitForURL("**/dashboard/fichas/**");
    });

    test("deve colapsar card ao clicar novamente", async ({ page }) => {
        await page.goto("/dashboard/fichas");
        const firstCard = page.locator("button.w-full.text-left").first();

        // Expandir
        await firstCard.click();
        await expect(page.locator(".border-t.bg-gray-50\\/50").first()).toBeVisible();

        // Colapsar
        await firstCard.click();
        await expect(
            page.locator(".border-t.bg-gray-50\\/50")
        ).not.toBeVisible();
    });

    test("busca deve filtrar alunos por nome", async ({ page }) => {
        await page.goto("/dashboard/fichas");
        const searchInput = page.getByPlaceholder(
            "Buscar por nome do aluno..."
        );

        // Buscar por nome inexistente
        await searchInput.fill("XYZNomeInexistente123");
        await expect(page.getByText("Nenhum aluno encontrado")).toBeVisible();

        // Limpar busca
        await searchInput.clear();
        // Cards devem reaparecer
        const alunoCards = page.locator("button.w-full.text-left");
        const count = await alunoCards.count();
        expect(count).toBeGreaterThan(0);
    });

    test("deve mostrar tipo de aula com cores corretas nas sub-fichas", async ({
        page,
    }) => {
        await page.goto("/dashboard/fichas");
        const firstCard = page.locator("button.w-full.text-left").first();
        await firstCard.click();

        // Verificar que sub-fichas mostram labels de tipo
        const tipoLabels = [
            "Teoria Musical",
            "Solfejo",
            "Prática de Instrumento",
            "Hinário",
        ];
        const subFichaArea = page.locator(".border-t.bg-gray-50\\/50");
        const text = await subFichaArea.textContent();
        const hasAnyTipo = tipoLabels.some((label) => text?.includes(label));
        expect(hasAnyTipo).toBeTruthy();
    });
});

test.describe("Ficha Detalhe", () => {
    test("deve exibir a página de detalhe da ficha", async ({ page }) => {
        // Buscar uma ficha existente via API
        const alunosRes = await page.request.get("/api/alunos");
        const alunos = await alunosRes.json();
        if (alunos.length === 0) return;

        const alunoRes = await page.request.get(
            `/api/alunos/${alunos[0].id}`
        );
        const aluno = await alunoRes.json();
        if (!aluno.fichas || aluno.fichas.length === 0) return;

        await page.goto(`/dashboard/fichas/${aluno.fichas[0].id}`);
        // Deve mostrar o seletor de fichas
        await expect(
            page.getByText("Selecione a Ficha do Aluno")
        ).toBeVisible();
    });

    test("deve mostrar seletor de tipo de aula com 4 opções", async ({
        page,
    }) => {
        const alunosRes = await page.request.get("/api/alunos");
        const alunos = await alunosRes.json();
        if (alunos.length === 0) return;

        const alunoRes = await page.request.get(
            `/api/alunos/${alunos[0].id}`
        );
        const aluno = await alunoRes.json();
        if (!aluno.fichas || aluno.fichas.length === 0) return;

        await page.goto(`/dashboard/fichas/${aluno.fichas[0].id}`);
        await expect(page.getByText("Solfejo")).toBeVisible();
        await expect(page.getByText("Teoria Musical")).toBeVisible();
        await expect(page.getByText("Prática de Instrumento")).toBeVisible();
        await expect(page.getByText("Hinário")).toBeVisible();
    });

    test("deve exibir informações do aluno no cabeçalho", async ({
        page,
    }) => {
        const alunosRes = await page.request.get("/api/alunos");
        const alunos = await alunosRes.json();
        if (alunos.length === 0) return;

        const alunoRes = await page.request.get(
            `/api/alunos/${alunos[0].id}`
        );
        const aluno = await alunoRes.json();
        if (!aluno.fichas || aluno.fichas.length === 0) return;

        await page.goto(`/dashboard/fichas/${aluno.fichas[0].id}`);
        await expect(page.getByText(aluno.nome)).toBeVisible();
    });

    test("deve exibir tabela de aulas", async ({ page }) => {
        const alunosRes = await page.request.get("/api/alunos");
        const alunos = await alunosRes.json();
        if (alunos.length === 0) return;

        const alunoRes = await page.request.get(
            `/api/alunos/${alunos[0].id}`
        );
        const aluno = await alunoRes.json();
        if (!aluno.fichas || aluno.fichas.length === 0) return;

        await page.goto(`/dashboard/fichas/${aluno.fichas[0].id}`);
        // Desktop ou mobile, deve ter conteúdo de aulas
        await expect(page.getByText(/Aula/i).first()).toBeVisible();
    });
});

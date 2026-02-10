import { test, expect } from "@playwright/test";

test.describe("Fichas de Acompanhamento", () => {
    test("deve exibir a página de fichas com título", async ({ page }) => {
        await page.goto("/dashboard/fichas");
        await expect(
            page.getByRole("heading", { name: "Fichas de Acompanhamento" })
        ).toBeVisible();
    });

    test("deve exibir contagem de alunos e fichas no subtítulo", async ({
        page,
    }) => {
        await page.goto("/dashboard/fichas");
        // O subtítulo tem formato "X alunos • Y fichas"
        await expect(page.getByText(/\d+ aluno.*\d+ ficha/)).toBeVisible();
    });

    test("deve exibir barra de busca", async ({ page }) => {
        await page.goto("/dashboard/fichas");
        await expect(
            page.getByPlaceholder("Buscar por nome do aluno...")
        ).toBeVisible();
    });

    test("deve exibir cards de alunos agrupados", async ({ page }) => {
        await page.goto("/dashboard/fichas");
        // Deve haver pelo menos um nome de aluno visível (Maria Santos do seed)
        await expect(page.getByText("Maria Santos")).toBeVisible();
    });

    test("deve exibir badge com quantidade de fichas", async ({ page }) => {
        await page.goto("/dashboard/fichas");
        // Badge "X de 4"
        await expect(page.getByText(/\d de 4/).first()).toBeVisible();
    });

    test("deve expandir card do aluno ao clicar", async ({ page }) => {
        await page.goto("/dashboard/fichas");
        // Clicar no card de Maria Santos
        await page.getByText("Maria Santos").click();
        // Deve mostrar a sub-ficha com info de aulas
        await expect(page.getByText(/\/20 aulas/).first()).toBeVisible();
    });

    test("deve mostrar sub-fichas ao expandir", async ({ page }) => {
        await page.goto("/dashboard/fichas");
        await page.getByText("Maria Santos").click();

        await expect(page.getByText(/\/20 aulas/).first()).toBeVisible();
        await expect(page.getByText(/\/3 aval/).first()).toBeVisible();
    });

    test("sub-ficha deve mostrar status", async ({ page }) => {
        await page.goto("/dashboard/fichas");
        await page.getByText("Maria Santos").click();

        // Deve mostrar "Em andamento", "APTO" ou "N/APTO"
        await expect(
            page
                .getByText(/Em andamento|APTO|N\/APTO/)
                .first()
        ).toBeVisible();
    });

    test("sub-ficha deve navegar para detalhe ao clicar", async ({
        page,
    }) => {
        await page.goto("/dashboard/fichas");
        await page.getByText("Maria Santos").click();

        // Clicar na sub-ficha "Teoria Musical"
        await page.getByText("Teoria Musical").click();
        await page.waitForURL("**/dashboard/fichas/**");
    });

    test("deve colapsar card ao clicar novamente", async ({ page }) => {
        await page.goto("/dashboard/fichas");

        // Expandir
        await page.getByText("Maria Santos").click();
        await expect(page.getByText(/\/20 aulas/).first()).toBeVisible();

        // Colapsar - clicar no botão do card novamente
        await page.getByText("Maria Santos").click();
        await expect(page.getByText(/\/20 aulas/)).not.toBeVisible();
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
        await expect(page.getByText("Maria Santos")).toBeVisible();
    });

    test("deve mostrar tipo de aula nas sub-fichas", async ({ page }) => {
        await page.goto("/dashboard/fichas");
        await page.getByText("Maria Santos").click();

        // Verificar que sub-fichas mostram labels de tipo
        const tipoLabels = [
            "Teoria Musical",
            "Solfejo",
            "Prática de Instrumento",
            "Hinário",
        ];
        const hasAnyTipo = await Promise.any(
            tipoLabels.map((label) =>
                page
                    .getByText(label)
                    .first()
                    .isVisible()
                    .then((v) => (v ? true : Promise.reject()))
            )
        ).catch(() => false);
        expect(hasAnyTipo).toBeTruthy();
    });
});

test.describe("Ficha Detalhe", () => {
    // Helper: find an aluno that has fichas
    async function findAlunoWithFichas(page: import("@playwright/test").Page) {
        const alunosRes = await page.request.get("/api/alunos");
        const alunos = await alunosRes.json();
        for (const a of alunos) {
            const res = await page.request.get(`/api/alunos/${a.id}`);
            const aluno = await res.json();
            if (aluno.fichas?.length > 0) return aluno;
        }
        return null;
    }

    test("deve exibir a página de detalhe da ficha", async ({ page }) => {
        const aluno = await findAlunoWithFichas(page);
        if (!aluno) return;

        await page.goto(`/dashboard/fichas/${aluno.fichas[0].id}`);
        await expect(
            page.getByText("SELECIONE A FICHA DO ALUNO")
        ).toBeVisible();
    });

    test("deve mostrar seletor de tipo de aula com 4 opções", async ({
        page,
    }) => {
        const aluno = await findAlunoWithFichas(page);
        if (!aluno) return;

        await page.goto(`/dashboard/fichas/${aluno.fichas[0].id}`);
        // Usar seletor que busca apenas elementos visíveis ou dentro do container do card
        const cardSeletor = page.locator(".grid").first(); // Container dos cards

        await expect(cardSeletor.getByText("Solfejo")).toBeVisible();
        await expect(cardSeletor.getByText("Teoria Musical")).toBeVisible();
        await expect(
            cardSeletor.getByText(/Prática de Instrumento/i)
        ).toBeVisible();
        await expect(cardSeletor.getByText("Hinário")).toBeVisible();
    });

    test("deve exibir informações do aluno no cabeçalho", async ({
        page,
    }) => {
        const aluno = await findAlunoWithFichas(page);
        if (!aluno) return;

        await page.goto(`/dashboard/fichas/${aluno.fichas[0].id}`);
        // Buscar pelo nome do aluno que esteja visível (ignora o do header mobile hidden)
        // O header desktop tem o nome, e o card de detalhes também.
        // Vamos pegar o do Card de Detalhes (que é h1 ou p dependendo da sessão)
        // No desktop, temos um Card com "ALUNO" e o nome em seguida.

        const desktopCard = page.locator(".hidden.lg\\:block");
        await expect(desktopCard.getByText(aluno.nome).first()).toBeVisible();
    });

    test("deve exibir seção de aulas", async ({ page }) => {
        const aluno = await findAlunoWithFichas(page);
        if (!aluno) return;

        await page.goto(`/dashboard/fichas/${aluno.fichas[0].id}`);
        await expect(
            page.getByText("FICHA DE ACOMPANHAMENTO - GGEM")
        ).toBeVisible();
    });
});

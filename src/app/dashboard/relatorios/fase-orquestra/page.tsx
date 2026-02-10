import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FaseOrquestraView, FaseGroup } from "./fase-orquestra-view";

const FASE_LABELS: Record<string, string> = {
    ESTUDANDO: "Estudando (Iniciante)",
    ENSAIO_LOCAL: "Ensaio (GEM)",
    ENSAIO: "Ensaio",
    RJM: "RJM (Reunião de Jovens e Menores)",
    CULTO: "Culto Oficial",
    TROCA_INSTRUMENTO_CULTO: "Troca de Instrumento (Culto)",
    TROCA_INSTRUMENTO_OFICIALIZACAO: "Troca de Instrumento (Oficialização)",
    OFICIALIZACAO: "Oficialização",
    OFICIALIZADO: "Oficializado"
};

// Ordem personalizada para exibição
const FASE_ORDER = [
    "ESTUDANDO",
    "ENSAIO_LOCAL",
    "ENSAIO",
    "RJM",
    "CULTO",
    "OFICIALIZACAO",
    "OFICIALIZADO",
    "TROCA_INSTRUMENTO_CULTO",
    "TROCA_INSTRUMENTO_OFICIALIZACAO"
];

export default async function FaseOrquestraPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    const alunos = await prisma.aluno.findMany({
        where: { ativo: true },
        include: {
            instrumento: true,
            instrutor: {
                include: {
                    usuario: true
                }
            }
        },
        orderBy: { nome: "asc" }
    });

    // Processamento dos dados
    const groupedData: Record<string, FaseGroup> = {};

    // Inicializar grupos vazios para ordem consistente (opcional, ou construir dinamicamente)
    FASE_ORDER.forEach(faseKey => {
        groupedData[faseKey] = {
            fase: faseKey,
            label: FASE_LABELS[faseKey] || faseKey,
            categorias: [],
            totalAlunos: 0
        };
    });

    // Agrupar alunos
    alunos.forEach(aluno => {
        const faseKey = aluno.faseOrquestra;
        const categoriaNome = aluno.instrumento.categoria;
        const instrumentoNome = aluno.instrumento.nome;

        // Se a fase não estiver no mapa (caso tenha algum valor enum novo não mapeado), cria
        if (!groupedData[faseKey]) {
            groupedData[faseKey] = {
                fase: faseKey,
                label: FASE_LABELS[faseKey] || faseKey,
                categorias: [],
                totalAlunos: 0
            };
        }

        const faseGroup = groupedData[faseKey];
        faseGroup.totalAlunos++;

        // Encontrar ou criar categoria
        let categoriaGroup = faseGroup.categorias.find(c => c.nome === categoriaNome);
        if (!categoriaGroup) {
            categoriaGroup = { nome: categoriaNome, instrumentos: [], totalAlunos: 0 };
            faseGroup.categorias.push(categoriaGroup);
        }
        categoriaGroup.totalAlunos++;

        // Encontrar ou criar instrumento
        let instrumentoGroup = categoriaGroup.instrumentos.find(i => i.nome === instrumentoNome);
        if (!instrumentoGroup) {
            instrumentoGroup = { nome: instrumentoNome, alunos: [] };
            categoriaGroup.instrumentos.push(instrumentoGroup);
        }

        // Adicionar aluno
        instrumentoGroup.alunos.push({
            id: aluno.id,
            nome: aluno.nome,
            instrutorNome: aluno.instrutor.usuario.nome
        });
    });

    // Converter para array e filtrar fases vazias (opcional: manter vazias se quiser mostrar zerados)
    // Vamos manter apenas fases com alunos para limpar a view, ou todas? 
    // O usuário pediu "listar os alunos", então fases vazias podem não ser úteis.
    // Mas para dashboard é bom ver o que está vazio. Vamos manter as que definimos em FASE_ORDER
    // mas filtrar se não tiver alunos APENAS se quisermos esconder.
    // Vamos mostrar todas para dar a visão completa da orquestra.

    const result = Object.values(groupedData)
        .filter(g => FASE_ORDER.includes(g.fase) || g.totalAlunos > 0) // Mantém os ordenados + extras se houver
        .sort((a, b) => {
            const idxA = FASE_ORDER.indexOf(a.fase);
            const idxB = FASE_ORDER.indexOf(b.fase);
            // Se ambos estão na lista, ordena pela lista
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            // Se só A está, A vem antes
            if (idxA !== -1) return -1;
            // Se só B está, B vem antes
            if (idxB !== -1) return 1;
            // Se nenhum está, ordena alfabeticamente
            return a.label.localeCompare(b.label);
        });

    // Ordenar categorias e instrumentos internamente
    result.forEach(fase => {
        fase.categorias.sort((a, b) => a.nome.localeCompare(b.nome));
        fase.categorias.forEach(cat => {
            cat.instrumentos.sort((a, b) => a.nome.localeCompare(b.nome));
        });
    });

    return <FaseOrquestraView data={result} />;
}

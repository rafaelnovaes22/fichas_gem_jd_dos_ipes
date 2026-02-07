"use client";

import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Font,
} from "@react-pdf/renderer";

// Registrar fonte padrão (usando Helvetica que é built-in)
const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 10,
        fontFamily: "Helvetica",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
        paddingBottom: 10,
        borderBottomWidth: 2,
        borderBottomColor: "#1e40af",
    },
    logo: {
        width: 50,
        height: 50,
        backgroundColor: "#1e40af",
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    logoText: {
        color: "white",
        fontSize: 24,
        fontWeight: "bold",
    },
    headerTitle: {
        flex: 1,
        marginLeft: 15,
    },
    title: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#1e40af",
    },
    subtitle: {
        fontSize: 10,
        color: "#666",
        marginTop: 2,
    },
    formLabel: {
        fontSize: 8,
        color: "#666",
    },
    infoSection: {
        marginBottom: 15,
        padding: 10,
        backgroundColor: "#f8fafc",
        borderRadius: 4,
    },
    infoRow: {
        flexDirection: "row",
        marginBottom: 8,
    },
    infoLabel: {
        width: 100,
        fontWeight: "bold",
        color: "#374151",
    },
    infoValue: {
        flex: 1,
        color: "#111827",
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: "bold",
        marginBottom: 8,
        color: "#1e40af",
        backgroundColor: "#dbeafe",
        padding: 6,
        borderRadius: 4,
    },
    table: {
        marginBottom: 15,
    },
    tableHeader: {
        flexDirection: "row",
        backgroundColor: "#e5e7eb",
        paddingVertical: 6,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: "#9ca3af",
    },
    tableRow: {
        flexDirection: "row",
        paddingVertical: 4,
        paddingHorizontal: 4,
        borderBottomWidth: 0.5,
        borderBottomColor: "#d1d5db",
    },
    tableRowAlternate: {
        flexDirection: "row",
        paddingVertical: 4,
        paddingHorizontal: 4,
        borderBottomWidth: 0.5,
        borderBottomColor: "#d1d5db",
        backgroundColor: "#f9fafb",
    },
    colNumero: { width: 25, textAlign: "center" },
    colData: { width: 55, textAlign: "center" },
    colTopico: { width: 120, textAlign: "left" },
    colAnotacoes: { flex: 1, textAlign: "left" },
    colPresenca: { width: 25, textAlign: "center" },
    colAusencia: { width: 25, textAlign: "center" },
    colJust: { width: 30, textAlign: "center" },
    colVisto: { width: 50, textAlign: "center" },
    headerCell: {
        fontWeight: "bold",
        fontSize: 8,
        color: "#374151",
    },
    cell: {
        fontSize: 8,
        color: "#111827",
    },
    cellSmall: {
        fontSize: 7,
        color: "#6b7280",
    },
    avaliacaoTable: {
        marginBottom: 15,
    },
    colAvalNumero: { width: 40, textAlign: "center" },
    colAvalData: { width: 60, textAlign: "center" },
    colAvalNota: { width: 40, textAlign: "center" },
    colAvalAnotacoes: { flex: 1, textAlign: "left" },
    colAvalPresenca: { width: 30, textAlign: "center" },
    colAvalAusencia: { width: 30, textAlign: "center" },
    colAvalVisto: { width: 60, textAlign: "center" },
    resultSection: {
        marginTop: 15,
        padding: 12,
        backgroundColor: "#f0fdf4",
        borderRadius: 4,
        borderWidth: 1,
        borderColor: "#86efac",
    },
    resultRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    resultLabel: {
        fontWeight: "bold",
        color: "#166534",
    },
    resultValue: {
        fontWeight: "bold",
        color: "#15803d",
    },
    apto: {
        color: "#16a34a",
    },
    naoApto: {
        color: "#dc2626",
    },
    signatureSection: {
        marginTop: 20,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    signatureBox: {
        width: "45%",
        alignItems: "center",
    },
    signatureLine: {
        width: "100%",
        borderTopWidth: 1,
        borderTopColor: "#374151",
        marginTop: 30,
        paddingTop: 4,
    },
    signatureLabel: {
        fontSize: 8,
        color: "#6b7280",
        textAlign: "center",
    },
    footer: {
        position: "absolute",
        bottom: 20,
        left: 30,
        right: 30,
        textAlign: "center",
        fontSize: 8,
        color: "#9ca3af",
    },
    lgpdText: {
        fontSize: 7,
        color: "#6b7280",
        fontStyle: "italic",
        marginTop: 10,
        marginBottom: 10,
        textAlign: "center",
    },
    pageNumber: {
        position: "absolute",
        bottom: 20,
        right: 30,
        fontSize: 8,
        color: "#9ca3af",
    },
});

interface Aula {
    id: string;
    numeroAula: number;
    data: Date | null;
    anotacoes: string | null;
    presenca: boolean;
    ausencia: boolean;
    justificativa: string | null;
    vistoInstrutor: boolean;
    instrutor: { usuario: { nome: string } } | null;
    topicoMsa: { numero: string; titulo: string; fase: { nome: string } } | null;
}

interface Avaliacao {
    id: string;
    numeroAvaliacao: number;
    data: Date | null;
    nota: number | null;
    anotacoes: string | null;
    presenca: boolean;
    ausencia: boolean;
    justificativa: string | null;
    vistoInstrutor: boolean;
    instrutor: { usuario: { nome: string } } | null;
}

interface FichaPDFProps {
    ficha: {
        id: string;
        tipoAula: string;
        nivel: string | null;
        livro: string | null;
        mediaFinal: number | null;
        apto: boolean | null;
        encarregadoLocal: string | null;
        aluno: {
            nome: string;
            congregacao: string;
            instrumento: { nome: string };
            fase: { nome: string };
            instrutor: { usuario: { nome: string } };
            instrutor2?: { usuario: { nome: string } } | null;
        };
    };
    aulas: Aula[];
    avaliacoes: Avaliacao[];
}

const tipoAulaLabel: Record<string, string> = {
    SOLFEJO: "Solfejo",
    TEORIA_MUSICAL: "Teoria Musical",
    PRATICA_INSTRUMENTO: "Prática de Instrumento",
    HINARIO: "Hinário",
};

const justificativaLabel: Record<string, string> = {
    ENFERMIDADE: "E",
    TRABALHO: "T",
    VIAGEM: "V",
    OUTROS: "O",
};

function formatDate(date: Date | null | string): string {
    if (!date) return "-";
    const d = new Date(date);
    return d.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

export function FichaPDFDocument({ ficha, aulas, avaliacoes }: FichaPDFProps) {
    // Preencher array de 20 aulas
    const aulasCompletas = Array.from({ length: 20 }, (_, i) => {
        const aulaExistente = aulas.find((a) => a.numeroAula === i + 1);
        return (
            aulaExistente || {
                id: null as string | null,
                numeroAula: i + 1,
                data: null,
                anotacoes: "",
                presenca: false,
                ausencia: false,
                justificativa: null,
                vistoInstrutor: false,
                instrutor: null,
                topicoMsa: null,
            }
        );
    });

    // Preencher array de 3 avaliações
    const avaliacoesCompletas = Array.from({ length: 3 }, (_, i) => {
        const avalExistente = avaliacoes.find((a) => a.numeroAvaliacao === i + 1);
        return (
            avalExistente || {
                id: null as string | null,
                numeroAvaliacao: i + 1,
                data: null,
                nota: null,
                anotacoes: "",
                presenca: false,
                ausencia: false,
                justificativa: null,
                vistoInstrutor: false,
                instrutor: null,
            }
        );
    });

    // Calcular média
    const notasValidas = avaliacoesCompletas
        .filter((a) => a.nota !== null)
        .map((a) => a.nota as number);
    const mediaCalculada =
        notasValidas.length > 0
            ? notasValidas.reduce((a, b) => a + b, 0) / notasValidas.length
            : null;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.logo}>
                        <Text style={styles.logoText}>♪</Text>
                    </View>
                    <View style={styles.headerTitle}>
                        <Text style={styles.title}>FICHA DE ACOMPANHAMENTO - GEM</Text>
                        <Text style={styles.subtitle}>
                            Congregação Cristã no Brasil - {tipoAulaLabel[ficha.tipoAula] || ficha.tipoAula}
                        </Text>
                    </View>
                    <View>
                        <Text style={styles.formLabel}>Formulário M11</Text>
                    </View>
                </View>

                {/* Info Section */}
                <View style={styles.infoSection}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>ALUNO:</Text>
                        <Text style={styles.infoValue}>{ficha.aluno.nome}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>INSTRUMENTO:</Text>
                        <Text style={styles.infoValue}>{ficha.aluno.instrumento.nome}</Text>
                        <Text style={[styles.infoLabel, { marginLeft: 20 }]}>FASE:</Text>
                        <Text style={styles.infoValue}>{ficha.aluno.fase.nome}</Text>
                    </View>
                    {ficha.nivel && (
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>NÍVEL:</Text>
                            <Text style={styles.infoValue}>{ficha.nivel}</Text>
                        </View>
                    )}
                    {ficha.livro && (
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>LIVRO/MÉTODO:</Text>
                            <Text style={styles.infoValue}>{ficha.livro}</Text>
                        </View>
                    )}
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>CONGREGAÇÃO:</Text>
                        <Text style={styles.infoValue}>{ficha.aluno.congregacao}</Text>
                    </View>
                </View>

                {/* Aulas Table */}
                <Text style={styles.sectionTitle}>PROGRAMAÇÃO DE AULAS TEÓRICAS</Text>
                <View style={styles.table}>
                    {/* Header */}
                    <View style={styles.tableHeader}>
                        <Text style={[styles.headerCell, styles.colNumero]}>Nº</Text>
                        <Text style={[styles.headerCell, styles.colData]}>DATA</Text>
                        <Text style={[styles.headerCell, styles.colTopico]}>TÓPICO MSA</Text>
                        <Text style={[styles.headerCell, styles.colAnotacoes]}>ANOTAÇÕES</Text>
                        <Text style={[styles.headerCell, styles.colPresenca]}>P</Text>
                        <Text style={[styles.headerCell, styles.colAusencia]}>A</Text>
                        <Text style={[styles.headerCell, styles.colJust]}>JUST.</Text>
                        <Text style={[styles.headerCell, styles.colVisto]}>VISTO</Text>
                    </View>

                    {/* Rows */}
                    {aulasCompletas.map((aula, index) => (
                        <View
                            key={aula.numeroAula}
                            style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlternate}
                        >
                            <Text style={[styles.cell, styles.colNumero]}>
                                {String(aula.numeroAula).padStart(2, "0")}
                            </Text>
                            <Text style={[styles.cell, styles.colData]}>
                                {formatDate(aula.data)}
                            </Text>
                            <Text style={[styles.cellSmall, styles.colTopico]}>
                                {aula.topicoMsa
                                    ? `${aula.topicoMsa.numero} - ${aula.topicoMsa.titulo}`
                                    : ""}
                            </Text>
                            <Text style={[styles.cellSmall, styles.colAnotacoes]}>
                                {aula.anotacoes || ""}
                            </Text>
                            <Text style={[styles.cell, styles.colPresenca]}>
                                {aula.presenca ? "✓" : ""}
                            </Text>
                            <Text style={[styles.cell, styles.colAusencia]}>
                                {aula.ausencia ? "✓" : ""}
                            </Text>
                            <Text style={[styles.cell, styles.colJust]}>
                                {aula.justificativa ? justificativaLabel[aula.justificativa] : ""}
                            </Text>
                            <Text style={[styles.cellSmall, styles.colVisto]}>
                                {aula.vistoInstrutor
                                    ? aula.instrutor?.usuario.nome.split(" ")[0] || "Ok"
                                    : ""}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Avaliações Table */}
                <Text style={styles.sectionTitle}>AVALIAÇÕES</Text>
                <View style={styles.avaliacaoTable}>
                    {/* Header */}
                    <View style={styles.tableHeader}>
                        <Text style={[styles.headerCell, styles.colAvalNumero]}>AVAL. Nº</Text>
                        <Text style={[styles.headerCell, styles.colAvalData]}>DATA</Text>
                        <Text style={[styles.headerCell, styles.colAvalNota]}>NOTA</Text>
                        <Text style={[styles.headerCell, styles.colAvalAnotacoes]}>ANOTAÇÕES</Text>
                        <Text style={[styles.headerCell, styles.colAvalPresenca]}>P</Text>
                        <Text style={[styles.headerCell, styles.colAvalAusencia]}>A</Text>
                        <Text style={[styles.headerCell, styles.colAvalVisto]}>VISTO</Text>
                    </View>

                    {/* Rows */}
                    {avaliacoesCompletas.map((aval, index) => (
                        <View
                            key={aval.numeroAvaliacao}
                            style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlternate}
                        >
                            <Text style={[styles.cell, styles.colAvalNumero]}>
                                {String(aval.numeroAvaliacao).padStart(2, "0")}
                            </Text>
                            <Text style={[styles.cell, styles.colAvalData]}>
                                {formatDate(aval.data)}
                            </Text>
                            <Text style={[styles.cell, styles.colAvalNota]}>
                                {aval.nota !== null ? aval.nota.toFixed(1) : "-"}
                            </Text>
                            <Text style={[styles.cellSmall, styles.colAvalAnotacoes]}>
                                {aval.anotacoes || ""}
                            </Text>
                            <Text style={[styles.cell, styles.colAvalPresenca]}>
                                {aval.presenca ? "✓" : ""}
                            </Text>
                            <Text style={[styles.cell, styles.colAvalAusencia]}>
                                {aval.ausencia ? "✓" : ""}
                            </Text>
                            <Text style={[styles.cellSmall, styles.colAvalVisto]}>
                                {aval.vistoInstrutor
                                    ? aval.instrutor?.usuario.nome.split(" ")[0] || "Ok"
                                    : ""}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Resultado Final */}
                <View style={styles.resultSection}>
                    <View style={styles.resultRow}>
                        <Text style={styles.resultLabel}>MÉDIA FINAL:</Text>
                        <Text style={styles.resultValue}>
                            {mediaCalculada !== null ? mediaCalculada.toFixed(1) : "-"}
                        </Text>
                    </View>
                    <View style={styles.resultRow}>
                        <Text style={styles.resultLabel}>RESULTADO:</Text>
                        <Text
                            style={[
                                styles.resultValue,
                                ficha.apto === true
                                    ? styles.apto
                                    : ficha.apto === false
                                        ? styles.naoApto
                                        : {},
                            ]}
                        >
                            {ficha.apto === true
                                ? "APTO"
                                : ficha.apto === false
                                    ? "NÃO APTO"
                                    : "EM ANDAMENTO"}
                        </Text>
                    </View>
                    {ficha.encarregadoLocal && (
                        <View style={styles.resultRow}>
                            <Text style={styles.resultLabel}>ENCARREGADO LOCAL:</Text>
                            <Text style={styles.resultValue}>{ficha.encarregadoLocal}</Text>
                        </View>
                    )}
                </View>

                {/* LGPD */}
                <Text style={styles.lgpdText}>
                    &ldquo;Autorizo a Congregação Cristã no Brasil – CCB a tratar meus dados pessoais,
                    inclusive sensíveis, para a gestão da Música, os quais não serão divulgados a terceiros&rdquo;.
                </Text>

                {/* Assinaturas */}
                <View style={styles.signatureSection}>
                    <View style={styles.signatureBox}>
                        <View style={styles.signatureLine} />
                        <Text style={styles.signatureLabel}>
                            INSTRUTOR: {ficha.aluno.instrutor.usuario.nome}
                        </Text>
                    </View>
                    <View style={styles.signatureBox}>
                        <View style={styles.signatureLine} />
                        <Text style={styles.signatureLabel}>
                            ENCARREGADO LOCAL
                            {ficha.encarregadoLocal ? `: ${ficha.encarregadoLocal}` : ""}
                        </Text>
                    </View>
                </View>

                {/* Footer */}
                <Text style={styles.footer}>
                    Sistema GEM - Gestão de Ensino Musical | Congregação Cristã no Brasil
                </Text>
                <Text
                    style={styles.pageNumber}
                    render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
                    fixed
                />
            </Page>
        </Document>
    );
}

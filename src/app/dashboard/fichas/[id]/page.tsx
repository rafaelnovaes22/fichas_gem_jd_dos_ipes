import { notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Printer, BookOpen, GraduationCap, Music, FileText, ChevronRight } from "lucide-react";
import { FichaForm } from "./ficha-form";

interface FichaPageProps {
    params: Promise<{ id: string }>;
}

const tipoAulaConfig = {
    SOLFEJO: { label: "Solfejo", icon: Music, color: "bg-purple-100 text-purple-700 border-purple-200", bg: "bg-purple-50" },
    TEORIA_MUSICAL: { label: "Teoria Musical", icon: BookOpen, color: "bg-blue-100 text-blue-700 border-blue-200", bg: "bg-blue-50" },
    PRATICA_INSTRUMENTO: { label: "Prática de Instrumento", icon: GraduationCap, color: "bg-green-100 text-green-700 border-green-200", bg: "bg-green-50" },
    HINARIO: { label: "Hinário", icon: FileText, color: "bg-amber-100 text-amber-700 border-amber-200", bg: "bg-amber-50" },
};

export default async function FichaPage({ params }: FichaPageProps) {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    const ficha = await prisma.fichaAcompanhamento.findUnique({
        where: { id },
        include: {
            aluno: {
                include: {
                    instrutor: { include: { usuario: true } },
                    instrumento: true,
                    fase: true,
                },
            },
            aulas: {
                orderBy: { numeroAula: "asc" },
                include: { instrutor: { include: { usuario: true } } },
            },
            avaliacoes: {
                orderBy: { numeroAvaliacao: "asc" },
                include: { instrutor: { include: { usuario: true } } },
            },
        },
    });

    if (!ficha) {
        notFound();
    }

    // Verificar permissão
    const isAdmin = session?.user?.role === "ADMIN";
    if (!isAdmin && ficha.aluno.instrutor.usuarioId !== session?.user?.id) {
        notFound();
    }

    // Buscar todas as fichas do aluno para o seletor
    const todasFichas = await prisma.fichaAcompanhamento.findMany({
        where: { alunoId: ficha.aluno.id },
        orderBy: { createdAt: "asc" },
    });

    const currentConfig = tipoAulaConfig[ficha.tipoAula as keyof typeof tipoAulaConfig];
    const CurrentIcon = currentConfig?.icon || BookOpen;

    return (
        <div className="space-y-6">
            {/* Header Mobile - Simplificado */}
            <div className="lg:hidden">
                <div className="flex items-center gap-3 mb-4">
                    <Link href={`/dashboard/alunos/${ficha.aluno.id}`}>
                        <Button variant="ghost" size="icon" className="h-10 w-10">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-lg font-bold text-gray-900 truncate">
                            {ficha.aluno.nome}
                        </h1>
                        <p className="text-sm text-gray-500">
                            {currentConfig?.label || ficha.tipoAula}
                        </p>
                    </div>
                </div>
            </div>

            {/* Header Desktop */}
            <div className="hidden lg:flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={`/dashboard/alunos/${ficha.aluno.id}`}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Ficha de Acompanhamento
                        </h1>
                        <p className="text-gray-500">
                            {ficha.aluno.nome} • {currentConfig?.label || ficha.tipoAula}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Printer className="w-4 h-4 mr-2" />
                        Imprimir PDF
                    </Button>
                </div>
            </div>

            {/* Seletor de Fichas - Cards Responsivos */}
            <Card className="overflow-hidden">
                <CardHeader className="bg-gray-50 border-b pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                        Selecione a Ficha do Aluno
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {(Object.keys(tipoAulaConfig) as Array<keyof typeof tipoAulaConfig>).map((tipo) => {
                            const config = tipoAulaConfig[tipo];
                            const Icon = config.icon;
                            const fichaExistente = todasFichas.find(f => f.tipoAula === tipo);
                            const isActive = ficha.tipoAula === tipo;

                            return (
                                <Link
                                    key={tipo}
                                    href={fichaExistente ? `/dashboard/fichas/${fichaExistente.id}` : `#`}
                                    className={`relative group transition-all duration-200 ${
                                        !fichaExistente ? 'pointer-events-none opacity-60' : ''
                                    }`}
                                >
                                    <div
                                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                                            isActive
                                                ? `${config.color} border-current shadow-md`
                                                : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className={`p-2 rounded-lg ${isActive ? 'bg-white/50' : config.bg}`}>
                                                <Icon className={`w-5 h-5 ${isActive ? 'currentColor' : config.color.split(' ')[1]}`} />
                                            </div>
                                            {isActive && (
                                                <span className="flex h-3 w-3 relative">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-current"></span>
                                                </span>
                                            )}
                                        </div>
                                        <div className="mt-3">
                                            <p className={`font-semibold text-sm ${isActive ? 'text-current' : 'text-gray-700'}`}>
                                                {config.label}
                                            </p>
                                            <p className={`text-xs mt-1 ${isActive ? 'text-current/80' : 'text-gray-500'}`}>
                                                {fichaExistente
                                                    ? `Ficha cadastrada`
                                                    : `Não criada`
                                                }
                                            </p>
                                        </div>
                                        {isActive && (
                                            <div className="mt-3 flex items-center text-xs font-medium">
                                                <span>Visualizando</span>
                                                <ChevronRight className="w-4 h-4 ml-1" />
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Mensagem se faltar fichas */}
                    {todasFichas.length < 4 && (
                        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <p className="text-sm text-amber-800">
                                <strong>Atenção:</strong> Este aluno ainda não possui todas as fichas criadas.
                                {4 - todasFichas.length} ficha(s) pendente(s).
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Cabeçalho da Ficha - Versão Mobile */}
            <Card className="lg:hidden">
                <div className={`p-4 ${currentConfig?.bg || 'bg-gray-50'} border-b`}>
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${currentConfig?.color.split(' ')[0]}`}>
                            <CurrentIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Ficha Atual</p>
                            <h2 className="text-lg font-bold">{currentConfig?.label}</h2>
                        </div>
                    </div>
                </div>
                <CardContent className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Aluno</p>
                            <p className="font-medium text-sm">{ficha.aluno.nome}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Instrumento</p>
                            <p className="font-medium text-sm">{ficha.aluno.instrumento.nome}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Fase</p>
                            <p className="font-medium text-sm">{ficha.aluno.fase.nome}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Congregação</p>
                            <p className="font-medium text-sm">{ficha.aluno.congregacao}</p>
                        </div>
                    </div>

                    {/* Autorização LGPD */}
                    <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-600 italic border">
                        &ldquo;Autorizo a Congregação Cristã no Brasil – CCB a tratar meus dados pessoais,
                        inclusive sensíveis, para a gestão da Música, os quais não serão divulgados a terceiros&rdquo;.
                    </div>
                </CardContent>
            </Card>

            {/* Cabeçalho da Ficha - Versão Desktop */}
            <Card className="hidden lg:block">
                <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${currentConfig?.color.split(' ')[0]}`}>
                                <CurrentIcon className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Congregação Cristã no Brasil</p>
                                <h2 className="text-xl font-bold">FICHA DE ACOMPANHAMENTO - GEM</h2>
                                <p className="text-sm font-medium text-gray-600">{currentConfig?.label}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Formulário M11</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="md:col-span-2">
                            <p className="text-sm text-gray-500">ALUNO</p>
                            <p className="font-semibold text-lg">{ficha.aluno.nome}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">INSTRUMENTO</p>
                            <p className="font-semibold text-lg">{ficha.aluno.instrumento.nome}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">FASE</p>
                            <p className="font-semibold text-lg">{ficha.aluno.fase.nome}</p>
                        </div>
                        {ficha.nivel && (
                            <div>
                                <p className="text-sm text-gray-500">NÍVEL</p>
                                <p className="font-semibold">{ficha.nivel}</p>
                            </div>
                        )}
                        {ficha.livro && (
                            <div>
                                <p className="text-sm text-gray-500">LIVRO/MÉTODO</p>
                                <p className="font-semibold">{ficha.livro}</p>
                            </div>
                        )}
                    </div>

                    {/* Autorização LGPD */}
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600 italic">
                        &ldquo;Autorizo a Congregação Cristã no Brasil – CCB a tratar meus dados pessoais,
                        inclusive sensíveis, para a gestão da Música, os quais não serão divulgados a terceiros&rdquo;.
                    </div>
                </CardContent>
            </Card>

            {/* Formulário de Aulas e Avaliações */}
            <FichaForm
                fichaId={ficha.id}
                aulas={ficha.aulas}
                avaliacoes={ficha.avaliacoes}
                mediaFinal={ficha.mediaFinal}
                apto={ficha.apto}
                encarregadoLocal={ficha.encarregadoLocal}
                instrutorId={session?.user?.instrutorId || ""}
                tipoAula={ficha.tipoAula}
                nivel={ficha.nivel}
                livro={ficha.livro}
            />
        </div>
    );
}

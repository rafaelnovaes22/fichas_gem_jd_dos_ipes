import Link from "next/link";

export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
            {/* Header */}
            <header className="container mx-auto px-4 py-6">
                <nav className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/20">
                            <span className="text-2xl font-bold text-white">♪</span>
                        </div>
                        <span className="text-xl font-semibold text-white">GGEM</span>
                    </div>
                    <Link
                        href="/login"
                        className="px-6 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg border border-white/20 transition-all duration-300 font-medium"
                    >
                        Entrar
                    </Link>
                </nav>
            </header>

            {/* Hero Section */}
            <main className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                        Gestão de Grupo de Ensino
                        <span className="block bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">
                            Musical
                        </span>
                    </h1>
                    <p className="text-xl text-blue-100/80 mb-12 max-w-2xl mx-auto">
                        Sistema completo para acompanhamento de alunos de música.
                        Gerencie fichas, aulas teóricas, práticas e avaliações de forma digital.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/login"
                            className="px-8 py-4 bg-white text-blue-900 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-all duration-300 shadow-lg shadow-blue-900/20"
                        >
                            Acessar Sistema
                        </Link>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-3 gap-6 mt-24 max-w-5xl mx-auto">
                    <FeatureCard
                        icon="📋"
                        title="Fichas Digitais"
                        description="Controle completo das fichas de acompanhamento M11 de forma digital"
                    />
                    <FeatureCard
                        icon="📊"
                        title="Dashboard"
                        description="Visualize métricas, frequências e evolução dos alunos em tempo real"
                    />
                    <FeatureCard
                        icon="📄"
                        title="Relatórios"
                        description="Gere relatórios em PDF e Excel com todas as informações necessárias"
                    />
                    <FeatureCard
                        icon="🎵"
                        title="Aulas Teóricas"
                        description="Registre presença, anotações e visto do instrutor em cada aula"
                    />
                    <FeatureCard
                        icon="🎸"
                        title="Prática de Instrumento"
                        description="Acompanhe a evolução técnica de cada aluno no instrumento"
                    />
                    <FeatureCard
                        icon="✅"
                        title="Avaliações"
                        description="Registre notas, calcule médias e defina aptidão automaticamente"
                    />
                </div>
            </main>

            {/* Footer */}
            <footer className="container mx-auto px-4 py-8 mt-16 border-t border-white/10">
                <div className="text-center text-blue-200/60 text-sm">
                    <p>Sistema GGEM - Gestão de Grupo de Ensino Musical</p>
                    <p className="mt-1">Congregação Cristã no Brasil</p>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({
    icon,
    title,
    description,
}: {
    icon: string;
    title: string;
    description: string;
}) {
    return (
        <div className="group p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {icon}
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
            <p className="text-blue-100/70 text-sm leading-relaxed">{description}</p>
        </div>
    );
}

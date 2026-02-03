import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Users, FileText, CheckCircle2 } from "lucide-react";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500">
                    Bem-vindo de volta, {session?.user?.name?.split(" ")[0]}!
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total de Alunos"
                    value="--"
                    description="alunos ativos"
                    icon={GraduationCap}
                    color="blue"
                />
                <StatsCard
                    title="Instrutores"
                    value="--"
                    description="instrutores ativos"
                    icon={Users}
                    color="purple"
                />
                <StatsCard
                    title="Fichas Ativas"
                    value="--"
                    description="em andamento"
                    icon={FileText}
                    color="orange"
                />
                <StatsCard
                    title="Alunos Aptos"
                    value="--"
                    description="este período"
                    icon={CheckCircle2}
                    color="green"
                />
            </div>

            {/* Recent Activity */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Alunos Recentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-500">
                            Nenhum aluno cadastrado ainda.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Avaliações Pendentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-500">
                            Nenhuma avaliação pendente.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function StatsCard({
    title,
    value,
    description,
    icon: Icon,
    color,
}: {
    title: string;
    value: string;
    description: string;
    icon: React.ElementType;
    color: "blue" | "purple" | "orange" | "green";
}) {
    const colors = {
        blue: "bg-blue-50 text-blue-600",
        purple: "bg-purple-50 text-purple-600",
        orange: "bg-orange-50 text-orange-600",
        green: "bg-green-50 text-green-600",
    };

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">{title}</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
                        <p className="text-xs text-gray-400 mt-1">{description}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${colors[color]}`}>
                        <Icon className="w-6 h-6" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

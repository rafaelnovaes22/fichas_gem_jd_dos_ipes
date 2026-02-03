import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NovoInstrutorForm } from "./form";
import { redirect } from "next/navigation";

export default async function NovoInstrutorPage() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
        redirect("/dashboard");
    }

    const instrumentos = await prisma.instrumento.findMany({
        orderBy: { nome: "asc" },
    });

    return <NovoInstrutorForm instrumentosDisponiveis={instrumentos} />;
}

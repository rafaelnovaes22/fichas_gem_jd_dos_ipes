import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_ADMINS = 3;

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !isAdmin(session.user.role)) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const adminCount = await prisma.usuario.count({
        where: { role: "ADMIN", ativo: true }
    });

    return NextResponse.json({
        count: adminCount,
        limit: MAX_ADMINS,
        available: MAX_ADMINS - adminCount,
        limitReached: adminCount >= MAX_ADMINS,
    });
}

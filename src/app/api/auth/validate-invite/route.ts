import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");

    if (!code) {
        return NextResponse.json({ valid: false }, { status: 400 });
    }

    const encarregadoCode = process.env.ENCARREGADO_INVITE_CODE;
    const adminCode = process.env.ADMIN_INVITE_CODE;
    const instructorCode = process.env.INSTRUCTOR_INVITE_CODE;

    if (code === encarregadoCode) {
        return NextResponse.json({ valid: true, role: "ENCARREGADO" });
    } else if (code === adminCode) {
        return NextResponse.json({ valid: true, role: "ADMIN" });
    } else if (code === instructorCode) {
        return NextResponse.json({ valid: true, role: "INSTRUTOR" });
    } else {
        return NextResponse.json({ valid: false }, { status: 400 });
    }
}

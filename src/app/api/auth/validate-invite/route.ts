import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");

    if (!code) {
        return NextResponse.json({ valid: false }, { status: 400 });
    }

    const adminCode = process.env.ADMIN_INVITE_CODE;

    if (code === adminCode) {
        return NextResponse.json({ valid: true, role: "ENCARREGADO" });
    }

    return NextResponse.json({ valid: false }, { status: 400 });
}

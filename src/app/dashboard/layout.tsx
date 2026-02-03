import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AuthProvider } from "@/components/providers/auth-provider";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    return (
        <AuthProvider>
            <div className="min-h-screen bg-gray-50">
                {/* Mobile Navigation */}
                <MobileNav />

                {/* Desktop Sidebar */}
                <Sidebar className="hidden md:flex" />

                {/* Main Content */}
                <main className="md:pl-64 pt-16 md:pt-0">
                    <div className="p-4 md:p-6">{children}</div>
                </main>
            </div>
        </AuthProvider>
    );
}

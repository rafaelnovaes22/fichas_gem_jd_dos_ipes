"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    GraduationCap,
    FileText,
    ClipboardList,
    BarChart3,
    Settings,
    LogOut,
    Music,
    Layers,
} from "lucide-react";
import { ModeToggle } from "@/components/ui/mode-toggle";

const menuItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/alunos", label: "Alunos", icon: GraduationCap },
    { href: "/dashboard/instrutores", label: "Instrutores", icon: Users, adminOnly: true },
    { href: "/dashboard/fichas", label: "Fichas", icon: FileText },
    { href: "/dashboard/aulas", label: "Aulas", icon: ClipboardList },
    { href: "/dashboard/instrumentos", label: "Instrumentos", icon: Music, adminOnly: true },
    { href: "/dashboard/aulas/fases", label: "Fases", icon: Layers, adminOnly: true },
    { href: "/dashboard/relatorios", label: "Relatórios", icon: BarChart3 },
];

interface SidebarProps {
    className?: string;
}

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "ENCARREGADO";

    const filteredItems = menuItems.filter(
        (item) => !item.adminOnly || isAdmin
    );

    return (
        <aside className={cn("fixed left-0 top-0 z-40 h-screen w-64 bg-white dark:bg-zinc-950 border-r border-gray-200 dark:border-zinc-800", className)}>
            <div className="flex h-full flex-col">
                {/* Logo */}
                <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100 dark:border-zinc-800">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-xl font-bold text-white">♪</span>
                    </div>
                    <div>
                        <span className="text-lg font-bold text-gray-900 dark:text-gray-50">GGEM</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Gestão de Grupo de Ensino Musical</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-3 py-4">
                    <ul className="space-y-1">
                        {filteredItems.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;
                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                                            isActive
                                                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-900 hover:text-gray-900 dark:hover:text-gray-200"
                                        )}
                                    >
                                        <Icon className={cn("w-5 h-5", isActive && "text-blue-600")} />
                                        {item.label}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* User Section */}
                <div className="border-t border-gray-100 dark:border-zinc-800 p-4 bg-gray-50/50 dark:bg-zinc-900/50">
                    <div className="flex items-center gap-3 mb-3 px-2">
                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-700">
                                {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                {session?.user?.name || "Usuário"}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {session?.user?.role === "ADMIN" ? "Administrador" : "Instrutor"}
                            </p>
                        </div>
                        <ModeToggle />
                    </div>
                    <div className="flex gap-2">
                        <Link
                            href="/dashboard/configuracoes"
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                        >
                            <Settings className="w-4 h-4" />
                            Config
                        </Link>
                        <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                        >
                            <LogOut className="w-4 h-4" />
                            Sair
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
}

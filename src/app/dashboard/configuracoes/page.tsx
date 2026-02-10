
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions, isAdmin } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileForm } from "./profile-form";
import { PasswordForm } from "./password-form";
import { SystemSettings } from "./system-settings";
import { Settings, User, Shield } from "lucide-react";

export const metadata: Metadata = {
    title: "Configurações | GGEM",
    description: "Gerencie suas preferências e configurações do sistema",
};

export default async function SettingsPage() {
    const session = await getServerSession(authOptions);
    const isUserAdmin = session?.user?.role ? isAdmin(session.user.role) : false;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Settings className="w-6 h-6" />
                    Configurações
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Gerencie suas informações pessoais e preferências do sistema.
                </p>
            </div>

            <Tabs defaultValue="account" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="account" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Minha Conta
                    </TabsTrigger>
                    {isUserAdmin && (
                        <TabsTrigger value="system" className="flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            Sistema
                        </TabsTrigger>
                    )}
                </TabsList>
                <TabsContent value="account" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Perfil</CardTitle>
                                <CardDescription>
                                    Atualize suas informações pessoais de identificação.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ProfileForm />
                            </CardContent>
                        </Card>
                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Segurança</CardTitle>
                                <CardDescription>
                                    Gerencie sua senha de acesso.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <PasswordForm />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
                {isUserAdmin && (
                    <TabsContent value="system">
                        <SystemSettings />
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}

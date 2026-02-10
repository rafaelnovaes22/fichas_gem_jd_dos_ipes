"use client";

import { useRouter } from "next/navigation";
import { DeleteButton } from "./delete-button";
import { toast } from "sonner";

interface DeleteResourceButtonProps {
    id: string;
    endpoint: string;
    redirectUrl: string;
    resourceName: string;
    className?: string;
    disabled?: boolean;
}

export function DeleteResourceButton({
    id,
    endpoint,
    redirectUrl,
    resourceName,
    className,
    disabled
}: DeleteResourceButtonProps) {
    const router = useRouter();

    const handleDelete = async () => {
        try {
            const response = await fetch(endpoint, {
                method: "DELETE",
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Erro ao excluir");
            }

            toast.success(`${resourceName} excluído(a) com sucesso!`);
            router.push(redirectUrl);
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Erro ao excluir item");
            // Re-throw to let DeleteButton know it failed (though DeleteButton currently just logs)
            throw error;
        }
    };

    return (
        <DeleteButton
            onDelete={handleDelete}
            itemName={resourceName}
            className={className}
            disabled={disabled}
        />
    );
}

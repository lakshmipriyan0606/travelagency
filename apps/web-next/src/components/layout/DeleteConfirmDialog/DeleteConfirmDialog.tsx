import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    description?: string;
    onConfirm: () => void | Promise<void>;
}

export function DeleteConfirmDialog({
    open,
    onOpenChange,
    title = "Are you sure?",
    description = "This action cannot be undone. It will permanently delete this item.",
    onConfirm,
}: DeleteConfirmDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="bg-white rounded-3xl border-none shadow-2xl p-8 max-w-sm">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-2xl font-black text-neutral-800 tracking-tight">
                        {title}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-neutral-500 text-base font-medium mt-2 leading-relaxed">
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter className="mt-8 gap-4 flex-col sm:flex-row">
                    <AlertDialogCancel className="rounded-2xl px-6 py-3 font-bold text-neutral-500 hover:bg-neutral-100 border-none transition-all flex-1">
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault(); // Prevent closing before onConfirm if needed, but here we just want to execute.
                            onConfirm();
                            onOpenChange(false);
                        }}
                        className="rounded-2xl px-6 py-3 font-bold bg-red-500 text-white hover:bg-red-600 transition-all shadow-lg shadow-red-200 flex-[2] text-center"
                    >
                        Delete Permanently
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

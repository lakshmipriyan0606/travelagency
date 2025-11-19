import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogDescription,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import PrimaryButton from "@/components/Button/PrimaryButton";
import AnimatedButton from "@/components/Button/AnimatedButton/AnimatedButton";

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
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px] bg-white text-black border border-gray-300">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    <Button  className="hover:border transition-all duartion-900 cursor-pointer  hover:bg-white  bg-white" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>

                    <AnimatedButton
                        onClick={() => {
                            onConfirm();
                            onOpenChange(false);
                        }}
                        className="w-[200px]"
                        buttonText="Delete"
                    />
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

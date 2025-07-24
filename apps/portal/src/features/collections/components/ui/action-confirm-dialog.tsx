import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@ziron/ui/components/alert-dialog";
import { cn } from "@ziron/utils";

export const ActionConfirmDialog = ({
  open,
  onOpenChange,
  title = "Are you absolutely sure?",
  description = "This action cannot be undone. This will permanently delete your product and remove your data from servers.",
  onConfirm,
  className,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  onConfirm: () => void;
  className?: string;
  isLoading: boolean;
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isLoading}
            onClick={onConfirm}
            className={cn(
              "hover:from-destructive shadow-destructive/20 hover:to-destructive from-red-600 to-red-400 text-red-50 transition-colors ease-out",
              className,
            )}
          >
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

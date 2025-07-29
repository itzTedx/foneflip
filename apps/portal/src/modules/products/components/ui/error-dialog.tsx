import { useAtomValue } from "jotai";
import { parseAsBoolean, useQueryState } from "nuqs";

import { IconFileAlertFilled } from "@ziron/ui/assets/icons";
import { Badge } from "@ziron/ui/badge";
import {
  Dialog,
  DialogContainer,
  DialogContent,
  DialogContentContainer,
  DialogDescription,
  DialogHeader,
  DialogIcon,
  DialogTitle,
} from "@ziron/ui/dialog";
import { ScrollArea, ScrollBar } from "@ziron/ui/scroll-area";
import { pluralize } from "@ziron/utils";

import { isEditModeAtom, productErrorAtom } from "../../atom";

export const ErrorDialog = () => {
  const validationErrors = useAtomValue(productErrorAtom);
  const isEditMode = useAtomValue(isEditModeAtom); // if you have an atom for this
  const [isOpen, setIsOpen] = useQueryState("console", parseAsBoolean.withDefault(false));

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      {/* <DialogTrigger asChild>
        <Button
          disabled={validationErrors.length === 0}
          type="button"
          variant={validationErrors.length ? "destructive" : "ghost"}
        >
          <IconFileAlertFilled /> <span className={cn(validationErrors.length ? "" : "opacity-50")}>Console</span>
        </Button>
      </DialogTrigger> */}
      <DialogContent>
        <DialogContainer>
          <DialogIcon>
            <IconFileAlertFilled />
          </DialogIcon>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-1">
              Validation Failed{" "}
              <Badge className="text-foreground" variant="destructive">
                {pluralize("Error", validationErrors.length)}: {validationErrors.length}
              </Badge>
            </DialogTitle>
            <DialogDescription>Please fix the errors to {isEditMode ? "update" : "create"} product</DialogDescription>
          </DialogHeader>
        </DialogContainer>
        <DialogContentContainer className="gap-0 divide-y p-0">
          <ScrollArea className="max-h-80">
            {validationErrors.map((error, index) => (
              <div className="flex flex-col gap-1 p-3" key={index}>
                <div className="flex flex-row items-center justify-between gap-1">
                  <span className="font-mono text-[10px] text-muted-foreground">CODE: {error.code}</span>
                  <span className="font-mono text-[10px] text-destructive">
                    {"origin" in error ? (error.origin as string) : "unknown"}
                  </span>
                </div>
                <p className="font-medium text-destructive text-sm">{error.message}</p>
                <div className="font-mono text-[10px] text-muted-foreground">{error.path.join("/")}</div>
              </div>
            ))}
            <ScrollBar />
          </ScrollArea>
        </DialogContentContainer>
      </DialogContent>
    </Dialog>
  );
};

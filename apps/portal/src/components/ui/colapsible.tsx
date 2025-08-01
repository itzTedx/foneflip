"use client";

import * as React from "react";

import { AnimatePresence, type HTMLMotionProps, motion, type Transition } from "motion/react";
import { Collapsible as CollapsiblePrimitive } from "radix-ui";

type CollapsibleContextType = {
  isOpen: boolean;
};

const CollapsibleContext = React.createContext<CollapsibleContextType | undefined>(undefined);

const useCollapsible = (): CollapsibleContextType => {
  const context = React.useContext(CollapsibleContext);
  if (!context) {
    throw new Error("useCollapsible must be used within a Collapsible");
  }
  return context;
};

type CollapsibleProps = React.ComponentProps<typeof CollapsiblePrimitive.Root>;

function Collapsible({ children, ...props }: CollapsibleProps) {
  const [isOpen, setIsOpen] = React.useState(props?.open ?? props?.defaultOpen ?? false);

  React.useEffect(() => {
    if (props?.open !== undefined) setIsOpen(props.open);
  }, [props?.open]);

  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      setIsOpen(open);
      props.onOpenChange?.(open);
    },
    [props]
  );

  return (
    <CollapsibleContext.Provider value={{ isOpen }}>
      <CollapsiblePrimitive.Root data-slot="collapsible" {...props} onOpenChange={handleOpenChange}>
        {children}
      </CollapsiblePrimitive.Root>
    </CollapsibleContext.Provider>
  );
}

type CollapsibleTriggerProps = React.ComponentProps<typeof CollapsiblePrimitive.Trigger>;

function CollapsibleTrigger(props: CollapsibleTriggerProps) {
  return <CollapsiblePrimitive.Trigger data-slot="collapsible-trigger" {...props} />;
}

type CollapsibleContentProps = React.ComponentProps<typeof CollapsiblePrimitive.Content> &
  HTMLMotionProps<"div"> & {
    transition?: Transition;
  };

function CollapsibleContent({
  className,
  children,
  transition = { type: "spring", stiffness: 150, damping: 22 },
  ...props
}: CollapsibleContentProps) {
  const { isOpen } = useCollapsible();

  return (
    <AnimatePresence>
      {isOpen && (
        <CollapsiblePrimitive.Content asChild forceMount {...props}>
          <motion.div
            animate={{ opacity: 1, height: "auto", overflow: "hidden" }}
            className={className}
            data-slot="collapsible-content"
            exit={{ opacity: 0, height: 0, overflow: "hidden" }}
            initial={{ opacity: 0, height: 0, overflow: "hidden" }}
            key="collapsible-content"
            layout
            transition={transition}
            {...props}
          >
            {children}
          </motion.div>
        </CollapsiblePrimitive.Content>
      )}
    </AnimatePresence>
  );
}

export {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
  useCollapsible,
  type CollapsibleContextType,
  type CollapsibleProps,
  type CollapsibleTriggerProps,
  type CollapsibleContentProps,
};

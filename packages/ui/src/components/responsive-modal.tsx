"use client";

import React from "react";

import { cn } from "@ziron/utils";

import { useIsMobile } from "../hooks/use-mobile";
import {
  Dialog,
  DialogContainer,
  DialogContent,
  DialogContentContainer,
  DialogDescription,
  DialogHeader,
  DialogIcon,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "./drawer";

// Use a union of Dialog and Drawer props for extra flexibility
// This will allow passing any valid prop to either Dialog or Drawer

interface Props {
  children: React.ReactNode;
  isOpen?: boolean;
  trigger?: React.ReactNode;
  closeModal?: (value: boolean) => void;
  title?: React.ReactNode;
  description?: string;
  className?: string;
  dialogClassName?: string;
  extraProps?: Record<string, unknown>;
  icon?: React.ReactNode;
}

export const ResponsiveModal = ({
  children,
  className,
  dialogClassName,
  isOpen,
  closeModal,
  trigger,
  title,
  description,
  icon,
  extraProps = {},
}: Props) => {
  const isMobile = useIsMobile();

  // asChild is true if trigger is provided, otherwise false
  const asChild = !!trigger;

  if (isMobile) {
    return (
      <Drawer onOpenChange={closeModal} open={isOpen} {...extraProps}>
        {trigger && <DrawerTrigger asChild={asChild}>{trigger}</DrawerTrigger>}
        <DrawerContent>
          {(title || description) && (
            <DrawerHeader>
              {title && <DrawerTitle>{title}</DrawerTitle>}
              {description && <DrawerDescription>{description}</DrawerDescription>}
            </DrawerHeader>
          )}
          {children}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog onOpenChange={closeModal} open={isOpen} {...extraProps}>
      {trigger && <DialogTrigger asChild={asChild}>{trigger}</DialogTrigger>}
      <DialogContent className={cn("gap-0 p-0", dialogClassName, className)}>
        {(title || description) && (
          <DialogContainer>
            {icon && <DialogIcon>{icon}</DialogIcon>}
            <DialogHeader>
              {title && <DialogTitle>{title}</DialogTitle>}
              {description && <DialogDescription>{description}</DialogDescription>}
            </DialogHeader>
          </DialogContainer>
        )}
        <DialogContentContainer>{children}</DialogContentContainer>
      </DialogContent>
    </Dialog>
  );
};

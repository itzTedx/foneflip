"use client";

import { memo, useCallback, useState } from "react";

import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IconGripVertical, IconPlus, IconTrash } from "@tabler/icons-react";
import { ChevronsUpDown } from "lucide-react";

import { Button } from "@ziron/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ziron/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@ziron/ui/collapsible";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFieldArray,
  useFormContext,
} from "@ziron/ui/form";
import { Input } from "@ziron/ui/input";
import { cn } from "@ziron/utils";
import { ProductFormType } from "@ziron/validators";

import { TabNavigation } from "@/components/ui/tab-navigation";

import { PhysicalSpecsCard } from "./fields/physical-specs-card";
import { ShippingHandlingCard } from "./fields/shipping-handling-card";

interface SpecificationItemProps {
  index: number;
  onRemove: (index: number) => void;
  isEditMode: boolean;
  totalFields: number;
  id: string;
}

const SpecificationItem = memo(function SpecificationItem({
  index,
  onRemove,
  isEditMode,
  totalFields,
  id,
}: SpecificationItemProps) {
  const { control, watch } = useFormContext<ProductFormType>();
  const name = watch(`specifications.${index}.name`);
  const value = watch(`specifications.${index}.value`);

  const [isOpen, setIsOpen] = useState(() => (isEditMode ? totalFields < 3 : true));

  // dnd-kit sortable
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Collapsible className="overflow-hidden rounded-md border" onOpenChange={setIsOpen} open={isOpen}>
        <div className="flex items-center justify-between bg-input/30 pr-3 pl-1">
          <div className="flex w-full items-center gap-2">
            <Button
              className="w-fit cursor-grab text-muted-foreground/60"
              size="icon"
              type="button"
              variant="ghost"
              {...listeners}
            >
              <IconGripVertical />
            </Button>
            <CollapsibleTrigger asChild>
              <h2 className="w-full cursor-pointer font-medium text-sm">
                {name || value ? (
                  <span>
                    <span className="pr-1 font-light text-muted-foreground">
                      {index + 1 < 10 ? `0${index + 1}` : index + 1}
                    </span>{" "}
                    {name}
                    {value && <>: {value}</>}
                  </span>
                ) : (
                  `Specification ${index + 1 < 10 ? `0${index + 1}` : index + 1}`
                )}
              </h2>
            </CollapsibleTrigger>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              className={cn(totalFields > 1 ? "" : "hidden", "text-muted-foreground hover:text-destructive")}
              onClick={() => onRemove(index)}
              size="btn"
              type="button"
              variant="ghost"
            >
              <IconTrash className="size-3" />
            </Button>
            <CollapsibleTrigger asChild>
              <Button className="-mr-2 shrink-0 p-0" size="btn" variant="ghost">
                <ChevronsUpDown className="h-4 w-4 text-muted-foreground/80" />
                <span className="sr-only">Toggle</span>
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>
        <CollapsibleContent className="grid grid-cols-2 gap-2 border-t data-[state=open]:p-3">
          <FormField
            control={control}
            name={`specifications.${index}.name`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Label</FormLabel>
                <FormControl>
                  <Input placeholder="Specification Title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`specifications.${index}.value`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Value</FormLabel>
                <FormControl>
                  <Input placeholder="Specification Value" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
});

interface Props {
  isEditMode: boolean;
}

export const ProductSpecifications = memo(function ProductSpecifications({ isEditMode }: Props) {
  const form = useFormContext<ProductFormType>();

  const { fields, append, remove, move } = useFieldArray({
    name: "specifications",
    control: form.control,
  });

  const handleAppend = useCallback(() => {
    append({ name: "", value: "" });
  }, [append]);

  // dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // Track the currently dragged item's id
  const [activeId, setActiveId] = useState<string | number | null>(null);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);
      if (active.id !== over?.id) {
        const oldIndex = fields.findIndex((f) => f.id === active.id);
        const newIndex = fields.findIndex((f) => f.id === over?.id);
        move(oldIndex, newIndex);
      }
    },
    [fields, move]
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id);
  }, []);

  // Find the dragged field for overlay
  const activeField = activeId ? fields.find((f) => f.id === activeId) : null;
  const activeIndex = activeField ? fields.findIndex((f) => f.id === activeId) : -1;

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="px-2 font-medium text-lg">Informational and technical specifications</h2>

        <TabNavigation currentTab="specifications" />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Card className="h-fit md:col-span-2">
          <CardHeader>
            <CardTitle>Technical Specs</CardTitle>
            <CardDescription>Informational specs like memory, camera, performance, and capabilities.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              onDragStart={handleDragStart}
              sensors={sensors}
            >
              <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                {fields.map((field, index) => (
                  <SpecificationItem
                    id={field.id}
                    index={index}
                    isEditMode={isEditMode}
                    key={field.id}
                    onRemove={remove}
                    totalFields={fields.length}
                  />
                ))}
              </SortableContext>
              <DragOverlay>
                {activeField ? (
                  <div className="min-w-[200px] rounded-md border bg-input p-3 shadow-lg">
                    <span className="pr-1 font-light text-muted-foreground">
                      {activeIndex + 1 < 10 ? `0${activeIndex + 1}` : activeIndex + 1}
                    </span>
                    {activeField.name}
                    {activeField.value && <>: {activeField.value}</>}
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
            <Button onClick={handleAppend} type="button" variant="outline">
              <IconPlus className="size-4" />
              <span className="block">Add New Specification</span>
            </Button>
          </CardContent>
        </Card>
        <div className="sticky top-[20vh] col-span-1 grid h-fit gap-3">
          <PhysicalSpecsCard />
          <ShippingHandlingCard />
        </div>
      </div>
    </>
  );
});

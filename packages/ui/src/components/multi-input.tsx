"use client";

import { Check, Plus, X } from "lucide-react";
import type { RefObject } from "react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@ziron/utils";

import { useClickOutside } from "../hooks/use-click-outside";
import { useLocalStorage } from "../hooks/use-local-storage";
import { Label } from "./label";

interface Tag {
  id: string;
  label: string;
  color?: string;
}

interface MultiInputProps {
  value?: string[];
  onChange?: (tags: string[]) => void;
  suggestions?: string[];
  maxTags?: number;
  label?: string;
  placeholder?: string;
  error?: string;
  storageKey?: string;
}

const tagStyles = {
  base: "inline-flex items-center gap-1.5 px-2 py-0.5 text-sm rounded-md transition-colors duration-150",
  colors: {
    blue: "bg-blue-50 text-blue-700 border border-blue-200 hover:border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700/30 dark:hover:border-blue-600/50",
    purple:
      "bg-purple-50 text-purple-700 border border-purple-200 hover:border-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700/30 dark:hover:border-purple-600/50",
    green:
      "bg-green-50 text-green-700 border border-green-200 hover:border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700/30 dark:hover:border-green-600/50",
  },
};

export function MultiInput({
  value,
  onChange,
  suggestions = [],
  maxTags = 20,
  label,
  storageKey = "keywords",
  placeholder = "Add tags...",
  error,
}: MultiInputProps) {
  // Use local storage for suggestions only
  const [suggestionsLS, setSuggestionsLS] = useLocalStorage<string[]>(
    storageKey,
    suggestions,
  );
  // Use state for current product's tags
  const initialTags: Tag[] = (value || []).map((v) => ({ id: v, label: v }));
  const [tags, setTags] = useState<Tag[]>(initialTags);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update tags if value prop changes
  useEffect(() => {
    setTags((value || []).map((v) => ({ id: v, label: v })));
  }, [value]);

  const filteredSuggestions = suggestionsLS
    .filter(
      (suggestion) =>
        suggestion.toLowerCase().includes(input.toLowerCase()) &&
        !tags.find((tag) => tag.label === suggestion),
    )
    .slice(0, 5);

  const canAddNewTag =
    !suggestionsLS.find((s) => s.toLowerCase() === input.toLowerCase()) &&
    input.length > 0 &&
    !tags.find((tag) => tag.label.toLowerCase() === input.toLowerCase());

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Backspace" && input === "" && tags.length > 0) {
      handleRemoveTag(tags[tags.length - 1]?.label ?? "");
    } else if ((e.key === "Enter" || e.key === ",") && input) {
      e.preventDefault();
      if (isOpen && filteredSuggestions[selectedIndex]) {
        handleAddTag(filteredSuggestions[selectedIndex]);
      } else if (canAddNewTag) {
        handleAddTag(input);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  }

  function handleAddTag(label: string) {
    if (tags.length >= maxTags) return;
    const newTags = [...tags, { id: label, label }];
    setTags(newTags);
    setInput("");
    setIsOpen(false);
    setSelectedIndex(0);
    onChange?.(newTags.map((t) => t.label));
    // Save new keyword to suggestions, deduplicated (case-insensitive)
    const lowerLabel = label.toLowerCase();
    if (!suggestionsLS.find((s) => s.toLowerCase() === lowerLabel)) {
      const deduped = [
        label,
        ...suggestionsLS.filter((s) => s.toLowerCase() !== lowerLabel),
      ].slice(0, 7);
      setSuggestionsLS(deduped);
    }
  }

  function handleRemoveTag(label: string) {
    const newTags = tags.filter((tag) => tag.label !== label);
    setTags(newTags);
    onChange?.(newTags.map((t) => t.label));
    // Do NOT update suggestionsLS here
  }

  useClickOutside(containerRef as RefObject<HTMLElement>, () =>
    setIsOpen(false),
  );

  return (
    <div
      className="w-full max-w-full space-y-2 sm:max-w-2xl"
      ref={containerRef}
    >
      {label && (
        <Label
          className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
          htmlFor={label}
        >
          {label}
        </Label>
      )}

      <div
        className={cn(
          "min-h-[3rem] px-2 py-1 sm:min-h-[2.5rem]",
          "rounded-lg border",
          "border-zinc-300 dark:border-zinc-700",
          "bg-white dark:bg-zinc-900",
          "focus-within:ring-2 focus-within:ring-indigo-500/30 dark:focus-within:ring-indigo-400/30",
          "relative flex flex-row flex-wrap items-center gap-2 sm:gap-1.5",
        )}
      >
        {tags.map((tag) => (
          <span
            key={tag.id}
            className={cn(
              tagStyles.base,
              "py-1 text-base sm:py-0.5 sm:text-sm",
              tag.color || tagStyles.colors.blue,
            )}
          >
            {tag.label}
            <button
              type="button"
              onClick={() => handleRemoveTag(tag.label)}
              className={cn(
                "text-current/60 transition-colors hover:text-current",
                "p-1 sm:p-0",
              )}
            >
              <X className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setIsOpen(true);
            setSelectedIndex(0);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ""}
          className={cn(
            "min-w-[140px] flex-1 bg-transparent sm:min-w-[120px]",
            "h-8 sm:h-7",
            "text-base sm:text-sm",
            "text-zinc-900 dark:text-zinc-100",
            "placeholder:px-2 placeholder:text-zinc-500 dark:placeholder:text-zinc-400",
            "focus:outline-hidden",
          )}
        />

        {isOpen && (input || filteredSuggestions.length > 0) && (
          <div
            className={cn(
              "absolute top-full right-0 left-0 z-50 mt-1",
              "max-h-[60vh] overflow-y-auto sm:max-h-[300px]",
              "bg-white dark:bg-zinc-900",
              "border border-zinc-300 dark:border-zinc-700",
              "shadow-primary-background/5 rounded-lg shadow-lg",
              "overflow-hidden",
            )}
          >
            <div className="border-b border-zinc-200 px-2 py-1.5 dark:border-zinc-800">
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                Choose a tag or create one
              </span>
            </div>
            <div className="flex flex-wrap gap-2 p-2 sm:gap-1.5 sm:p-1.5">
              {filteredSuggestions.map((suggestion, index) => (
                <button
                  type="button"
                  key={suggestion}
                  onClick={() => {
                    handleAddTag(suggestion);
                  }}
                  className={cn(
                    tagStyles.base,
                    selectedIndex === index
                      ? tagStyles.colors.blue
                      : "border border-zinc-300 bg-zinc-50 text-zinc-700 hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-300 dark:hover:border-zinc-600",
                  )}
                >
                  {suggestion}
                  {selectedIndex === index && <Check className="h-3.5 w-3.5" />}
                </button>
              ))}
              {canAddNewTag && (
                <button
                  type="button"
                  onClick={() => {
                    handleAddTag(input);
                  }}
                  className={cn(
                    tagStyles.base,
                    selectedIndex === filteredSuggestions.length
                      ? tagStyles.colors.blue
                      : "border border-zinc-300 bg-zinc-50 text-zinc-700 hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-300 dark:hover:border-zinc-600",
                  )}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Create &quot;{input}&quot;
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}

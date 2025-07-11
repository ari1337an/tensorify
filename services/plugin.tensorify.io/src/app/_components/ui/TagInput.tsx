"use client";

import { X } from "lucide-react";
import { useState, useRef, KeyboardEvent } from "react";
import { cn } from "@/app/_lib/utils";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  name: string;
  className?: string;
}

export function TagInput({
  value = [],
  onChange,
  placeholder = "Enter tags...",
  name,
  className,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      removeTag(value.length - 1);
    }
  };

  const addTag = () => {
    const tag = inputValue.trim();
    if (tag) {
      // Check character limit
      if (tag.length > 20) {
        // Don't add tags that are over 20 characters
        setInputValue("");
        return;
      }

      // Check for duplicates case-insensitively
      const isDuplicate = value.some(
        (existingTag) => existingTag.toLowerCase() === tag.toLowerCase()
      );

      if (!isDuplicate) {
        onChange([...value, tag]);
      }

      // Clear input even if duplicate (to match behavior when tag is too long)
      setInputValue("");
    }
  };

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleBlur = () => {
    addTag();
  };

  return (
    <div
      className={cn(
        "flex flex-wrap gap-2 p-2 bg-secondary/50 border border-border rounded-md focus-within:ring-2 focus-within:ring-primary/20",
        className
      )}
      onClick={() => inputRef.current?.focus()}
    >
      {value.map((tag, index) => (
        <span
          key={index}
          className="text-white flex items-center gap-1 bg-primary/10 text-primary-foreground px-2 py-1 rounded-md text-sm"
        >
          {tag}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              removeTag(index);
            }}
            className="hover:text-destructive focus:outline-none"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        data-testid="plugin-tags-input"
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={value.length === 0 ? placeholder : ""}
        className="flex-1 min-w-[120px] bg-transparent outline-none placeholder:text-muted-foreground text-foreground"
      />
      <input type="hidden" name={name} value={value.join(",")} />
    </div>
  );
}

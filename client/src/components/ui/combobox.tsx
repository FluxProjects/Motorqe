"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "./command";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";

interface Option {
  label: string;
  value: string;
}

interface ComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  options: Option[];
  allowCustom?: boolean;
}

export function Combobox({
  value,
  onValueChange,
  placeholder = "Select option",
  options,
  allowCustom = false,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(value || "");

  React.useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  const handleSelect = (val: string) => {
    onValueChange(val);
    setOpen(false);
  };

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" className="w-full justify-between text-neutral-500">
          {value ? options.find((option) => option.value === value)?.label ?? value : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput
            placeholder="Search..."
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandEmpty>No option found.</CommandEmpty>
          <CommandGroup>
            {filteredOptions.map((option) => (
              <CommandItem
                key={option.value}
                onSelect={() => handleSelect(option.value)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === option.value ? "opacity-100" : "opacity-0"
                  )}
                />
                {option.label}
              </CommandItem>
            ))}
            {allowCustom && inputValue && !options.some((o) => o.label === inputValue) && (
              <CommandItem onSelect={() => handleSelect(inputValue)}>
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === inputValue ? "opacity-100" : "opacity-0"
                  )}
                />
                Add "{inputValue}"
              </CommandItem>
            )}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

import * as React from "react"
import { CheckIcon, ChevronsUpDownIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface Option {
	value: string,
	label: any
}

interface ComboboxProps {
	options: Option[]
	placeholder: string
	value: string | string[] | undefined
  multiple?: boolean
	onChange: (value: string | string[]) => void
	emptyText?: string
  side?: "top" | "left" | "right" | "bottom"
}

export function Combobox({ options, placeholder, emptyText, value, multiple = false, onChange, ...props }: React.ComponentProps<"div"> & ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  const selectedValues = React.useMemo(() => {
    if (multiple) {
      return Array.isArray(value) ? value : [];
    }
    return typeof value === 'string' ? [value] : [];
  }, [value, multiple]);

  const handleSelect = (selectedValue: string) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = currentValues.includes(selectedValue)
        ? currentValues.filter(v => v !== selectedValue)
        : [...currentValues, selectedValue];
      onChange(newValues);
    } else {
      onChange(selectedValue);
      setOpen(false);
    }
  };

  const getDisplayValue = () => {
    if (multiple && Array.isArray(value) && value.length > 0) {
      return `${value.length} selected`;
    }
    if (!multiple && typeof value === 'string' && (value || value === '')) {
      return options.find(o => o.value === value)?.label || value;
    }
    return placeholder;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild >
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`w-full justify-between overflow-hidden ${props.className}`}
        >
          <span className="truncate font-normal">{getDisplayValue()}</span>
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" side={props.side} align="start" avoidCollisions={!props.side}>
        <Command shouldFilter={false}>
          <CommandInput 
            value={searchValue} 
            onValueChange={setSearchValue} 
            placeholder={`Search ${placeholder.toLowerCase()}...`} 
          />
          <CommandList>
            <CommandEmpty>{emptyText || "No options found"}</CommandEmpty>
            <CommandGroup>
              {options
                .filter(o => 
                  o.label.toString().toLowerCase().includes(searchValue.toLowerCase())
                )
                .map((o) => {
                  const isSelected = selectedValues.includes(o.value);
                  return (
                    <CommandItem
                      key={o.value}
                      value={o.value}
                      onSelect={() => handleSelect(o.value)}
                      className="cursor-pointer flex items-center gap-2"
                    >
                      <span className={isSelected ? 'font-medium' : ''}>{o.label}</span>
                      {multiple && isSelected && (
                        <CheckIcon className={`h-4 w-4 ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
                      )}
                    </CommandItem>
                  );
                })
              }
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}


/*
Alternate idea for the multiple display

        {multiple && selectedValues.length > 0 && (
          <div className="p-2 border-b">
            <div className="flex flex-wrap gap-1">
              {selectedValues.map((val) => {
                const option = options.find(o => o.value === val);
                return (
                  <div key={val} className="flex items-center gap-1 bg-primary/10 text-primary rounded px-2 py-1 text-sm">
                    <span>{option?.label || val}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeValue(val);
                      }}
                      className="hover:bg-primary/20 rounded"
                    >
                      <XIcon className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

*/
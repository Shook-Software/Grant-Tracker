import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { MoreVertical } from "lucide-react"

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export { DropdownMenuItemClassName as ComboboxDropdownMenuItemClassName } from "@/components/ui/dropdown-menu"

interface ComboboxDropdownMenuProps {
  'aria-label': string,
  children: React.ReactNode
}

export function ComboboxDropdownMenu(props: ComboboxDropdownMenuProps) {
  const [open, setOpen] = React.useState(false)

  return (
	<DropdownMenu open={open} onOpenChange={setOpen}>
		<DropdownMenuTrigger asChild>
			<Button variant="ghost" size="sm" aria-label={props['aria-label']}>
				<MoreVertical />
			</Button>
		</DropdownMenuTrigger>
		<DropdownMenuContent align="end" className="w-[200px]" onClick={(e) => e.stopPropagation()}>
			<DropdownMenuGroup>
				{props.children}
			</DropdownMenuGroup>
		</DropdownMenuContent>
	</DropdownMenu>
  )
}

interface ComboboxDropdownMenuItemProps {
	label: string
	onClick?: () => void
}

export function ComboboxDropdownMenuItem({ 
	label, 
	onClick,
	...props
}: ComboboxDropdownMenuItemProps & React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean
  variant?: "default" | "destructive"
}) {
	return (
		<DropdownMenuItem  onClick={onClick} {...props}>{label}</DropdownMenuItem>
	)
}
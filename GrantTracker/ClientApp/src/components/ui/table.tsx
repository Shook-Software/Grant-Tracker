import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "components/ui/button"
import { Input } from "components/ui/input"
import { ArrowDownWideNarrow, ArrowUpWideNarrow } from "lucide-react"

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement> & { containerClassName: string }
>(({ className, containerClassName, ...props }, ref) => (
  <div className={`relative overflow-auto w-fit ${containerClassName}`}>
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      " h-1 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    )}
    {...props}
  />
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

interface HeaderCellProps {
  label: string | undefined
  sort?: "asc" | "desc" | false
  onSortClick?: (e) => void
  filterValue?: string
  onFilterChange?: (e) => void
  filterPlaceholder?: string
  filterOptions?: { value: string; label: string }[]
  onFilterSelect?: (value: string) => void
}

const HeaderCell = React.forwardRef<
  HTMLDivElement & HeaderCellProps,
  React.HTMLAttributes<HTMLDivElement> & HeaderCellProps
>(({ className, label, sort, filterValue, onFilterChange, onSortClick, filterPlaceholder, filterOptions, onFilterSelect, ...props }, ref) => (
  <div className={cn("h-fit flex flex-col justify-center items-start", className)} {...props}>
    {onSortClick && <Button className={`flex flex-row justify-start p-0 flex-start w-full has-[>svg]:ps-0 ${onFilterChange ? 'pb-0' : ''}`} variant="ghost" style={{height:"min-content;"}} onClick={onSortClick ? (e) => onSortClick(e) : undefined}>
      {label}
      {sort === "asc" && <ArrowUpWideNarrow className='ml-2 h-4 w-4 inline-block' /> || 
        sort === "desc" && <ArrowDownWideNarrow className='ml-2 h-4 w-4 inline-block' />}
    </Button>}
    {!onSortClick && <div className={`w-full ${className} h-9 leading-9`}>{label}</div>}
    {onFilterChange && <Input
      value={filterValue || ''}
      onChange={(event) => onFilterChange(event)}
      placeholder={filterPlaceholder}
      className='max-w-sm h-8'
    />}
    {filterOptions && onFilterSelect && (
      <select
        value={filterValue || ''}
        onChange={(event) => onFilterSelect(event.target.value)}
        className='max-w-sm h-8 px-2 rounded border border-input bg-background text-sm'
      >
        <option value="">All</option>
        {filterOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    )}
    {props.children}
  </div>
))

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  HeaderCell
}
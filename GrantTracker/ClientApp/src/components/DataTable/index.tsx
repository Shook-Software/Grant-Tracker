"use client"

import * as React from "react"

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  HeaderCell
} from "@/components/ui/table"
import { Button } from "../ui/button"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  initialSorting?: SortingState
  initialColumnFilters?: ColumnFiltersState
  onRowClick?: (row: TData) => void
  onFilteredDataChange?: (filteredData: TData[]) => void
  emptyMessage?: string
  className?: string
  tableClassName?: string
  containerClassName?: string;
  title?: string,
  renderDownload?: (rows: TData[]) => React.ReactNode
}

export function DataTable<TData, TValue>({
  columns,
  data,
  initialSorting = [],
  initialColumnFilters = [],
  onRowClick,
  onFilteredDataChange,
  emptyMessage = "No results.",
  className = "",
  tableClassName = "",
  containerClassName = "",
  title,
  renderDownload
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>(initialSorting)
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(initialColumnFilters)

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters
    },
  })

  return (
    <>
      {(title || renderDownload) && (
        <div className='flex gap-3 sticky top-0 py-3 bg-white z-50'>
          {title && (
            <h3 style={{ width: 'fit-content' }}>
              {title}
            </h3>
          )}
          {renderDownload && (renderDownload(table.getFilteredRowModel().rows.map(r => r.original)))}
        </div>
      )}
      <div className={`rounded border ${containerClassName}`}>
        <Table className={tableClassName} containerClassName={containerClassName}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort()
                  const headerContent = header.column.columnDef.header

                  return (
                    <TableHead key={header.id} className='align-top py-1'>
                      {!header.isPlaceholder && (
                        typeof headerContent === 'string' ? (
                          <HeaderCell
                            label={headerContent}
                            sort={header.column.getIsSorted() === "asc" ? "asc" : header.column.getIsSorted() === "desc" ? "desc" : false}
                            onSortClick={canSort ? () => header.column.toggleSorting(header.column.getIsSorted() === "asc") : undefined}
                            filterValue={header.column.getFilterValue() as string}
                            onFilterChange={header.column.getCanFilter() && header.column.columnDef.meta?.filter !== false && !header.column.columnDef.meta?.filterOptions
                              ? (event) => header.column.setFilterValue(event.target.value)
                              : undefined}
                            filterPlaceholder={header.column.columnDef.meta?.filterPlaceholder}
                            filterOptions={header.column.columnDef.meta?.filterOptions}
                            onFilterSelect={header.column.columnDef.meta?.filterOptions
                              ? (value: string) => header.column.setFilterValue(value)
                              : undefined}
                          />
                        ) : (
                          flexRender(headerContent, header.getContext())
                        )
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={cell.column.columnDef.meta?.className || ''}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
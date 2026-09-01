"use client";
import React, { useEffect } from "react";
import "./index.css";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  Row,
  Table,
  useReactTable,
} from "@tanstack/react-table";
import {
  useVirtualizer,
  VirtualItem,
  Virtualizer,
} from "@tanstack/react-virtual";
import { makeData, Person } from "./makeData";

const count = 1000;
const defaultData = makeData(count);

//This is a dynamic row height example, which is more complicated, but allows for a more realistic table.
//See https://tanstack.com/virtual/v3/docs/examples/react/table for a simpler fixed row height example.
export default function Page() {
  const columns = React.useMemo<ColumnDef<Person>[]>(
    () => [
      {
        accessorKey: "selection",
        header: "selection",
        size: 60,
        cell: ({ row }) => {
          return (
            <input
              type="checkbox"
              checked={row.getIsSelected()}
              onChange={(e) => row.toggleSelected(!!e.currentTarget.checked)}
            />
          );
        },
      },
      {
        accessorKey: "id",
        header: "ID",
        size: 60,
      },
      {
        accessorKey: "firstName",
        cell: (info) => info.getValue(),
      },
      {
        accessorFn: (row) => row.lastName,
        id: "lastName",
        cell: (info) => info.getValue(),
        header: () => <span>Last Name</span>,
      },
      {
        accessorKey: "age",
        header: () => "Age",
        size: 50,
      },
      {
        accessorKey: "visits",
        header: () => <span>Visits</span>,
        size: 50,
      },
      {
        accessorKey: "status",
        header: "Status",
      },
      {
        accessorKey: "progress",
        header: "Profile Progress",
        size: 80,
      },
      {
        accessorKey: "createdAt",
        header: "Created At",
        cell: (info) => info.getValue<Date>().toLocaleString(),
        size: 250,
      },
    ],
    [],
  );

  // The virtualizer will need a reference to the scrollable container element
  const tableContainerRef = React.useRef<HTMLDivElement>(null);

  const [data, setData] = React.useState<Person[]>([]);

  const refreshData = React.useCallback(() => {
    setData(makeData(count));
  }, []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugTable: true,
  });

  // console.log("123", {
  //   data: table?.getRowModel?.()?.rows?.length,
  //   allData: table.getRowModel().rows,
  // });

  useEffect(() => {
    const handleFakeAwait = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setData(defaultData);
    };
    handleFakeAwait();
  }, []);

  // All important CSS styles are included as inline styles for this example. This is not recommended for your code.
  return (
    <div className="app">
      {process.env.NODE_ENV === "development" ? (
        <p>
          <strong>Notice:</strong> You are currently running React in
          development mode. Virtualized rendering performance will be slightly
          degraded until this application is built for production.
        </p>
      ) : null}
      ({data.length} rows)
      <button onClick={refreshData}>Refresh Data</button>
      <button
        onClick={() => {
          // Selection all
          table.toggleAllPageRowsSelected();
        }}
      >
        CHECK ALL
      </button>
      <div
        className="container"
        ref={tableContainerRef}
        style={{
          overflow: "auto", //our scrollable table container
          position: "relative", //needed for sticky header
          height: "800px", //should be a fixed height
        }}
      >
        {/* Even though we're still using sematic table tags, we must use CSS grid and flexbox for dynamic row heights */}
        <table style={{ display: "grid" }}>
          <thead
            style={{
              display: "grid",
              position: "sticky",
              top: 0,
              zIndex: 1,
            }}
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                style={{ display: "flex", width: "100%" }}
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <th
                      key={header.id}
                      style={{
                        display: "flex",
                        width: header.getSize(),
                      }}
                    >
                      <div
                        {...{
                          className: header.column.getCanSort()
                            ? "cursor-pointer select-none"
                            : "",
                          onClick: header.column.getToggleSortingHandler(),
                        }}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {{
                          asc: " 🔼",
                          desc: " 🔽",
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <TableBody table={table} tableContainerRef={tableContainerRef} />
        </table>
      </div>
    </div>
  );
}

interface TableBodyProps {
  table: Table<Person>;
  tableContainerRef: React.RefObject<HTMLDivElement | null> | null;
}

function TableBody({ table, tableContainerRef }: TableBodyProps) {
  const { rows } = table.getRowModel();

  return (
    <tbody
      style={{
        display: "grid",
        // position: "relative", //needed for absolute positioning of rows
      }}
    >
      {rows.map((virtualRow) => {
        const row = rows[virtualRow.index] as Row<Person>;
        return <TableBodyRow key={row.id} row={row} />;
      })}
    </tbody>
  );

  // Important: Keep the row virtualizer in the lowest component possible to avoid unnecessary re-renders.
  const rowVirtualizer = useVirtualizer<HTMLDivElement, HTMLTableRowElement>({
    count: rows.length,
    estimateSize: () => 33, //estimate row height for accurate scrollbar dragging
    getScrollElement: () => tableContainerRef?.current || null,
    //measure dynamic row height, except in firefox because it measures table border height incorrectly
    measureElement:
      typeof window !== "undefined" &&
      navigator.userAgent.indexOf("Firefox") === -1
        ? (element) => element?.getBoundingClientRect().height
        : undefined,
    overscan: 30,
  });

  console.log({
    items: rowVirtualizer.getVirtualItems(),
    rows,
  });

  return (
    <tbody
      style={{
        display: "grid",
        height: `${rowVirtualizer.getTotalSize()}px`, //tells scrollbar how big the table is
        position: "relative", //needed for absolute positioning of rows
      }}
    >
      {rowVirtualizer.getVirtualItems().map((virtualRow) => {
        const row = rows[virtualRow.index] as Row<Person>;
        return (
          <TableBodyRow
            key={row.id}
            row={row}
            virtualRow={virtualRow}
            rowVirtualizer={rowVirtualizer}
          />
        );
      })}
    </tbody>
  );
}

interface TableBodyRowProps {
  row: Row<Person>;
  virtualRow: VirtualItem;
  rowVirtualizer: Virtualizer<HTMLDivElement, HTMLTableRowElement>;
}

function TableBodyRow({ row }: TableBodyRowProps) {
  return (
    <tr
      // data-index={virtualRow.index} //needed for dynamic row height measurement
      // ref={(node) => rowVirtualizer?.measureElement(node)} //measure dynamic row height
      key={row.id}
      style={{
        display: "flex",
        // position: "absolute",
        // transform: `translateY(${virtualRow.start}px)`, //this should always be a `style` as it changes on scroll
        width: "100%",
      }}
    >
      {row.getVisibleCells().map((cell) => {
        return (
          <td
            key={cell.id}
            style={{
              display: "flex",
              width: cell.column.getSize(),
            }}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </td>
        );
      })}
    </tr>
  );
}

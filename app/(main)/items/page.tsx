"use client";
import { FcSurvey } from "react-icons/fc";
import {
  FaRegEdit,
  FaRegTrashAlt,
  FaSearch,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { useState, useEffect, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import ItemForm from "@/app/components/Form/ItemForm";

// interface table items
type Item = {
  id: number | string;
  name: string;
  categories_name?: string;
  unit_id: number;
  alert_qty: number | string;
};

// table
const columnHelper = createColumnHelper<Item>();

export default function Items() {
  const [loadPage, setLoadPage] = useState<boolean>(true);
  const [items, setItems] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // ดึงข้อมูลรายการพัสดุ--------------------------------------------------------------------------
  const getItems = async () => {
    setLoadPage(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/getItems`);
      const data = await res.json();
      setItems(data.items || []);
      setUnits(data.units || []);
      setCategories(data.categories || []);
    } catch (err) {
      console.error("Error fetching items:", err);
      setItems([]);
      setUnits([]);
      setCategories([]);
    } finally {
      setLoadPage(false);
    }
  };

  useEffect(() => {
    getItems();
  }, []);
  //-------------------------------------------------------------------------------------------

  // สร้างคอลัมน์--------------------------------------------------------------------------------
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "index",
        header: "#",
        size: 80,
        cell: (info) => (
          <span className="inline-flex items-center w-7 h-7 justify-center rounded-full bg-sky-100 text-sky-900 text-xs font-semibold">
            {info.row.index + 1}
          </span>
        ),
        enableSorting: false,
      }),
      columnHelper.accessor("name", {
        header: "รายการ",
        size: 300,
        cell: (info) => (
          <span className="text-slate-700">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("categories_name", {
        header: "รายละเอียดเพิ่มเติม",
        size: 300,
        cell: (info) => (
          <span className="text-slate-500">{info.getValue() || "-"}</span>
        ),
      }),
      columnHelper.accessor("unit_id", {
        id: "unit_id",
        header: "หน่วยนับ",
        size: 120,
        cell: (info) => {
          return (
            <span>
              {
                units.find(
                  (unit) => Number(unit.id) === Number(info.getValue()),
                )?.name
              }
            </span>
          );
        },
      }),
      columnHelper.accessor("alert_qty", {
        id: "alert_qty",
        header: "จำนวนแจ้งเตือน",
        size: 120,
        cell: (info) => (
          <span className="inline-flex items-center w-7 h-7 justify-center rounded-full bg-red-100 text-red-900 text-xs font-semibold">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.display({
        id: "actions",
        size: 120,
        header: () => <span className="text-center w-full block">จัดการ</span>,
        cell: (info) => (
          <div className="flex items-center justify-center gap-2">
            <span
              onClick={() => handleEdit(info.row.original)}
              className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-yellow-100 text-yellow-700 cursor-pointer hover:scale-110 hover:bg-yellow-200 transition"
            >
              <FaRegEdit title="แก้ไข" />
            </span>
            {/* <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-100 text-red-700 cursor-pointer hover:scale-110 hover:bg-red-200 transition">
              <FaRegTrashAlt title="ลบ" />
            </span> */}
          </div>
        ),
        enableSorting: false,
      }),
    ],
    [units],
  );
  //-------------------------------------------------------------------------------------------

  // สร้าง table---------------------------------------------------------------------------------
  const table = useReactTable({
    data: items,
    columns,
    state: { sorting, columnFilters, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  });
  //-------------------------------------------------------------------------------------------

  // ไอคอนเรียงลำดับ-----------------------------------------------------------------------------
  const SortIcon = ({ columnId }: { columnId: string }) => {
    const col = table.getColumn(columnId);
    if (!col?.getCanSort()) return null;
    const sorted = col.getIsSorted();
    if (sorted === "asc")
      return <FaSortUp className="inline ml-1 text-blue-500" />;
    if (sorted === "desc")
      return <FaSortDown className="inline ml-1 text-blue-500" />;
    return <FaSort className="inline ml-1 text-slate-300" />;
  };
  //-------------------------------------------------------------------------------------------

  // state เพิ่มรายการและแก้ไขรายการ-------------------------------------------------------------
  const [dataItem, setDataItem] = useState({
    id: "",
    name: "",
    categories_id: "",
    unit_id: "",
    alert_qty: "",
  });
  //-------------------------------------------------------------------------------------------

  // เพิ่มรายการ--------------------------------------------------------------------------------
  const [openAddItemModal, setOpenAddItemModal] = useState(false);
  //-------------------------------------------------------------------------------------------

  // แก้ไขรายการ-------------------------------------------------------------------------------
  const [openEditItemModal, setOpenEditItemModal] = useState(false);

  const handleEdit = (item: any) => {
    setDataItem(item);
    setOpenEditItemModal(true);
  };
  //-------------------------------------------------------------------------------------------

  return (
    <div className="min-h-screen">
      <div className="bg-white p-3 md:p-5 rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.03)] border border-gray-50">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-50 border border-sky-100 rounded-xl shadow-sm">
              <FcSurvey className="w-6 h-6 text-sky-600" />
            </div>
            <h3 className="text-blue-900 font-bold text-lg tracking-tight">
              รายการพัสดุ{" "}
              <span className="text-sky-600 font-black px-1.5 py-0.5 rounded-md bg-sky-50 ml-1 text-lg">
                (Items)
              </span>
            </h3>
          </div>

          {/* Search + Add Button */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                type="text"
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="ค้นหา..."
                className="pl-8 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition w-52"
              />
            </div>
            <button
              onClick={() => setOpenAddItemModal(true)}
              className="bg-sky-500 text-white px-4 py-2 rounded-xl text-sm font-medium cursor-pointer hover:bg-sky-600 active:scale-95 transition whitespace-nowrap"
            >
              + เพิ่มรายการ
            </button>
          </div>
        </div>

        {/* เพิ่มรายการ modal */}
        <ItemForm
          mode="add"
          isOpen={openAddItemModal}
          onClose={() => setOpenAddItemModal(false)}
          onSuccess={() => getItems()}
          dataItem={dataItem}
          dataUnits={units}
          setDataItem={setDataItem}
          categories={categories}
        />

        {/* แก้ไขรายการ modal */}
        <ItemForm
          mode="edit"
          isOpen={openEditItemModal}
          onClose={() => setOpenEditItemModal(false)}
          onSuccess={() => getItems()}
          dataItem={dataItem}
          dataUnits={units}
          setDataItem={setDataItem}
          categories={categories}
        />

        {/* Load page */}
        {loadPage ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-sky-600"></div>
            <p className="text-sky-900 text-sm ms-2">กำลังโหลดข้อมูล...</p>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto custom-scrollbar rounded-xl border border-slate-100 shadow-sm bg-white">
              <table className="w-full text-sm">
                <thead className="text-sky-900 bg-indigo-50 border-b border-indigo-200">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          onClick={header.column.getToggleSortingHandler()}
                          style={{ width: `${header.getSize()}px` }}
                          className={`
                            px-4 py-3 font-semibold select-none whitespace-nowrap
                            ${
                              header.id === "index" ||
                              header.id === "actions" ||
                              header.id === "alert_qty" ||
                              header.id === "unit_id"
                                ? "text-center"
                                : "text-left"
                            }
                            ${
                              header.column.getCanSort()
                                ? "cursor-pointer hover:bg-indigo-100 transition"
                                : ""
                            }
                          `}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {header.column.getCanSort() && (
                            <SortIcon columnId={header.id} />
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>

                <tbody>
                  {table.getRowModel().rows.length > 0 ? (
                    table.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        className="hover:bg-indigo-50/80 odd:bg-gray-50/60 transition-colors"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className={`px-4 py-3 ${
                              cell.column.id === "index" ||
                              cell.column.id === "actions" ||
                              cell.column.id === "alert_qty" ||
                              cell.column.id === "unit_id"
                                ? "text-center"
                                : ""
                            }`}
                            style={{ width: `${cell.column.getSize()}px` }}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-10 text-center text-slate-400"
                      >
                        ไม่พบข้อมูล
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
              {/* Rows per page */}
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span>แสดง</span>
                <select
                  value={table.getState().pagination.pageSize}
                  onChange={(e) => table.setPageSize(Number(e.target.value))}
                  className="border border-slate-200 rounded-lg px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  {[5, 10, 20, 50].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
                <span>
                  รายการ — ทั้งหมด{" "}
                  <strong>{table.getFilteredRowModel().rows.length}</strong>{" "}
                  รายการ
                </span>
              </div>

              {/* Page controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <FaChevronLeft className="text-xs" />
                </button>

                {Array.from({ length: table.getPageCount() }, (_, i) => i).map(
                  (pageIdx) => (
                    <button
                      key={pageIdx}
                      onClick={() => table.setPageIndex(pageIdx)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                        table.getState().pagination.pageIndex === pageIdx
                          ? "bg-blue-600 text-white shadow-sm cursor-pointer"
                          : "border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
                      }`}
                    >
                      {pageIdx + 1}
                    </button>
                  ),
                )}

                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  <FaChevronRight className="text-xs" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

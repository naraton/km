"use client";
import { FcPackage } from "react-icons/fc";
import {
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
import { IoSettings } from "react-icons/io5";
import { getUser } from "@/app/lib/auth";

// interface table items
type StockBalanceTable = {
  id: number;
  item_name: string;
  categories_id: string;
  unit_name: string;
  qty_balance: number;
  alert_qty: number;
  stock_status: "normal" | "low";
};

// table
const columnHelper = createColumnHelper<StockBalanceTable>();

export default function StockBalance() {
  const [user, setUser] = useState<any>(null);
  const [loadPage, setLoadPage] = useState<boolean>(true);
  const [location, Setlocation] = useState<any>(null);
  const [stockBalance, setStockBalance] = useState<any[]>([]);

  //get user data from local storage------------------------------------------------------------
  useEffect(() => {
    const userData = getUser();
    setUser(userData);
  }, []);
  //-------------------------------------------------------------------------------------------

  // ดึงข้อมูล------------------------------------------------------------------------------------
  const getStockBalance = async () => {
    if (!user?.id_card) return;

    setLoadPage(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/getStockBalance?id_card=${user.id_card}`,
      );
      const data = await res.json();

      Setlocation(data.location || []);
      setStockBalance(data.stocksBalance || []);
    } catch (err) {
      console.error("Error fetching items:", err);
      Setlocation([]);
    } finally {
      setLoadPage(false);
    }
  };

  useEffect(() => {
    if (user?.id_card) {
      getStockBalance();
    }
  }, [user]);
  //------------------------------------------------------------------------------------------

  //Modal ตั้งค่า alert--------------------------------------------------------------------------
  const [alertQtyModal, setAlertQtyModal] = useState(false);
  const [balanceItemId, setBalanceItemId] = useState(0);
  const [balanceItemName, setBalanceItemName] = useState("");
  const [BalanceAmount, setBalanceAmount] = useState(0);
  const [disabledForm, setDisabledForm] = useState(false);
  const [loadingAlert, setLoadingAlert] = useState(false);

  const clearBalanceItem = () => {
    setAlertQtyModal(false);
    setBalanceItemId(0);
    setBalanceItemName("");
    setBalanceAmount(0);
    setDisabledForm(false);
    setLoadingAlert(false);
  };

  const handleSaveQtyAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingAlert(true);
    setDisabledForm(true);

    try {
      const payload = {
        balances_id: balanceItemId,
        alert_qty: BalanceAmount,
      };

      const res = await fetch(`/api/balance/updateQtyAlert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        setTimeout(() => {
          clearBalanceItem();
          getStockBalance();
        }, 2000);
      } else {
        clearBalanceItem();
        getStockBalance();
      }
    } catch (err) {
      console.error("Error updating qty alert:", err);
      clearBalanceItem();
      getStockBalance();
    }
  };
  //-------------------------------------------------------------------------------------------

  // สร้างคอลัมน์--------------------------------------------------------------------------------
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "index",
        header: "#",
        size: 70,
        cell: (info) => (
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-200 text-sky-900 text-xs font-semibold">
            {info.row.index + 1}
          </span>
        ),
      }),

      columnHelper.accessor("item_name", {
        header: "รายการ",
        size: 250,
      }),

      columnHelper.accessor("categories_id", {
        header: "รายละเอียดเพิ่มเติม",
        size: 400,
        cell: (info) => (
          <span className="text-slate-500">{info.getValue() || "-"}</span>
        ),
      }),

      columnHelper.accessor("unit_name", {
        header: "หน่วยนับ",
        size: 120,
      }),

      columnHelper.accessor("qty_balance", {
        header: "คงเหลือ",
        size: 120,
        cell: (info) => (
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-sky-200 text-sky-900 text-xs font-semibold">
            {info.getValue()}
          </span>
        ),
      }),

      columnHelper.accessor("alert_qty", {
        header: "แจ้งเตือน",
        size: 120,
        cell: (info) => (
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-orange-200 text-orange-900 text-xs font-medium">
            {info.getValue()}
          </span>
        ),
      }),

      columnHelper.accessor("stock_status", {
        header: "สถานะ",
        size: 150,
        cell: (info) =>
          info.getValue() === "low" ? (
            <span className="px-3 py-1 rounded-full bg-red-200 text-red-700 text-xs font-medium">
              ใกล้หมด
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full bg-green-200 text-green-700 text-xs font-medium">
              ปกติ
            </span>
          ),
      }),

      columnHelper.display({
        id: "actions",
        size: 100,
        header: () => <span className="text-center w-full block">จัดการ</span>,
        cell: (info) => (
          <div className="flex items-center justify-center gap-2">
            <span
              onClick={() => {
                setAlertQtyModal(true);
                setBalanceItemId(Number(info.row.original.id));
                setBalanceItemName(info.row.original.item_name);
                setBalanceAmount(Number(info.row.original.alert_qty));
              }}
              className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-sky-100 text-sky-700 cursor-pointer hover:scale-110 hover:bg-sky-200 transition"
            >
              <IoSettings />
            </span>
          </div>
        ),
        enableSorting: false,
      }),
    ],
    [],
  );
  //-------------------------------------------------------------------------------------------

  // สร้าง table---------------------------------------------------------------------------------
  const table = useReactTable({
    data: stockBalance,
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

  return (
    <div className="min-h-screen">
      <div className="bg-white p-3 md:p-5 rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.03)] border border-gray-50">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-green-50 border border-green-100 rounded-xl shadow-sm">
              <FcPackage className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-sky-900 font-bold text-lg tracking-tight">
              ยอดคงเหลือในสต็อก
              <span className="text-green-600 font-black px-1.5 py-0.5 rounded-md bg-green-50 ml-1 text-lg">
                (Stock Balance)
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
          </div>
        </div>

        {/* Load page */}
        {loadPage ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
            <p className="text-sky-900 text-sm ms-2">กำลังโหลดข้อมูล...</p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex justify-between items-center border-b border-green-200 pb-3">
              <div className="flex gap-3 text-sm me-3">
                <span className="py-1 px-3 rounded-lg bg-green-50 text-green-700 font-bold">
                  รายการคงเหลือ
                </span>
              </div>

              <div className="flex gap-3 text-sm">
                <div className="px-3 py-1 rounded-lg bg-sky-50 text-sky-700 font-bold">
                  {location?.HR_DEPARTMENT_SUB_NAME ||
                    location?.HR_DEPARTMENT_NAME}
                </div>

                <div className="px-3 py-1 rounded-lg bg-pink-50 text-pink-700 font-bold">
                  ผู้บันทึก : {user?.fname} {user?.lname}
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto custom-scrollbar rounded-xl border border-slate-100 shadow-sm bg-white mt-4">
              <table className="w-full text-sm">
                <thead className="text-sky-900 bg-green-50 border-b border-green-200">
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
                              header.id === "qty_balance" ||
                              header.id === "alert_qty" ||
                              header.id === "stock_status" ||
                              header.id === "unit_name" ||
                              header.id === "actions"
                                ? "text-center"
                                : "text-left"
                            }
                            ${
                              header.column.getCanSort()
                                ? "cursor-pointer hover:bg-green-100 transition"
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
                        className="hover:bg-green-100/60 odd:bg-green-50/40 transition-colors"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className={`px-4 py-3 ${
                              cell.column.id === "index" ||
                              cell.column.id === "qty_balance" ||
                              cell.column.id === "alert_qty" ||
                              cell.column.id === "stock_status" ||
                              cell.column.id === "unit_name" ||
                              cell.column.id === "actions"
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
                        colSpan={8}
                        className="px-4 py-10 text-center text-slate-400"
                      >
                        ไม่พบยอดคงเหลือในสต็อก
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

            {/* Modal ตั้งค่า alert */}
            {alertQtyModal && (
              <dialog
                id="cancelModal"
                className="modal modal-open z-100 bg-slate-900/40 backdrop-blur-sm"
              >
                <div className="modal-box w-11/12 max-w-md bg-white border border-slate-200 shadow-2xl rounded-3xl p-8 relative">
                  {/* close */}
                  <button
                    type="button"
                    className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 text-slate-400 hover:text-slate-600"
                    onClick={() => clearBalanceItem()}
                    disabled={disabledForm || loadingAlert}
                  >
                    ✕
                  </button>

                  {/* message */}
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-slate-700 font-bold">
                      ตั้งค่าแจ้งเตือนรายการ :{" "}
                      <span className="text-sm font-normal text-slate-600 bg-green-50 px-2 py-1 border border-green-100 rounded-lg">
                        {balanceItemName}
                      </span>
                    </p>
                  </div>

                  <form onSubmit={handleSaveQtyAlert}>
                    {/* แจ้งเตือนเมื่อเหลือต่ำกว่า */}
                    <div className="mt-4">
                      <label
                        htmlFor="qty_alert"
                        className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block"
                      >
                        แจ้งเตือนเมื่อเหลือต่ำกว่า
                      </label>
                      <input
                        id="qty_alert"
                        name="qty_alert"
                        type="text"
                        maxLength={3}
                        value={BalanceAmount}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          setBalanceAmount(value ? Number(value) : 0);
                        }}
                        className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:border-green-400 focus:ring-2 focus:ring-green-400/10 transition-all duration-200 outline-none text-sm text-slate-700 placeholder:text-slate-400"
                        disabled={disabledForm || loadingAlert}
                        required
                      />
                    </div>

                    {/* buttons */}
                    <div className="flex justify-center gap-3 mt-4">
                      <button
                        type="button"
                        onClick={() => clearBalanceItem()}
                        disabled={disabledForm || loadingAlert}
                        className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm rounded-xl transition cursor-pointer disabled:opacity-70"
                      >
                        ปิด
                      </button>

                      <button
                        className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg shadow-green-500/10 hover:shadow-green-500/20 active:scale-[0.98] transition-all duration-200 text-sm cursor-pointer"
                        type="submit"
                        disabled={disabledForm || loadingAlert}
                      >
                        {loadingAlert ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>กำลังบันทึก...</span>
                          </div>
                        ) : (
                          "บันทึก"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </dialog>
            )}
          </>
        )}
      </div>
    </div>
  );
}

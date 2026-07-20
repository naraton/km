"use client";
import { FcFilingCabinet } from "react-icons/fc";
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
import { RiDeleteBin2Line } from "react-icons/ri";
import { getUser } from "@/app/lib/auth";
import { formatThaiDate } from "@/app/lib/dateFormat";
import ReceiveForm from "@/app/components/Form/ReceiveForm";
import ModelCancle from "@/app/components/Form/ModelCancle";

// interface table items
type HistoryReceiveTable = {
  id: number | string;
  receive_date: string;
  remark: string;
  qty_prev: number | string;
  qty_new: number | string;
  qty_total: number | string;
  item_name: string;
  categories_id: string;
  created_by: string;
  unit_name: string;
  status: string;
};

// table
const columnHelper = createColumnHelper<HistoryReceiveTable>();

export default function Receive() {
  const [user, setUser] = useState<any>(null);
  const [loadPage, setLoadPage] = useState<boolean>(true);
  const [location, Setlocation] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [historyReceive, setHistoryReceive] = useState<any[]>([]);

  //get user data from local storage------------------------------------------------------------
  useEffect(() => {
    const userData = getUser();
    setUser(userData);
  }, []);
  //-------------------------------------------------------------------------------------------

  // ดึงข้อมูล------------------------------------------------------------------------------------
  const getReceive = async () => {
    if (!user?.id_card) return;

    setLoadPage(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/getReceive?id_card=${user.id_card}`,
      );
      const data = await res.json();

      Setlocation(data.location || []);
      setItems(data.items || []);
      setHistoryReceive(data.history_receive || []);
    } catch (err) {
      console.error("Error fetching items:", err);
      Setlocation([]);
      setItems([]);
    } finally {
      setLoadPage(false);
    }
  };

  useEffect(() => {
    if (user?.id_card) {
      getReceive();
    }
  }, [user]);
  //------------------------------------------------------------------------------------------

  // เพิ่มรายการ--------------------------------------------------------------------------------
  const [openAddReceiveModal, setOpenAddReceiveModal] = useState(false);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  //-------------------------------------------------------------------------------------------

  // state เพิ่มรายการและแก้ไขรายการ-------------------------------------------------------------
  const [dataReceive, setDataReceive] = useState({
    id: "",
    item_id: "",
    item_name: "",
    remark: "",
    receive_date: new Date().toISOString().split("T")[0],
    qty_prev: "",
    qty_new: "",
    alert_qty: 0,
  });
  //-------------------------------------------------------------------------------------------

  // ยกเลิกรายการ-------------------------------------------------------------------------------
  const [modelCancel, setModelCancel] = useState(false);
  const [receiveId, setReceiveId] = useState(0);
  //-------------------------------------------------------------------------------------------

  // สร้างคอลัมน์--------------------------------------------------------------------------------
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "index",
        header: "#",
        size: 40,
        cell: (info) => (
          <span className="inline-flex items-center w-7 h-7 justify-center rounded-full bg-sky-100 text-sky-900 text-xs font-semibold">
            {info.row.index + 1}
          </span>
        ),
        enableSorting: false,
      }),
      columnHelper.accessor("receive_date", {
        id: "receive_date",
        header: "วันที่รับ",
        size: 150,
        cell: (info) => (
          <span className="text-slate-700">
            {formatThaiDate(info.getValue())}
          </span>
        ),
      }),
      columnHelper.accessor("item_name", {
        header: "รายการ",
        size: 300,
        cell: (info) => (
          <span className="text-slate-700">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("categories_id", {
        header: "รายละเอียดเพิ่มเติม",
        size: 300,
        cell: (info) => (
          <span className="text-slate-500">{info.getValue() || "-"}</span>
        ),
      }),
      columnHelper.accessor("unit_name", {
        id: "unit_name",
        header: "หน่วยนับ",
        size: 100,
        cell: (info) => (
          <span className="text-slate-700">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("remark", {
        header: "หมายเหตุ",
        size: 300,
        cell: (info) => <span className="text-red-500">{info.getValue()}</span>,
      }),
      columnHelper.accessor("created_by", {
        id: "created_by",
        header: "ผู้บันทึก",
        size: 200,
        cell: (info) => (
          <span className="text-slate-700">{info.row.original.created_by}</span>
        ),
      }),
      columnHelper.accessor("qty_prev", {
        id: "qty_prev",
        header: "ยอดยกมา",
        size: 50,
        cell: (info) => (
          <span className="inline-flex items-center w-7 h-7 justify-center rounded-full bg-sky-100 text-sky-900 text-xs font-semibold">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("qty_new", {
        id: "qty_new",
        header: "จำนวนรับ",
        size: 50,
        cell: (info) => (
          <span className="inline-flex items-center w-7 h-7 justify-center rounded-full bg-green-100 text-green-900 text-xs font-semibold">
            {info.getValue()}
          </span>
        ),
      }),

      columnHelper.accessor("qty_total", {
        id: "qty_total",
        header: "ยอดรวม",
        size: 50,
        cell: (info) => (
          <span className="inline-flex items-center w-7 h-7 justify-center rounded-full bg-orange-100 text-orange-900 text-xs font-semibold">
            {Number(info.row.original.qty_prev) +
              Number(info.row.original.qty_new)}
          </span>
        ),
      }),
      columnHelper.display({
        id: "actions",
        size: 100,
        header: () => <span className="text-center w-full block">จัดการ</span>,
        cell: (info) => (
          <div className="flex items-center justify-center gap-2">
            {String(info.row.original.status) === "cancelled" ? (
              <span className="inline-flex items-center justify-center w-20 h-7 rounded-full bg-red-100 text-red-700 text-xs font-medium cursor-not-allowed">
                ยกเลิกแล้ว
              </span>
            ) : (
              <span
                onClick={() => {
                  setModelCancel(true);
                  setReceiveId(Number(info.row.original.id));
                }}
                title="ยกเลิกรายการ"
                className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-100 text-red-700 cursor-pointer hover:scale-110 hover:bg-red-200 transition"
              >
                <RiDeleteBin2Line />
              </span>
            )}
          </div>
        ),
        enableSorting: false,
      }),
    ],
    [historyReceive],
  );
  //-------------------------------------------------------------------------------------------

  // สร้าง table---------------------------------------------------------------------------------
  const table = useReactTable({
    data: historyReceive,
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
            <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-xl shadow-sm">
              <FcFilingCabinet className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-sky-900 font-bold text-lg tracking-tight">
              รับพัสดุ
              <span className="text-sky-600 font-black px-1.5 py-0.5 rounded-md bg-sky-50 ml-1 text-lg">
                (Receive)
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
              onClick={() => {
                setDataReceive({
                  id: "",
                  item_id: "",
                  item_name: "",
                  remark: "",
                  receive_date: new Date().toISOString().split("T")[0],
                  qty_prev: "",
                  qty_new: "",
                  alert_qty: 0,
                });
                setOpenAddReceiveModal(true);
              }}
              className="bg-sky-500 text-white px-4 py-2 rounded-xl text-sm font-medium cursor-pointer hover:bg-sky-600 active:scale-95 transition whitespace-nowrap"
            >
              + เพิ่มรายการ
            </button>
          </div>
        </div>

        {/* Add ReceiveForm */}
        {openAddReceiveModal && (
          <ReceiveForm
            mode="add"
            isOpen={openAddReceiveModal}
            onClose={() => setOpenAddReceiveModal(false)}
            onSuccess={() => getReceive()}
            location={location}
            user={user}
            dataReceive={dataReceive}
            setDataReceive={setDataReceive}
            items={items}
          />
        )}

        {/* Confirm Cancel Modal */}
        {modelCancel && (
          <ModelCancle
            mode={"receive"}
            modelCancel={modelCancel}
            setModelCancel={setModelCancel}
            reference_id={receiveId}
            user={user}
            onSuccess={() => getReceive()}
          />
        )}

        {/* Load page */}
        {loadPage ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-sky-600"></div>
            <p className="text-sky-900 text-sm ms-2">กำลังโหลดข้อมูล...</p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex justify-between items-center border-b border-sky-200 pb-3">
              <div className="flex gap-3 text-sm me-3">
                <span className="py-1 px-3 rounded-lg bg-sky-50 text-sky-700 font-bold">
                  ประวัติการรับพัสดุ
                </span>
              </div>

              <div className="flex gap-3 text-sm">
                <div className="px-3 py-1 rounded-lg bg-green-50 text-green-700 font-bold">
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
                              header.id === "qty_prev" ||
                              header.id === "qty_new" ||
                              header.id === "qty_total" ||
                              header.id === "unit_name" ||
                              header.id === "receive_date" ||
                              header.id === "actions"
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
                              cell.column.id === "qty_prev" ||
                              cell.column.id === "qty_new" ||
                              cell.column.id === "qty_total" ||
                              cell.column.id === "unit_name" ||
                              cell.column.id === "receive_date" ||
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
                        ไม่พบข้อมูลประวัติการรับพัสดุ
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

"use client";
import { FcTodoList } from "react-icons/fc";
import {
  FaSearch,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { RiDeleteBin2Line } from "react-icons/ri";
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
import { getUser } from "@/app/lib/auth";
import { formatThaiDate } from "@/app/lib/dateFormat";
import IssueForm from "@/app/components/Form/IssueForm";
import ModelCancle from "@/app/components/Form/ModelCancle";

// interface table
type HistoryIssueTable = {
  id: number | string;
  issue_date: string;
  remark: string;
  qty_prev: number | string;
  qty_issue: number | string;
  item_name: string;
  categories_id: string;
  created_by: string;
  unit_name: string;
  status: string;
};

// table helper
const columnHelper = createColumnHelper<HistoryIssueTable>();

export default function Issue() {
  const [user, setUser] = useState<any>(null);
  const [loadPage, setLoadPage] = useState<boolean>(true);
  const [location, setLocation] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [historyIssue, setHistoryIssue] = useState<any[]>([]);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const [openAddIssueModal, setOpenAddIssueModal] = useState(false);

  const [dataIssue, setDataIssue] = useState({
    id: "",
    item_id: "",
    item_name: "",
    remark: "",
    issue_date: new Date().toISOString().split("T")[0],
    qty_prev: "",
    qty_issue: "",
  });

  //get user data from local storage------------------------------------------------------------
  useEffect(() => {
    const userData = getUser();
    setUser(userData);
  }, []);
  //-------------------------------------------------------------------------------------------

  // ดึงข้อมูล------------------------------------------------------------------------------------
  const getIssue = async () => {
    if (!user?.id_card) return;
    setLoadPage(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/getIssue?id_card=${user.id_card}`,
      );
      const data = await res.json();
      setLocation(data.location || null);
      setItems(data.items || []);
      setHistoryIssue(data.history_issue || []);
    } catch (err) {
      console.error("Error fetching issue:", err);
      setLocation(null);
      setItems([]);
      setHistoryIssue([]);
    } finally {
      setLoadPage(false);
    }
  };

  useEffect(() => {
    if (user?.id_card) {
      getIssue();
    }
  }, [user]);
  //------------------------------------------------------------------------------------------

  // ยกเลิกรายการ-------------------------------------------------------------------------------
  const [modelCancel, setModelCancel] = useState(false);
  const [issueId, setIssueId] = useState(0);
  //------------------------------------------------------------------------------------------

  // สร้างคอลัมน์--------------------------------------------------------------------------------
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "index",
        header: "#",
        size: 40,
        cell: (info) => (
          <span className="inline-flex items-center w-7 h-7 justify-center rounded-full bg-orange-100 text-orange-900 text-xs font-semibold">
            {info.row.index + 1}
          </span>
        ),
        enableSorting: false,
      }),
      columnHelper.accessor("issue_date", {
        id: "issue_date",
        header: "วันที่เบิก",
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
        size: 250,
        cell: (info) => (
          <span className="text-slate-500">{info.getValue() || "-"}</span>
        ),
      }),
      columnHelper.accessor("unit_name", {
        id: "unit_name",
        header: "หน่วยนับ",
        size: 100,
        cell: (info) => (
          <span className="text-slate-700">{info.getValue() || "-"}</span>
        ),
      }),
      columnHelper.accessor("remark", {
        header: "หมายเหตุ",
        size: 200,
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
        header: "จำนวนก่อนเบิก",
        size: 50,
        cell: (info) => (
          <span className="inline-flex items-center w-7 h-7 justify-center rounded-full bg-blue-100 text-blue-900 text-xs font-semibold">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("qty_issue", {
        id: "qty_issue",
        header: "จำนวนเบิก",
        size: 50,
        cell: (info) => (
          <span className="inline-flex items-center w-7 h-7 justify-center rounded-full bg-yellow-100 text-yellow-900 text-xs font-semibold">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.display({
        id: "qty_balance",
        header: "ยอดคงเหลือ",
        size: 50,
        cell: (info) => {
          const balance =
            Number(info.row.original.qty_prev) -
            Number(info.row.original.qty_issue);
          return (
            <span
              className={`inline-flex items-center w-7 h-7 justify-center rounded-full text-xs font-semibold ${
                balance < 0
                  ? "bg-orange-100 text-orange-900"
                  : "bg-orange-100 text-orange-900"
              }`}
            >
              {balance}
            </span>
          );
        },
        enableSorting: false,
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
                  setIssueId(Number(info.row.original.id));
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
    [historyIssue],
  );
  //-------------------------------------------------------------------------------------------

  // สร้าง table---------------------------------------------------------------------------------
  const table = useReactTable({
    data: historyIssue,
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
      return <FaSortUp className="inline ml-1 text-orange-500" />;
    if (sorted === "desc")
      return <FaSortDown className="inline ml-1 text-orange-500" />;
    return <FaSort className="inline ml-1 text-slate-300" />;
  };
  //-------------------------------------------------------------------------------------------

  const centeredCols = [
    "index",
    "actions",
    "qty_prev",
    "qty_issue",
    "qty_balance",
    "unit_name",
    "issue_date",
  ];

  return (
    <div className="min-h-screen">
      <div className="bg-white p-3 md:p-5 rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.03)] border border-gray-50">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-50 border border-orange-100 rounded-xl shadow-sm">
              <FcTodoList className="w-6 h-6" />
            </div>
            <h3 className="text-sky-900 font-bold text-lg tracking-tight">
              เบิกพัสดุ
              <span className="text-orange-600 font-black px-1.5 py-0.5 rounded-md bg-orange-50 ml-1 text-lg">
                (Issue)
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
                className="pl-8 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition w-52"
              />
            </div>
            <button
              onClick={() => {
                setDataIssue({
                  id: "",
                  item_id: "",
                  item_name: "",
                  remark: "",
                  issue_date: new Date().toISOString().split("T")[0],
                  qty_prev: "",
                  qty_issue: "",
                });
                setOpenAddIssueModal(true);
              }}
              className="bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-medium cursor-pointer hover:bg-orange-600 active:scale-95 transition whitespace-nowrap"
            >
              + เบิกพัสดุ
            </button>
          </div>
        </div>

        {/* Add IssueForm */}
        {openAddIssueModal && (
          <IssueForm
            mode="add"
            isOpen={openAddIssueModal}
            onClose={() => setOpenAddIssueModal(false)}
            onSuccess={() => getIssue()}
            location={location}
            user={user}
            dataIssue={dataIssue}
            setDataIssue={setDataIssue}
            items={items}
          />
        )}

        {/* Confirm Cancel Modal */}
        {modelCancel && (
          <ModelCancle
            mode={"issue"}
            modelCancel={modelCancel}
            setModelCancel={setModelCancel}
            reference_id={issueId}
            user={user}
            onSuccess={() => getIssue()}
          />
        )}

        {/* Load page */}
        {loadPage ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
            <p className="text-sky-900 text-sm ms-2">กำลังโหลดข้อมูล...</p>
          </div>
        ) : (
          <>
            {/* Info bar */}
            <div className="mb-4 flex justify-between items-center border-b border-orange-200 pb-3">
              <div className="flex gap-3 text-sm">
                <span className="py-1 px-3 rounded-lg bg-orange-50 text-orange-700 font-bold me-3">
                  ประวัติการเบิกพัสดุ
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
            <div className="overflow-x-auto custom-scrollbar rounded-xl border border-slate-100 shadow-sm bg-white">
              <table className="w-full text-sm">
                <thead className="text-sky-900 bg-orange-50 border-b border-orange-200">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          onClick={header.column.getToggleSortingHandler()}
                          style={{ width: `${header.getSize()}px` }}
                          className={`
                            px-4 py-3 font-semibold select-none whitespace-nowrap
                            ${centeredCols.includes(header.id) ? "text-center" : "text-left"}
                            ${header.column.getCanSort() ? "cursor-pointer hover:bg-orange-100 transition" : ""}
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
                        className="hover:bg-orange-50/60 odd:bg-gray-50/60 transition-colors"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className={`px-4 py-3 ${centeredCols.includes(cell.column.id) ? "text-center" : ""}`}
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
                        colSpan={10}
                        className="px-4 py-10 text-center text-slate-400"
                      >
                        ไม่พบข้อมูลประวัติการเบิกพัสดุ
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span>แสดง</span>
                <select
                  value={table.getState().pagination.pageSize}
                  onChange={(e) => table.setPageSize(Number(e.target.value))}
                  className="border border-slate-200 rounded-lg px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-200"
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
                          ? "bg-orange-500 text-white shadow-sm cursor-pointer"
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

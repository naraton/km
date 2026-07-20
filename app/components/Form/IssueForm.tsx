import { useEffect, useState } from "react";

interface IssueFormProps {
  mode: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  location: any;
  user: any;
  dataIssue: any;
  setDataIssue: any;
  items: any[];
}

export default function IssueForm({
  mode,
  isOpen,
  onClose,
  onSuccess,
  location,
  user,
  dataIssue,
  setDataIssue,
  items,
}: IssueFormProps) {
  if (!isOpen) return null;

  const [loadingIssue, setLoadingIssue] = useState(false);
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    type_bg: "",
    text_color: "",
  });

  // clearAlert-----------------------------------------------------------------------------------
  const clearAlert = () => {
    setAlert({ show: false, message: "", type_bg: "", text_color: "" });
  };
  // -------------------------------------------------------------------------------------------

  // handleReset-----------------------------------------------------------------------------------
  const handleReset = () => {
    setDataIssue({
      id: "",
      item_id: "",
      item_name: "",
      remark: "",
      issue_date: new Date().toISOString().split("T")[0],
      qty_prev: "",
      qty_issue: "",
    });
  };
  // -------------------------------------------------------------------------------------------

  // get balance-----------------------------------------------------------------------------------
  const [balance, setBalance] = useState(0);
  const getBalance = async (itemId: number) => {
    if (!itemId || !location) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/getBalance?location=${location.HR_DEPARTMENT_SUB_ID || location.HR_DEPARTMENT_ID}&item_id=${itemId}`,
      );
      const data = await res.json();
      setBalance(data.qty_balance ?? 0);
    } catch (error) {
      console.log(error);
      setBalance(0);
    }
  };

  // Fetch balance when item changes or modal opens
  useEffect(() => {
    if (isOpen && dataIssue.item_id && location) {
      getBalance(Number(dataIssue.item_id));
    } else {
      setBalance(0);
    }
  }, [dataIssue.item_id, isOpen, location]);
  // -------------------------------------------------------------------------------------------

  // submit-----------------------------------------------------------------------------------
  const [disabledForm, setDisabledForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingIssue(true);

    try {
      const selectedItem = items.find(
        (item) => item.item_id === dataIssue.item_id,
      );
      if (!selectedItem) {
        setAlert({
          show: true,
          message: "กรุณาเลือกรายการจากรายการที่กำหนด",
          type_bg: "bg-red-500/10",
          text_color: "text-red-600",
        });
        setLoadingIssue(false);
        return;
      }

      if (Number(dataIssue.qty_issue) > balance) {
        setAlert({
          show: true,
          message: `จำนวนเบิกเกินยอดคงเหลือ (คงเหลือ: ${balance})`,
          type_bg: "bg-red-500/10",
          text_color: "text-red-600",
        });
        setLoadingIssue(false);
        return;
      }

      const payload = {
        item_id: dataIssue.item_id,
        remark: dataIssue.remark,
        issue_date: dataIssue.issue_date,
        qty_prev: balance,
        qty_issue: dataIssue.qty_issue,
        location: location?.HR_DEPARTMENT_SUB_ID || location.HR_DEPARTMENT_ID,
        user_id: user?.id,
        ...(mode === "edit" && { id: dataIssue?.id }),
      };

      setAlert({ show: false, message: "", type_bg: "", text_color: "" });

      const url = mode === "add" ? "/api/issue/insertIssue" : "";

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setAlert({
          show: true,
          message: data.message || "เกิดข้อผิดพลาด",
          type_bg: "bg-red-500/10",
          text_color: "text-red-600",
        });
        return;
      } else {
        setAlert({
          show: true,
          message: data.message,
          type_bg: "bg-green-500/10",
          text_color: "text-green-600",
        });
        setDisabledForm(true);

        setTimeout(() => {
          setLoadingIssue(false);
          setDisabledForm(false);
          onClose();
          clearAlert();
          onSuccess();
          handleReset();
        }, 2000);
      }
    } catch (error) {
      console.error("Error issuing item:", error);
      setAlert({
        show: true,
        message: "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์",
        type_bg: "bg-red-500/10",
        text_color: "text-red-600",
      });
    } finally {
      if (!disabledForm) setLoadingIssue(false);
    }
  };
  // -------------------------------------------------------------------------------------------

  // handleCancel-----------------------------------------------------------------------------------
  const handleCancel = () => {
    onClose();
    clearAlert();
    handleReset();
  };
  // -------------------------------------------------------------------------------------------

  return (
    <dialog
      id="issueModal"
      className="modal modal-open z-100 bg-slate-900/40 backdrop-blur-xs"
    >
      <div className="modal-box w-11/12 max-w-lg bg-white border border-slate-200/50 shadow-2xl rounded-3xl p-8">
        <form onSubmit={handleSubmit}>
          <button
            type="button"
            className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors"
            onClick={() => handleCancel()}
            disabled={disabledForm || loadingIssue}
          >
            ✕
          </button>

          {/* title */}
          <h3 className="text-sky-900 font-bold text-lg tracking-tight">
            {mode === "add" ? "เพิ่มรายการเบิกพัสดุ" : "แก้ไขรายการเบิกพัสดุ"}
            <span className="text-orange-600 font-black px-1.5 py-0.5 rounded-md bg-orange-50 ml-1 text-lg">
              (Issue)
            </span>
          </h3>

          {/* form */}
          <div className="grid grid-cols-1 gap-4 text-sm py-4">
            {/* รายการ */}
            <div>
              <label
                htmlFor="issue_item_id"
                className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block"
              >
                รายการ
              </label>
              <input
                id="issue_item_id"
                name="issue_item_id"
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-400/10 transition-all duration-200 outline-none text-sm text-slate-700 placeholder:text-slate-400"
                list="issue-items-list"
                value={dataIssue.item_name || ""}
                onChange={(e) => {
                  const selectedItem = items.find(
                    (item) => item.item_name === e.target.value,
                  );
                  setDataIssue({
                    ...dataIssue,
                    item_name: e.target.value,
                    item_id: selectedItem?.item_id || "",
                  });
                }}
                placeholder="พิมพ์เพื่อค้นหารายการ..."
                required
                disabled={disabledForm || loadingIssue}
              />
              <datalist id="issue-items-list">
                {items.map((item) => (
                  <option key={item.item_id} value={item.item_name} />
                ))}
              </datalist>
            </div>

            {/* หน่วยนับ */}
            <div>
              <label
                htmlFor="issue_unit_name"
                className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block"
              >
                หน่วยนับ
              </label>
              <input
                id="issue_unit_name"
                name="issue_unit_name"
                value={
                  items.find((item) => item.item_id === dataIssue.item_id)
                    ?.unit_name || ""
                }
                type="text"
                className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl outline-none text-sm text-slate-500 cursor-not-allowed"
                disabled
              />
            </div>

            {/* หมายเหตุ */}
            <div>
              <label
                htmlFor="issue_remark"
                className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block"
              >
                หมายเหตุ
              </label>
              <textarea
                id="issue_remark"
                name="issue_remark"
                rows={3}
                value={dataIssue?.remark || ""}
                onChange={(e) => {
                  setDataIssue({ ...dataIssue, remark: e.target.value });
                }}
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-400/10 transition-all duration-200 outline-none text-sm text-slate-700 placeholder:text-slate-400"
                disabled={disabledForm || loadingIssue}
              />
            </div>

            {/* วันที่เบิก */}
            <div>
              <label
                htmlFor="issue_date"
                className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block"
              >
                วันที่เบิกพัสดุ
              </label>
              <input
                id="issue_date"
                name="issue_date"
                max={new Date().toISOString().split("T")[0]}
                value={dataIssue?.issue_date || ""}
                onChange={(e) => {
                  setDataIssue({ ...dataIssue, issue_date: e.target.value });
                }}
                type="date"
                required
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-400/10 transition-all duration-200 outline-none text-sm text-slate-700"
              />
            </div>

            {/* ยอดยกมา + จำนวนเบิก (2 columns) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="issue_qty_prev"
                  className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block"
                >
                  ยอดคงเหลือ
                </label>
                <input
                  id="issue_qty_prev"
                  name="issue_qty_prev"
                  value={balance || 0}
                  type="text"
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl outline-none text-sm text-slate-500 cursor-not-allowed font-semibold"
                  disabled
                />
              </div>

              <div>
                <label
                  htmlFor="issue_qty_issue"
                  className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block"
                >
                  จำนวนเบิก
                </label>
                <input
                  id="issue_qty_issue"
                  name="issue_qty_issue"
                  maxLength={6}
                  value={dataIssue?.qty_issue || ""}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setDataIssue({
                      ...dataIssue,
                      qty_issue: value ? Number(value) : "",
                    });
                  }}
                  type="text"
                  placeholder="0"
                  className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-400/10 transition-all duration-200 outline-none text-sm text-slate-700"
                  required
                  disabled={disabledForm || loadingIssue}
                />
              </div>
            </div>

            {/* ยอดคงเหลือหลังเบิก */}
            {dataIssue.qty_issue !== "" && (
              <div className="rounded-xl bg-orange-50 border border-orange-100 px-4 py-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-orange-600 uppercase tracking-wider">
                  ยอดคงเหลือหลังเบิก
                </span>
                <span
                  className={`font-black text-lg ${
                    balance - Number(dataIssue.qty_issue) < 0
                      ? "text-red-600"
                      : "text-orange-600"
                  }`}
                >
                  {balance - Number(dataIssue.qty_issue || 0)}
                </span>
              </div>
            )}

            {/* Alert */}
            {alert.show && (
              <div
                role="alert"
                className={`alert ${alert.type_bg} ${alert.text_color} p-4 rounded-xl shadow flex items-center justify-center space-x-2 text-center`}
              >
                <span>{alert.message}</span>
              </div>
            )}
          </div>

          {/* buttons */}
          <div className="flex justify-end items-center gap-3 mt-3">
            <button
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-xl active:scale-[0.98] transition-all duration-200 text-sm cursor-pointer"
              type="button"
              onClick={() => handleCancel()}
              disabled={disabledForm || loadingIssue}
            >
              ยกเลิก
            </button>

            <button
              className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 active:scale-[0.98] transition-all duration-200 text-sm cursor-pointer"
              type="submit"
              disabled={disabledForm || loadingIssue}
            >
              {loadingIssue ? (
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
  );
}

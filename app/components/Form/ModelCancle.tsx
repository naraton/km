import React, { useEffect, useState } from "react";

interface IssueCancelFormProps {
  mode: string;
  modelCancel: boolean;
  setModelCancel: React.Dispatch<React.SetStateAction<boolean>>;
  reference_id: number | string;
  user: any;
  onSuccess: () => void;
}

export default function ModelCancle({
  mode,
  modelCancel,
  setModelCancel,
  reference_id,
  user,
  onSuccess,
}: IssueCancelFormProps) {
  if (!modelCancel) return null;

  const [loadingCancel, setLoadingCancel] = useState(false);
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    type_bg: "",
    text_color: "",
  });
  const [disabledForm, setDisabledForm] = useState(false);

  // clearAlert-----------------------------------------------------------------------------------
  const clearAlert = () => {
    setAlert({ show: false, message: "", type_bg: "", text_color: "" });
  };
  // -------------------------------------------------------------------------------------------

  // handleSubmit-----------------------------------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingCancel(true);

    try {
      const formData = new FormData(e.currentTarget as HTMLFormElement);
      const payload = {
        reference_id: reference_id,
        remark: formData.get("remark") as string,
        user_id: user.id,
      };

      clearAlert();

      const url =
        mode === "issue"
          ? "/api/issue/cancelIssue"
          : "/api/receive/cancelReceive";

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setAlert({
          show: true,
          message: data.message,
          type_bg: "bg-red-500/10",
          text_color: "text-red-600",
        });
      } else {
        setAlert({
          show: true,
          message: data.message,
          type_bg: "bg-green-500/10",
          text_color: "text-green-600",
        });

        setDisabledForm(true);

        setTimeout(() => {
          onSuccess();
          setModelCancel(false);
        }, 2000);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingCancel(false);
    }
  };
  // -------------------------------------------------------------------------------------------

  return (
    <dialog
      id="cancelModal"
      className="modal modal-open z-100 bg-slate-900/40 backdrop-blur-sm"
    >
      <div className="modal-box w-11/12 max-w-md bg-white border border-slate-200 shadow-2xl rounded-3xl p-8 relative">
        {/* close */}
        <button
          type="button"
          className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 text-slate-400 hover:text-slate-600"
          onClick={() => setModelCancel(false)}
          disabled={disabledForm || loadingCancel}
        >
          ✕
        </button>

        {/* icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center shadow-sm">
            <span className="text-3xl">⚠️</span>
          </div>
        </div>

        {/* title */}
        <h3 className="text-red-600 font-bold text-xl text-center mt-4">
          ยืนยันการยกเลิกรายการ
        </h3>

        {/* message */}
        <div className="mt-4 text-center space-y-2">
          <p className="text-slate-700 font-bold text-sm">
            คุณต้องการยกเลิกรายการนี้ใช่หรือไม่?
          </p>

          <p className="text-sm text-slate-500 leading-relaxed">
            เมื่อยืนยันแล้ว ระบบจะคืนจำนวนพัสดุกลับเข้าสู่คลัง <br />
            และบันทึกประวัติการเปลี่ยนแปลง
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* warning box */}
          <div className="mt-5 p-3 rounded-xl bg-amber-50 border border-amber-200">
            <p className="text-sm text-amber-700 text-center font-medium">
              การดำเนินการนี้ไม่สามารถแก้ไขย้อนหลังได้
            </p>
          </div>

          {/* หมายเหตุ */}
          <div className="mt-4">
            <label
              htmlFor="remark"
              className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block"
            >
              เหตุผลการยกเลิก
            </label>
            <textarea
              id="remark"
              name="remark"
              rows={3}
              className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-400/10 transition-all duration-200 outline-none text-sm text-slate-700 placeholder:text-slate-400"
              disabled={disabledForm || loadingCancel}
              required
            />
          </div>

          {/* alert */}
          {alert.show && (
            <div
              className={`${alert.type_bg} p-3 rounded-xl ${alert.text_color} text-center mt-4`}
            >
              <p className="text-sm font-medium">{alert.message}</p>
            </div>
          )}

          {/* buttons */}
          <div className="flex justify-center gap-3 mt-4">
            <button
              type="button"
              onClick={() => setModelCancel(false)}
              disabled={disabledForm || loadingCancel}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm rounded-xl transition cursor-pointer disabled:opacity-70"
            >
              ปิด
            </button>

            <button
              className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg shadow-red-500/10 hover:shadow-red-500/20 active:scale-[0.98] transition-all duration-200 text-sm cursor-pointer"
              type="submit"
              disabled={disabledForm || loadingCancel}
            >
              {loadingCancel ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>กำลังดำเนินการ...</span>
                </div>
              ) : (
                "ยืนยันการยกเลิก"
              )}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}

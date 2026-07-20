import { useEffect, useState } from "react";

interface ReceiveFormProps {
  mode: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  location: any;
  user: any;
  dataReceive: any;
  setDataReceive: any;
  items: any[];
}

export default function ReceiveForm({
  mode,
  isOpen,
  onClose,
  onSuccess,
  location,
  user,
  dataReceive,
  setDataReceive,
  items,
}: ReceiveFormProps) {
  if (!isOpen) return null;

  const [loadingIReceive, setloadingIReceive] = useState(false);
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    type_bg: "",
    text_coler: "",
  });

  // clearAlert-----------------------------------------------------------------------------------
  const clearAlert = () => {
    setAlert({ show: false, message: "", type_bg: "", text_coler: "" });
  };
  // -------------------------------------------------------------------------------------------

  // handleReset-----------------------------------------------------------------------------------
  const handleReset = () => {
    setDataReceive({
      id: "",
      item_id: "",
      item_name: "",
      remark: "",
      receive_date: new Date().toISOString().split("T")[0],
      qty_prev: "",
      qty_new: "",
    });
  };
  // -------------------------------------------------------------------------------------------

  // get balance-----------------------------------------------------------------------------------
  const [balance, setBalance] = useState(0);
  const getBalance = async (itemId: number) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/getBalance?location=${location.HR_DEPARTMENT_SUB_ID || location.HR_DEPARTMENT_ID}&item_id=${itemId}`,
      );

      const data = await res.json();

      setBalance(data.qty_balance);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch balance when item changes or modal opens
  useEffect(() => {
    if (isOpen && dataReceive.item_id && location) {
      getBalance(Number(dataReceive.item_id));
    } else {
      setBalance(0);
    }
  }, [dataReceive.item_id, isOpen, location]);
  // -------------------------------------------------------------------------------------------

  // submit-----------------------------------------------------------------------------------
  const [disabledForm, setDisabledForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setloadingIReceive(true);

    try {
      const payload = {
        item_id: dataReceive.item_id,
        remark: dataReceive.remark,
        receive_date: dataReceive.receive_date,
        qty_prev: balance,
        qty_new: dataReceive.qty_new,
        location: location?.HR_DEPARTMENT_SUB_ID || location.HR_DEPARTMENT_ID,
        user_id: user?.id,
        ...(mode === "edit" && { id: dataReceive?.id }),
      };

      const selectedItem = items.find(
        (item) => item.item_id === dataReceive.item_id,
      );
      if (!selectedItem) {
        setAlert({
          show: true,
          message: "กรุณาเลือกรายการจากรายการที่กำหนด",
          type_bg: "bg-red-500/10",
          text_coler: "text-red-600",
        });

        setDisabledForm(false);
        setloadingIReceive(false);

        return;
      }

      setAlert({ show: false, message: "", type_bg: "", text_coler: "" });

      const url = mode === "add" ? "/api/receive/insertReceive" : "";

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setAlert({
          show: true,
          message: data.message,
          type_bg: "bg-red-500/10",
          text_coler: "text-red-600",
        });

        return;
      } else {
        setAlert({
          show: true,
          message: data.message,
          type_bg: "bg-green-500/10",
          text_coler: "text-green-600",
        });

        setDisabledForm(true);

        setTimeout(() => {
          setloadingIReceive(false);
          setDisabledForm(false);
          onClose();
          clearAlert();
          onSuccess();
          handleReset();
        }, 2000);
      }
    } catch (error) {
      console.error("Error adding item:", error);
      setAlert({
        show: true,
        message: "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์",
        type_bg: "bg-red-500/10",
        text_coler: "text-red-600",
      });
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
      id="followModal"
      className="modal modal-open z-100 bg-slate-900/40 backdrop-blur-xs"
    >
      <div className="modal-box w-11/12 max-w-lg bg-white border border-slate-200/50 shadow-2xl rounded-3xl p-8">
        <form onSubmit={handleSubmit}>
          <button
            type="button"
            className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors"
            onClick={() => handleCancel()}
            disabled={disabledForm || loadingIReceive}
          >
            ✕
          </button>

          {/* title */}
          <h3 className="text-sky-900 font-bold text-lg tracking-tight">
            {mode === "add" ? "เพิ่มรายการรับพัสดุ" : "แก้ไขรายการรับพัสดุ"}
            <span className="text-blue-600 font-black px-1.5 py-0.5 rounded-md bg-blue-50 ml-1 text-lg">
              (Receive)
            </span>
          </h3>

          {/* form */}
          <div className="grid grid-cols-1 gap-4 text-sm py-2">
            {/* รายการ */}
            <div>
              <label
                htmlFor="item_id"
                className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block"
              >
                รายการ
              </label>
              <input
                id="item_id"
                name="item_id"
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all duration-200 outline-none text-sm text-slate-700 placeholder:text-slate-400"
                list="items-list"
                value={dataReceive.item_name || ""}
                onChange={(e) => {
                  const selectedItem = items.find(
                    (item) => item.item_name === e.target.value,
                  );

                  setDataReceive({
                    ...dataReceive,
                    item_name: e.target.value,
                    item_id: selectedItem?.item_id || "",
                  });
                }}
                required
                disabled={disabledForm || loadingIReceive}
              />

              <datalist id="items-list">
                {items.map((item) => (
                  <option key={item.item_id} value={item.item_name} />
                ))}
              </datalist>
            </div>

            {/* หน่วยนับ */}
            <div>
              <label
                htmlFor="qty_prev"
                className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block"
              >
                หน่วยนับ
              </label>
              <input
                id="unit_name"
                name="unit_name"
                value={
                  items.find((item) => item.item_id === dataReceive.item_id)
                    ?.unit_name || ""
                }
                type="text"
                className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl outline-none text-sm text-slate-500 cursor-not-allowed font-semibold"
                disabled
              />
            </div>

            {/* หมายเหตุ */}
            <div>
              <label
                htmlFor="remark"
                className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block"
              >
                หมายเหตุ
              </label>
              <textarea
                id="remark"
                name="remark"
                rows={3}
                value={dataReceive?.remark || ""}
                onChange={(e) => {
                  setDataReceive({ ...dataReceive, remark: e.target.value });
                }}
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all duration-200 outline-none text-sm text-slate-700 placeholder:text-slate-400"
                disabled={disabledForm || loadingIReceive}
              />
            </div>

            {/* วันที่รับพัสดุ */}
            <div>
              <label
                htmlFor="receive_date"
                className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block"
              >
                วันที่รับพัสดุ
              </label>
              <input
                id="receive_date"
                name="receive_date"
                max={new Date().toISOString().split("T")[0]}
                value={dataReceive?.receive_date || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setDataReceive({
                    ...dataReceive,
                    receive_date: value,
                  });
                }}
                type="date"
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all duration-200 outline-none text-sm text-slate-700 placeholder:text-slate-400"
              />
            </div>

            {/* ยอดยกมา + พัสดุเบิกใหม่ */}
            <div className="grid grid-cols-2 gap-3">
              {/* ยอดยกมา */}
              <div>
                <label
                  htmlFor="qty_prev"
                  className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block"
                >
                  ยอดยกมา
                </label>
                <input
                  id="qty_prev"
                  name="qty_prev"
                  maxLength={3}
                  value={balance || 0}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setDataReceive({
                      ...dataReceive,
                      qty_prev: value ? Number(value) : "",
                    });
                  }}
                  type="text"
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl outline-none text-sm text-slate-500 cursor-not-allowed font-semibold"
                  disabled
                />
              </div>

              {/* พัสดุเบิกใหม่ */}
              <div>
                <label
                  htmlFor="qty_new"
                  className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block"
                >
                  พัสดุเบิกใหม่
                </label>
                <input
                  id="qty_new"
                  name="qty_new"
                  maxLength={3}
                  value={dataReceive?.qty_new || ""}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setDataReceive({
                      ...dataReceive,
                      qty_new: value ? Number(value) : "",
                    });
                  }}
                  type="text"
                  className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all duration-200 outline-none text-sm text-slate-700 placeholder:text-slate-400"
                  required
                  disabled={disabledForm || loadingIReceive}
                />
              </div>
            </div>

            {/* Alert */}
            {alert.show && (
              <div
                role="alert"
                className={`alert ${alert.type_bg} ${alert.text_coler} p-4 rounded-xl shadow flex items-center justify-center space-x-2 text-center`}
              >
                <span>{alert.message}</span>
              </div>
            )}
          </div>

          {/* button */}
          <div className="flex justify-end items-center gap-3 mt-3">
            <button
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-xl active:scale-[0.98] transition-all duration-200 text-sm cursor-pointer"
              type="button"
              onClick={() => handleCancel()}
              disabled={disabledForm || loadingIReceive}
            >
              ยกเลิก
            </button>

            <button
              className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg shadow-sky-500/10 hover:shadow-sky-500/20 active:scale-[0.98] transition-all duration-200 text-sm cursor-pointer"
              type="submit"
              disabled={disabledForm || loadingIReceive}
            >
              {loadingIReceive ? (
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

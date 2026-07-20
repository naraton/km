import { useEffect, useState } from "react";

interface ItemFormProps {
  mode: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  dataItem: any;
  dataUnits: any;
  setDataItem: React.Dispatch<React.SetStateAction<any>>;
  categories: any;
}

export default function ItemForm({
  mode,
  isOpen,
  onClose,
  onSuccess,
  dataItem,
  dataUnits,
  setDataItem,
  categories,
}: ItemFormProps) {
  if (!isOpen) return null;

  const [loadingItem, setLoadingItem] = useState(false);
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    type_bg: "",
    text_coler: "",
  });

  const clearAlert = () => {
    setAlert({ show: false, message: "", type_bg: "", text_coler: "" });
  };

  const handleReset = () => {
    setDataItem({
      id: "",
      name: "",
      categories_id: "",
      unit_id: "",
      alert_qty: "",
    });
  };

  const [disabledForm, setDisabledForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoadingItem(true);

    try {
      const payload = {
        name: dataItem.name,
        categories_id: dataItem.categories_id,
        unit_id: dataItem.unit_id,
        alert_qty: dataItem.alert_qty,
        ...(mode === "edit" && { id: dataItem?.id }),
      };

      const url =
        mode === "add" ? "/api/items/insertItems" : "/api/items/updateItems";

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
          setLoadingItem(false);
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

  const handleCancel = () => {
    onClose();
    clearAlert();
    handleReset();
  };

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
            disabled={disabledForm || loadingItem}
          >
            ✕
          </button>

          {/* title */}
          <h3 className="text-sky-900 font-bold text-lg tracking-tight">
            {mode === "add" ? "เพิ่มรายการพัสดุ" : "แก้ไขรายการพัสดุ"}
            <span className="text-blue-600 font-black px-1.5 py-0.5 rounded-md bg-blue-50 ml-1 text-lg">
              (Items)
            </span>
          </h3>

          {/* form */}
          <div className="grid grid-cols-1 gap-4 text-sm py-2">
            <div>
              <label
                htmlFor="ItemName"
                className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block"
              >
                รายการ
              </label>
              <input
                id="ItemName"
                name="ItemName"
                value={dataItem?.name || ""}
                onChange={(e) => {
                  setDataItem({ ...dataItem, name: e.target.value });
                }}
                type="text"
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all duration-200 outline-none text-sm text-slate-700 placeholder:text-slate-400"
                disabled={disabledForm || loadingItem}
                required
              />
            </div>

            <div>
              <label
                htmlFor="ItemDetail"
                className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block"
              >
                รายละเอียดเพิ่มเติม
              </label>
              <select
                id="ItemDetail"
                name="ItemDetail"
                value={dataItem?.categories_id || ""}
                onChange={(e) => {
                  setDataItem({ ...dataItem, categories_id: e.target.value });
                }}
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all duration-200 outline-none text-sm text-slate-700 placeholder:text-slate-400"
                disabled={disabledForm || loadingItem}
              >
                <option value="">-- กรุณาเลือกหมวดหมู่ --</option>
                {categories?.map((category: any) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="ItemUnit"
                className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block"
              >
                หน่วยนับ
              </label>
              <select
                id="ItemUnit"
                name="ItemUnit"
                value={dataItem?.unit_id || ""}
                onChange={(e) => {
                  setDataItem({ ...dataItem, unit_id: e.target.value });
                }}
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all duration-200 outline-none text-sm text-slate-700 placeholder:text-slate-400"
                disabled={disabledForm || loadingItem}
              >
                <option value="">-- กรุณาเลือกหน่วยนับ --</option>
                {dataUnits?.map((unit: any) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="ItemAlertQty"
                className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block"
              >
                จำนวนการแจ้งเตือน
              </label>
              <input
                id="ItemAlertQty"
                name="ItemAlertQty"
                maxLength={3}
                value={dataItem?.alert_qty || ""}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setDataItem({
                    ...dataItem,
                    alert_qty: value ? Number(value) : "",
                  });
                }}
                type="text"
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all duration-200 outline-none text-sm text-slate-700 placeholder:text-slate-400"
                disabled={disabledForm || loadingItem}
              />
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
              disabled={disabledForm || loadingItem}
            >
              ยกเลิก
            </button>

            <button
              className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg shadow-sky-500/10 hover:shadow-sky-500/20 active:scale-[0.98] transition-all duration-200 text-sm cursor-pointer"
              type="submit"
              disabled={disabledForm || loadingItem}
            >
              {loadingItem ? (
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

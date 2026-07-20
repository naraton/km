export default function NoPermission() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-sky-200 via-white to-teal-100 px-4">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10 max-w-md w-full text-center">
        {/* Icon */}
        <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
          <span className="text-3xl text-red-500">🚫</span>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          ไม่สามารถเข้าใช้งานหน้านี้ได้
        </h1>

        {/* categories_id */}
        <p className="text-gray-500 mb-6 leading-relaxed">
          บัญชีผู้ใช้นี้ไม่มีสิทธิ์เข้าถึงเมนูที่คุณเลือก <br />
          หากคิดว่าเป็นข้อผิดพลาด กรุณาติดต่อผู้ดูแลระบบ
        </p>

        {/* Action */}
        <a
          href="/requests-to-contact"
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-linear-300 from-sky-500 to-teal-500 text-white font-medium shadow hover:opacity-90 transition"
        >
          กลับไปหน้า (บันทึกข้อมูล)
        </a>

        {/* Footer note */}
        <p className="text-xs text-gray-400 mt-6">
          iStock · Thanyarak Chaingmai Hospital
        </p>
      </div>
    </div>
  );
}

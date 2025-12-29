import { Plus } from "lucide-react"

export default function Menu() {
  return (
    <section id="menu" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gray-950">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-gray-50 mb-4">Thực đơn</h2>
          <div className="w-16 h-1 bg-green-500 mx-auto mb-6 rounded-full"></div>
          <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Khám phá thực đơn đa dạng với các món ăn được chế biến từ nguyên liệu tươi ngon nhất
          </p>
        </div>

        {/* Placeholder for Menu Grid */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-4xl bg-gray-900 border border-gray-800 rounded-lg p-12 text-center hover:border-green-500/50 transition-all duration-300">
            <div className="flex flex-col items-center gap-4">
              <Plus className="w-16 h-16 text-gray-600" />
              <p className="text-gray-400 text-lg">Menu sẽ được hiển thị ở đây</p>
              <p className="text-gray-500 text-sm max-w-md">
                Chúng tôi đang cập nhật thực đơn mới với nhiều món ăn hấp dẫn. Vui lòng quay lại sau!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

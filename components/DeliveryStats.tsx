export default function DeliveryStats() {
  return (
    <section className="px-6 py-16">
      <h2 className="text-2xl font-bold text-center mb-8">
        Сколько обычно идёт доставка
      </h2>

      <div className="max-w-xl mx-auto space-y-4">
        
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>До 9 дней</span>
            <span>66%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div className="h-2 bg-blue-600 rounded-full w-[66%]"></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>До 12 дней</span>
            <span>84%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div className="h-2 bg-blue-600 rounded-full w-[84%]"></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>До 15 дней</span>
            <span>96%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div className="h-2 bg-blue-600 rounded-full w-[96%]"></div>
          </div>
        </div>

      </div>
    </section>
  );
}
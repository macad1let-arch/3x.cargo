import Link from "next/link";

export default function MiniCalculator() {
  return (
    <section className="px-6 py-16">
      <div className="rounded-2xl border p-8 text-center">
        <h2 className="text-2xl font-bold">Рассчитайте стоимость доставки</h2>

        <p className="mt-3 text-gray-600">
          Укажите вес и получите примерный расчёт доставки из Китая в Бишкек.
        </p>

        <Link
          href="/calculator"
          className="mt-6 inline-block rounded-xl bg-blue-600 px-6 py-3 text-white"
        >
          Открыть калькулятор
        </Link>
      </div>
    </section>
  );
}   
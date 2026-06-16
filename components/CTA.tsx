import Link from "next/link";

export default function CTA() {
  return (
    <section className="px-6 py-16 bg-blue-950 text-white text-center">
      <h2 className="text-2xl font-bold">
        Готовы начать доставку из Китая?
      </h2>

      <p className="mt-3 text-blue-100">
        Получите личный код, рассчитайте стоимость или напишите нам напрямую.
      </p>

      <div className="mt-6 flex flex-col gap-3 justify-center sm:flex-row">
        <Link href="/register" className="rounded-xl bg-white px-6 py-3 text-blue-950">
          Получить код
        </Link>

        <Link href="/calculator" className="rounded-xl border border-white px-6 py-3">
          Рассчитать стоимость
        </Link>

        <a href="https://wa.me/996220343053" className="rounded-xl bg-green-600 px-6 py-3">
          WhatsApp
        </a>
      </div>
    </section>
  );
}
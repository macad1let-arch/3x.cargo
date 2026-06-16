import Link from "next/link";

export default function MiniTracking() {
  return (
    <section className="px-6 py-16 bg-gray-50">
      <div className="rounded-2xl border bg-white p-8 text-center">
        <h2 className="text-2xl font-bold">Отследите ваш груз</h2>

        <p className="mt-3 text-gray-600">
          Введите трек-код на странице отслеживания и проверьте статус посылки.
        </p>

        <Link
          href="/tracking"
          className="mt-6 inline-block rounded-xl bg-blue-600 px-6 py-3 text-white"
        >
          Перейти к отслеживанию
        </Link>
      </div>
    </section>
  );
}
import Link from "next/link";

const services = [
  { title: "Обучение", href: "/services/education" },
  { title: "Открыть карго", href: "/services/open-cargo" },
  { title: "Обмен юаней", href: "/services/exchange" },
  { title: "Выкуп товара", href: "/services/buyout" },
  { title: "Проверка / упаковка", href: "/services/inspection" },
  { title: "Обрешётка", href: "/services/crate" },
  { title: "Туры в Китай", href: "/services/tours" },
];

export default function ServicesPage() {
  return (
    <main className="px-6 py-16">
      <h1 className="mb-8 text-3xl font-bold">Услуги</h1>

      <div className="grid gap-4 md:grid-cols-3">
        {services.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-xl border p-6 hover:bg-gray-100"
          >
            {item.title}
          </Link>
        ))}
      </div>
    </main>
  );
}
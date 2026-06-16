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

export default function Services() {
  return (
    <section className="px-6 py-16">
      <h2 className="text-2xl font-bold mb-8">Услуги</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {services.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="border p-6 rounded-xl hover:bg-gray-100 transition"
          >
            {item.title}
          </Link>
        ))}
      </div>
    </section>
  );
}
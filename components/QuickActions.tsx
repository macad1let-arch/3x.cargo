import Link from "next/link";

const actions = [
  { title: "Отследить посылку", href: "/tracking" },
  { title: "Рассчитать стоимость", href: "/calculator" },
  { title: "Обменять юани", href: "/services/exchange" },
  { title: "Оставить заявку", href: "/contact" },
];

export default function QuickActions() {
  return (
    <section className="px-6 py-12 bg-gray-50">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Быстрые действия
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="p-6 border rounded-xl text-center hover:bg-white transition shadow-sm"
          >
            {item.title}
          </Link>
        ))}
      </div>
    </section>
  );
}
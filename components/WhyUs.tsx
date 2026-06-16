const items = [
  {
    title: "Собственный склад в Китае",
    desc: "Полный контроль над вашими товарами",
  },
  {
    title: "Быстрая доставка",
    desc: "В среднем 7–12 дней до Бишкека",
  },
  {
    title: "Прозрачные цены",
    desc: "Без скрытых комиссий и переплат",
  },
  {
    title: "Поддержка 24/7",
    desc: "Всегда на связи в WhatsApp и Telegram",
  },
];

export default function WhyUs() {
  return (
    <section className="px-6 py-16 bg-gray-50">
      <h2 className="text-2xl font-bold mb-8 text-center">
        Почему нам доверяют
      </h2>

      <div className="grid md:grid-cols-4 gap-4">
        {items.map((item) => (
          <div key={item.title} className="p-6 border rounded-xl bg-white">
            <h3 className="font-semibold mb-2">{item.title}</h3>
            <p className="text-sm text-gray-600">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
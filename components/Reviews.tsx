const reviews = [
  {
    name: "Азамат",
    text: "Заказывал товар для магазина, всё пришло вовремя. Удобно, что можно отследить статус.",
  },
  {
    name: "Айдана",
    text: "Помогли с выкупом и доставкой. Для новичка всё объяснили понятно.",
  },
  {
    name: "Бекжан",
    text: "Понравилось, что есть поддержка и можно быстро узнать по грузу.",
  },
];

export default function Reviews() {
  return (
    <section className="bg-gray-50 px-6 py-16">
      <h2 className="mb-8 text-center text-2xl font-bold">
        Что говорят клиенты
      </h2>

      <div className="grid gap-4 md:grid-cols-3">
        {reviews.map((review) => (
          <div key={review.name} className="rounded-xl border bg-white p-6">
            <p className="text-gray-700">“{review.text}”</p>
            <div className="mt-4 font-semibold">{review.name}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
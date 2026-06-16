const steps = [
  "Регистрируетесь и получаете личный код",
  "Отправляете товар на наш склад в Китае",
  "Мы принимаем, проверяем и упаковываем груз",
  "Доставляем в Бишкек",
  "Вы отслеживаете статус и забираете посылку",
];

export default function HowItWorks() {
  return (
    <section className="px-6 py-16">
      <h2 className="text-2xl font-bold mb-8 text-center">
        Как это работает
      </h2>

      <div className="grid gap-4 md:grid-cols-5">
        {steps.map((step, index) => (
          <div key={step} className="rounded-xl border p-5">
            <div className="mb-3 text-sm text-gray-500">Шаг {index + 1}</div>
            <p className="font-medium">{step}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
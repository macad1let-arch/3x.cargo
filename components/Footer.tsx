import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-950 px-6 py-10 text-white">
      <div className="grid gap-8 md:grid-cols-4">
        <div>
          <h3 className="font-bold">CARGO</h3>
          <p className="mt-3 text-sm text-slate-300">
            Доставка товаров из Китая в Бишкек.
          </p>
        </div>

        <div>
          <h4 className="font-semibold">Компания</h4>
          <div className="mt-3 flex flex-col gap-2 text-sm text-slate-300">
            <Link href="/about">О нас</Link>
            <Link href="/faq">FAQ</Link>
            <Link href="/contact">Контакты</Link>
          </div>
        </div>

        <div>
          <h4 className="font-semibold">Услуги</h4>
          <div className="mt-3 flex flex-col gap-2 text-sm text-slate-300">
            <Link href="/services/education">Обучение</Link>
            <Link href="/services/open-cargo">Открыть карго</Link>
            <Link href="/services/exchange">Обмен юаней</Link>
            <Link href="/services/buyout">Выкуп товара</Link>
          </div>
        </div>

        <div>
          <h4 className="font-semibold">Клиентам</h4>
          <div className="mt-3 flex flex-col gap-2 text-sm text-slate-300">
            <Link href="/calculator">Калькулятор</Link>
            <Link href="/tracking">Отслеживание</Link>
            <Link href="/login">Войти</Link>
            <Link href="/register">Регистрация</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
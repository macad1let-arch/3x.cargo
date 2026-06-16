import Link from "next/link";

export default function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b bg-white">
      
      {/* Лого */}
      <div className="text-xl font-bold">
        CARGO
      </div>

      {/* Меню */}
      <nav className="hidden md:flex gap-6 text-sm">
        <Link href="/">Главная</Link>
        <Link href="/calculator">Калькулятор</Link>
        <Link href="/tracking">Отслеживание</Link>
        <Link href="/services/education">Обучение</Link>
        <Link href="/contact">Контакты</Link>
      </nav>

      {/* Правая часть */}
      <div className="flex items-center gap-3">
        <Link href="/login" className="text-sm">
          Войти
        </Link>

        <Link
          href="/register"
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm"
        >
          Получить код
        </Link>
      </div>
    </header>
  );
}
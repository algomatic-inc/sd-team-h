function Header() {
  return (
    <header className="absolute inset-x-0 top-0 z-50 border-b">
      <nav className="flex items-center justify-between p-4 lg:px-8">
        <div className="flex lg:flex-1 text-xl">
          <a href="/" className="-m-1.5 p-1.5 text-slate-900 font-semibold">
            <span>Route Planner</span>
          </a>
        </div>
      </nav>
    </header>
  );
}

export default Header;

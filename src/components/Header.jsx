import React from 'react'

const Header = () => {
  return (
    <header className="header">
      <div className="container">
        <h1 className="main-title">
          🧀 ТВОРОЖНИКИ, НЕ СЫРНИКИ!
        </h1>
        <p className="subtitle">
          Пора восстановить историческую справедливость в названии любимого блюда
        </p>
        <nav className="navigation">
          <a href="#problem" className="nav-link">Проблема</a>
          <a href="#solution" className="nav-link">Решение</a>
          <a href="#vote" className="nav-link">Голосование</a>
          <a href="#statistics" className="nav-link">Статистика</a>
        </nav>
      </div>
    </header>
  )
}

export default Header
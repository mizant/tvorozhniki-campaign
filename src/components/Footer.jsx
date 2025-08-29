import React from 'react'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h4>О проекте</h4>
            <p>
              Инициатива по восстановлению исторической справедливости 
              в названии творожных оладий.
            </p>
            <p>
              Мы за логику, мы за правду, мы за ТВОРОЖНИКИ!
            </p>
          </div>

          <div className="footer-section">
            <h4>Поддержите нас</h4>
            <div className="social-links">
              <a href="#" className="social-link">📱 Telegram</a>
              <a href="#" className="social-link">📘 ВКонтакте</a>
              <a href="#" className="social-link">📧 Email</a>
            </div>
          </div>

          <div className="footer-section">
            <h4>Полезные ссылки</h4>
            <ul className="footer-links">
              <li><a href="#">История творога в России</a></li>
              <li><a href="#">Этимология слова "сыр"</a></li>
              <li><a href="#">Рецепты настоящих творожников</a></li>
              <li><a href="#">Мнения лингвистов</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Факт дня</h4>
            <div className="daily-fact">
              <p>
                💡 <strong>Знали ли вы?</strong><br/>
                В старославянском языке слово "сыр" обозначало любой 
                кисломолочный продукт, включая творог. Но времена изменились!
              </p>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-motto">
            <p>🧀 <strong>"Творог в основе — творожники в названии!"</strong> 🧀</p>
          </div>
          <div className="footer-meta">
            <p>
              © 2024 Инициативная группа "Творожники, не сырники!" 
              | Сделано с любовью к русскому языку и творогу
            </p>
          </div>
          <div className="footer-disclaimer">
            <p style={{ fontSize: '0.7rem', opacity: '0.7', textAlign: 'center', marginTop: '10px' }}>
              ⚠️ Это шуточная инициатива. Не предполагает дальнейших реальных действий. 
              Все совпадения с реальными событиями случайны.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
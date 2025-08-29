import React from 'react'

const ProblemSection = () => {
  return (
    <section id="problem" className="problem-section">
      <div className="container">
        <h2>В чём проблема? 🤔</h2>
        
        <div className="problem-content">
          <div className="problem-card">
            <h3>📚 Историческая несправедливость</h3>
            <p>
              <strong>Сырники</strong> готовятся из <strong>творога</strong>, а не из сыра! 
              Это явное противоречие, которое вводит в заблуждение миллионы людей.
            </p>
            <p>
              Название "сырники" происходит от старорусского слова "сыр", которое 
              в те времена означало именно творог. Но язык развивается, и сейчас 
              "сыр" — это совершенно другой продукт!
            </p>
          </div>

          <div className="problem-card">
            <h3>🧀 Путаница в ингредиентах</h3>
            <div className="ingredients-comparison">
              <div className="ingredient-wrong">
                <h4>❌ Что думают люди</h4>
                <p>Сырники = Сыр + мука + яйца</p>
                <p className="note">Попробуйте сделать из сыра — получится каша!</p>
              </div>
              <div className="ingredient-right">
                <h4>✅ Что на самом деле</h4>
                <p>Сырники = Творог + мука + яйца</p>
                <p className="note">Именно творог даёт нужную текстуру и вкус!</p>
              </div>
            </div>
          </div>

          <div className="problem-card">
            <h3>🌍 Мировая практика</h3>
            <p>
              В большинстве стран мира подобные блюда называются по основному ингредиенту:
            </p>
            <ul className="world-examples">
              <li><strong>Англия:</strong> Cottage cheese pancakes (творожные оладьи)</li>
              <li><strong>Германия:</strong> Quarkpfannkuchen (творожные блинчики)</li>
              <li><strong>Польша:</strong> Racuchy z twarogu (творожные рачухи)</li>
              <li><strong>Украина:</strong> Сирники (от слова "сир" = творог)</li>
            </ul>
            <p className="highlight">
              Только в России мы упорно называем творожное блюдо "сырниками"!
            </p>
          </div>

          <div className="problem-card">
            <h3>👨‍🍳 Мнение шеф-поваров</h3>
            <blockquote>
              "Каждый раз, когда я слышу 'сырники из творога', у меня начинается 
              лёгкий тик. Это всё равно что сказать 'картофельное пюре из моркови'."
              <cite>— Условный шеф-повар Иванов</cite>
            </blockquote>
          </div>
        </div>

        <div className="call-to-action">
          <h3>🎯 Пора исправить эту историческую несправедливость!</h3>
          <p>
            Давайте вместе вернём логику в русский язык и начнём называть 
            творожные оладьи их правильным именем — <strong>ТВОРОЖНИКИ</strong>!
          </p>
        </div>
      </div>
    </section>
  )
}

export default ProblemSection
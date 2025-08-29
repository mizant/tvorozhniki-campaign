import React from 'react'

const SolutionSection = () => {
  return (
    <section id="solution" className="solution-section">
      <div className="container">
        <h2>✅ Наше решение</h2>
        <div className="solution-content">
          <div className="solution-point">
            <h3>1. Просвещение и информирование</h3>
            <p>Распространение знаний о правильном названии блюда через образовательные кампании и социальные сети.</p>
          </div>
          
          <div className="solution-point">
            <h3>2. Обращение к кулинарным авторитетам</h3>
            <p>Сотрудничество с известными поварами, кулинарными блогерами и писателями для использования правильного названия.</p>
          </div>
          
          <div className="solution-point">
            <h3>3. Влияние на СМИ и издательства</h3>
            <p>Работа с редакциями кулинарных журналов, книг и телепередач для корректировки терминологии.</p>
          </div>
          
          <div className="solution-point">
            <h3>4. Образовательные инициативы</h3>
            <p>Включение правильной терминологии в школьные и кулинарные учебные программы.</p>
          </div>
          
          <div className="solution-point">
            <h3>5. Голосование общественного мнения</h3>
            <p>Использование демократического подхода для определения предпочтений общества.</p>
          </div>
        </div>
        
        <div className="solution-call-to-action">
          <h3>Присоединяйтесь к нашей инициативе!</h3>
          <p>Ваш голос может изменить кулинарную историю России. Поддержите правильное название любимого блюда.</p>
          <a href="#vote" className="vote-button">🗳️ Проголосовать</a>
        </div>
      </div>
    </section>
  )
}

export default SolutionSection
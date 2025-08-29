import React, { useState, useEffect } from 'react'
import { calculateVotingStatistics, initializeStatistics } from '../utils/voteDataAnalyzer'

const StatisticsSection = ({ voteCount }) => {
  const [realStats, setRealStats] = useState({
    totalVotes: 0,
    tvorozhnikisVotes: 0,
    syrnikisVotes: 0,
    topCities: [],
    recentVotes: []
  })
  const [loading, setLoading] = useState(true)
  
  // Initialize and load statistics
  useEffect(() => {
    const loadStatistics = async () => {
      setLoading(true)
      
      // Initialize baseline data if needed
      initializeStatistics()
      
      // Calculate real statistics
      const stats = await calculateVotingStatistics()
      setRealStats(stats)
      setLoading(false)
    }
    
    loadStatistics()
    
    // Set up interval to refresh statistics every 30 seconds
    const interval = setInterval(loadStatistics, 30000)
    
    return () => clearInterval(interval)
  }, [voteCount]) // Refresh when voteCount changes
  
  // Use real data or fallback to passed voteCount
  const displayTotalVotes = realStats.totalVotes > 0 ? realStats.totalVotes : voteCount
  const displayTvorozhnikis = realStats.tvorozhnikisVotes
  const displaySyrniki = realStats.syrnikisVotes
  
  const totalGoal = 10000
  const progressPercentage = Math.min((displayTotalVotes / totalGoal) * 100, 100)

  return (
    <section id="statistics" className="statistics-section">
      <div className="container">
        <h2>📊 Статистика голосования</h2>
        
        {loading && (
          <div className="loading-indicator">
            <p>⏳ Загрузка актуальной статистики...</p>
          </div>
        )}
        
        <div className="stats-grid">
          {/* Main Progress */}
          <div className="stat-card main-progress">
            <h3>Общий прогресс</h3>
            <div className="big-number">{displayTotalVotes.toLocaleString()}</div>
            <p>из {totalGoal.toLocaleString()} голосов</p>
            
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <p className="progress-text">{progressPercentage.toFixed(1)}% до цели</p>
            
            {realStats.totalVotes > 0 && (
              <div className="real-data-indicator">
                <small>📊 Данные обновлены в реальном времени</small>
              </div>
            )}
          </div>

          {/* Vote Distribution */}
          <div className="stat-card vote-distribution">
            <h3>Распределение голосов</h3>
            {displayTotalVotes > 0 ? (
              <div className="vote-results">
                <div className="vote-result tvorozhniki">
                  <div className="vote-bar">
                    <div 
                      className="vote-fill tvorozhniki-fill" 
                      style={{ width: `${(displayTvorozhnikis / displayTotalVotes) * 100}%` }}
                    ></div>
                  </div>
                  <div className="vote-info">
                    <span className="vote-option">ТВОРОЖНИКИ</span>
                    <span className="vote-count">
                      {displayTvorozhnikis.toLocaleString()} ({Math.round((displayTvorozhnikis / displayTotalVotes) * 100)}%)
                    </span>
                  </div>
                </div>
                
                <div className="vote-result syrniki">
                  <div className="vote-bar">
                    <div 
                      className="vote-fill syrniki-fill" 
                      style={{ width: `${(displaySyrniki / displayTotalVotes) * 100}%` }}
                    ></div>
                  </div>
                  <div className="vote-info">
                    <span className="vote-option">СЫРНИКИ</span>
                    <span className="vote-count">
                      {displaySyrniki.toLocaleString()} ({Math.round((displaySyrniki / displayTotalVotes) * 100)}%)
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="no-votes">
                <p>Пока нет голосов. Будьте первыми!</p>
              </div>
            )}
          </div>

          {/* Top Cities */}
          <div className="stat-card top-cities">
            <h3>Активные города</h3>
            {realStats.topCities && realStats.topCities.length > 0 ? (
              <div className="cities-list">
                {realStats.topCities.map((city, index) => (
                  <div key={city.name} className="city-item">
                    <span className="city-position">#{index + 1}</span>
                    <span className="city-name">{city.name}</span>
                    <span className="city-votes">
                      {city.votes} {city.votes === 1 ? 'голос' : city.votes < 5 ? 'голоса' : 'голосов'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-cities">
                <p>Данные по городам пока отсутствуют</p>
              </div>
            )}
          </div>

          {/* Real-time Activity */}
          <div className="stat-card recent-activity">
            <h3>Последние голоса</h3>
            {realStats.recentVotes && realStats.recentVotes.length > 0 ? (
              <div className="activity-feed">
                {realStats.recentVotes.slice(0, 4).map((activity, index) => (
                  <div key={`${activity.timestamp}-${index}`} className="activity-item">
                    <span className="voter">{activity.name}, {activity.city}</span>
                    <span className={`vote ${activity.choice}`}>
                      → {activity.choice === 'tvorozhniki' ? 'ТВОРОЖНИКИ' : 'СЫРНИКИ'}
                    </span>
                    <span className="time">{activity.timeAgo}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-activity">
                <p>Активность пока не зарегистрирована</p>
              </div>
            )}
          </div>
        </div>

        <div className="milestone-info">
          <h3>🎯 Следующие цели</h3>
          <div className="milestones">
            <div className={`milestone ${displayTotalVotes >= 10 ? 'achieved' : ''}`}>
              <span className="milestone-number">10</span>
              <span className="milestone-desc">Первые 10 голосов!</span>
            </div>
            <div className={`milestone ${displayTotalVotes >= 50 ? 'achieved' : ''}`}>
              <span className="milestone-number">50</span>
              <span className="milestone-desc">Активная поддержка</span>
            </div>
            <div className={`milestone ${displayTotalVotes >= 100 ? 'achieved' : ''}`}>
              <span className="milestone-number">100</span>
              <span className="milestone-desc">Сотый голос!</span>
            </div>
            <div className={`milestone ${displayTotalVotes >= 500 ? 'achieved' : ''}`}>
              <span className="milestone-number">500</span>
              <span className="milestone-desc">Народная поддержка</span>
            </div>
            <div className={`milestone ${displayTotalVotes >= 1000 ? 'achieved' : ''}`}>
              <span className="milestone-number">1,000</span>
              <span className="milestone-desc">Тысячный голос!</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default StatisticsSection
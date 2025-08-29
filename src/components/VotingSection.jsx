import React, { useState, useEffect } from 'react'
import { 
  hasUserVoted, 
  recordVote, 
  checkIndexedDBVotes,
  isValidEmail,
  generateVerificationCode,
  storePendingVote,
  verifyPendingVote,
  clearAllVoteData
} from '../utils/voteTracker'
import { clearAllVotingData } from '../utils/voteDataAnalyzer'

const VotingSection = ({ onVote, hasVoted }) => {
  const [selectedOption, setSelectedOption] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showVerification, setShowVerification] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [voteStatus, setVoteStatus] = useState({ hasVoted: false, voteData: null })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [voterInfo, setVoterInfo] = useState({
    name: '',
    city: '',
    email: ''
  })

  // Check for existing votes on component mount
  useEffect(() => {
    const checkExistingVote = async () => {
      const voteCheck = hasUserVoted()
      const indexedDBCheck = await checkIndexedDBVotes()
      
      if (voteCheck.hasVoted || indexedDBCheck) {
        setVoteStatus({ 
          hasVoted: true, 
          voteData: voteCheck.voteData,
          detectionMethods: voteCheck.detectionMethods
        })
      }
    }
    
    checkExistingVote()
  }, [])

  const handleVoteClick = () => {
    if (selectedOption && !voteStatus.hasVoted) {
      setShowForm(true)
      setError('')
    }
  }

  const handleSubmitVote = async (e) => {
    e.preventDefault()
    if (!voterInfo.name || !voterInfo.city) {
      setError('Пожалуйста, заполните обязательные поля')
      return
    }

    setLoading(true)
    setError('')

    const voteData = {
      choice: selectedOption,
      name: voterInfo.name,
      city: voterInfo.city,
      email: voterInfo.email
    }

    // If email is provided, use email verification
    if (voterInfo.email && isValidEmail(voterInfo.email)) {
      const code = generateVerificationCode()
      storePendingVote(voteData, code)
      
      // Simulate sending email (in real app, this would call your backend)
      console.log(`Verification code for ${voterInfo.email}: ${code}`)
      
      // In development, also store the code for display
      if (process.env.NODE_ENV === 'development') {
        setVerificationCode('')  // Clear any existing code
        // Store the generated code temporarily for development display
        window.devVerificationCode = code
      }
      
      setShowForm(false)
      setShowVerification(true)
      setLoading(false)
    } else {
      // Direct vote without email verification
      try {
        const finalVote = recordVote(voteData)
        setVoteStatus({ hasVoted: true, voteData: finalVote })
        onVote()
        setShowForm(false)
      } catch (error) {
        setError('Произошла ошибка при записи голоса. Попробуйте снова.')
      }
      setLoading(false)
    }
  }

  const handleVerificationSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = verifyPendingVote(verificationCode)
    
    if (result.success) {
      setVoteStatus({ hasVoted: true, voteData: result.vote })
      onVote()
      setShowVerification(false)
    } else {
      setError(result.error)
    }
    
    setLoading(false)
  }

  const handleInputChange = (e) => {
    setVoterInfo({
      ...voterInfo,
      [e.target.name]: e.target.value
    })
  }

  const handleShare = (platform) => {
    const shareData = {
      title: 'ТВОРОЖНИКИ, НЕ СЫРНИКИ! Поддержите правильное название любимого блюда',
      text: 'Присоединяйтесь к инициативе по восстановлению исторической справедливости в названии любимого блюда из творога!',
      url: 'https://творожники.рф/'
    };

    // Try Web Share API first (modern browsers)
    if (navigator.share) {
      navigator.share(shareData)
        .then(() => {
          console.log('Успешно поделились через Web Share API');
        })
        .catch((error) => {
          console.log('Web Share API не поддерживается или отменено пользователем', error);
          // Fallback to traditional sharing methods
          fallbackShare(platform, shareData);
        });
    } else {
      // Fallback for older browsers
      fallbackShare(platform, shareData);
    }
  };

  const fallbackShare = (platform, shareData) => {
    let shareUrl;
    
    try {
      switch (platform) {
        case 'vk':
          shareUrl = `https://vk.com/share.php?url=${encodeURIComponent(shareData.url)}&title=${encodeURIComponent(shareData.title)}&description=${encodeURIComponent(shareData.text)}`;
          break;
        case 'telegram':
          shareUrl = `https://t.me/share/url?url=${encodeURIComponent(shareData.url)}&text=${encodeURIComponent(shareData.text)}`;
          break;
        case 'whatsapp':
          shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareData.text + ' ' + shareData.url)}`;
          break;
        default:
          // Copy to clipboard as fallback
          copyToClipboard(`${shareData.text} ${shareData.url}`);
          alert('Ссылка скопирована в буфер обмена!');
          return;
      }

      // Open in new window/tab with error handling
      const popup = window.open(shareUrl, '_blank', 'width=600,height=400');
      
      // Check if popup was blocked
      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        // Popup blocked, copy to clipboard as final fallback
        copyToClipboard(`${shareData.text} ${shareData.url}`);
        alert('Ссылка скопирована в буфер обмена! Вы можете вставить её в соцсеть.');
      }
    } catch (error) {
      console.error('Ошибка при попытке поделиться:', error);
      // Final fallback - copy to clipboard
      copyToClipboard(`${shareData.text} ${shareData.url}`);
      alert('Ссылка скопирована в буфер обмена! Вы можете вставить её в соцсеть.');
    }
  };

  const copyToClipboard = (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text)
        .then(() => {
          console.log('Текст скопирован в буфер обмена');
        })
        .catch((error) => {
          console.error('Ошибка копирования в буфер обмена:', error);
          // Fallback for older browsers
          fallbackCopyTextToClipboard(text);
        });
    } else {
      fallbackCopyTextToClipboard(text);
    }
  };

  const fallbackCopyTextToClipboard = (text) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        console.log('Текст скопирован в буфер обмена');
      } else {
        console.error('Ошибка копирования в буфер обмена');
      }
    } catch (error) {
      console.error('Ошибка копирования в буфер обмена:', error);
    }
    
    document.body.removeChild(textArea);
  };

  return (
    <section id="vote" className="voting-section">
      <div className="container">
        <h2>🗳️ Ваш голос важен!</h2>
        
        {voteStatus.hasVoted ? (
          // User has already voted
          <div className="vote-success">
            <div className="success-message">
              <h3>🎉 Спасибо за ваш голос!</h3>
              {voteStatus.voteData && (
                <div className="vote-details">
                  <p>Ваш выбор: <strong>{voteStatus.voteData.choice === 'tvorozhniki' ? 'ТВОРОЖНИКИ' : 'СЫРНИКИ'}</strong></p>
                  <p>Время голосования: {new Date(voteStatus.voteData.timestamp).toLocaleString('ru-RU')}</p>
                </div>
              )}
              <p>Ваш голос учтён. Вместе мы изменим историю русской кухни!</p>
              
              {voteStatus.detectionMethods && (
                <div className="detection-info">
                  <details>
                    <summary>Защита от повторного голосования</summary>
                    <p>Ваш голос был обнаружен с помощью:</p>
                    <ul>
                      {voteStatus.detectionMethods.localStorage && <li>✓ Локальное хранилище браузера</li>}
                      {voteStatus.detectionMethods.sessionStorage && <li>✓ Сессионное хранилище</li>}
                      {voteStatus.detectionMethods.fingerprint && <li>✓ Отпечаток браузера</li>}
                    </ul>
                  </details>
                </div>
              )}
              
              <div className="success-action">
                <p>Расскажите друзьям:</p>
                <div className="share-buttons">
                  <button 
                    className="share-button vk" 
                    onClick={() => handleShare('vk')}
                  >
                    ВКонтакте
                  </button>
                  <button 
                    className="share-button telegram" 
                    onClick={() => handleShare('telegram')}
                  >
                    Telegram
                  </button>
                  <button 
                    className="share-button whatsapp" 
                    onClick={() => handleShare('whatsapp')}
                  >
                    WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : showVerification ? (
          // Email verification step
          <div className="verification-section">
            <div className="verification-form">
              <h3>📧 Подтвердите ваш email</h3>
              <p>Мы отправили код подтверждения на <strong>{voterInfo.email}</strong></p>
              <p className="verification-note">
                Введите код из письма, чтобы подтвердить ваш голос:
              </p>
              
              {/* Development: Show verification code directly */}
              {process.env.NODE_ENV === 'development' && window.devVerificationCode && (
                <div className="dev-verification-display">
                  <h4>🧪 Режим разработки</h4>
                  <p>Ваш код подтверждения: <strong className="verification-code-display">{window.devVerificationCode}</strong></p>
                  <p><small>Скопируйте и вставьте код выше ↑</small></p>
                </div>
              )}
              
              <form onSubmit={handleVerificationSubmit}>
                <div className="verification-input-group">
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                    placeholder="Введите код (например: ABC12DEF)"
                    maxLength={8}
                    required
                    className="verification-input"
                  />
                  {/* Development: Auto-fill button */}
                  {process.env.NODE_ENV === 'development' && window.devVerificationCode && (
                    <button 
                      type="button"
                      onClick={() => setVerificationCode(window.devVerificationCode)}
                      className="auto-fill-button"
                    >
                      🪄 Автозаполнение
                    </button>
                  )}
                </div>
                
                {error && <div className="error-message">{error}</div>}
                
                <div className="verification-buttons">
                  <button 
                    type="button" 
                    onClick={() => setShowVerification(false)}
                    className="back-button"
                  >
                    ← Назад
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading || !verificationCode}
                    className="verify-button"
                  >
                    {loading ? 'Проверка...' : '✓ Подтвердить голос'}
                  </button>
                </div>
              </form>
              
              <div className="verification-help">
                <p>Не получили код? Проверьте папку "Спам" или попробуйте ещё раз.</p>
              </div>
            </div>
          </div>
        ) : (
          // Normal voting flow
          <div className="voting-content">
            <p className="voting-description">
              Поддержите инициативу по переименованию сырников в творожники! 
              Ваш голос поможет восстановить историческую справедливость.
            </p>

            {!showForm ? (
              <div className="vote-options">
                <h3>Как должно называться блюдо из творога?</h3>
                
                <div className="option-cards">
                  <label className={`option-card ${selectedOption === 'tvorozhniki' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="vote"
                      value="tvorozhniki"
                      checked={selectedOption === 'tvorozhniki'}
                      onChange={(e) => setSelectedOption(e.target.value)}
                    />
                    <div className="option-content">
                      <h4>🧀 ТВОРОЖНИКИ</h4>
                      <p>Логично, правильно, понятно!</p>
                      <p className="option-description">
                        Название соответствует основному ингредиенту — творогу
                      </p>
                    </div>
                  </label>

                  <label className={`option-card ${selectedOption === 'syrniki' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="vote"
                      value="syrniki"
                      checked={selectedOption === 'syrniki'}
                      onChange={(e) => setSelectedOption(e.target.value)}
                    />
                    <div className="option-content">
                      <h4>🤷‍♂️ СЫРНИКИ</h4>
                      <p>Как есть, так и оставим</p>
                      <p className="option-description">
                        Сохранить традиционное, хоть и неточное название
                      </p>
                    </div>
                  </label>
                </div>

                <button 
                  className="vote-button"
                  onClick={handleVoteClick}
                  disabled={!selectedOption}
                >
                  {selectedOption ? 'Продолжить голосование →' : 'Выберите вариант'}
                </button>
              </div>
            ) : (
              <form className="voter-form" onSubmit={handleSubmitVote}>
                <h3>Почти готово! Последний шаг:</h3>
                <p>Чтобы ваш голос был засчитан, укажите немного информации о себе:</p>
                
                {error && <div className="error-message">{error}</div>}
                
                <div className="form-group">
                  <label htmlFor="name">Имя *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={voterInfo.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Ваше имя"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="city">Город *</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={voterInfo.city}
                    onChange={handleInputChange}
                    required
                    placeholder="Ваш город"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={voterInfo.email}
                    onChange={handleInputChange}
                    placeholder="Для подтверждения голоса (рекомендуется)"
                  />
                  <div className="email-info">
                    <small>
                      📧 С email: подтверждение через код (надёжнее)<br/>
                      🚀 Без email: быстрое голосование (менее защищено)
                    </small>
                  </div>
                </div>

                <div className="vote-summary">
                  <p><strong>Ваш выбор:</strong> {selectedOption === 'tvorozhniki' ? 'ТВОРОЖНИКИ' : 'СЫРНИКИ'}</p>
                </div>

                <div className="form-buttons">
                  <button type="button" onClick={() => setShowForm(false)} className="back-button">
                    ← Назад
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="submit-vote-button"
                  >
                    {loading ? 'Обработка...' : (voterInfo.email ? '📧 Отправить код' : '🗳️ Отдать голос!')}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

export default VotingSection
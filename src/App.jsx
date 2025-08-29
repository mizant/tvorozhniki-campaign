import { useState, useEffect } from 'react'
import './App.css'
import Header from './components/Header'
import ProblemSection from './components/ProblemSection'
import SolutionSection from './components/SolutionSection'
import VotingSection from './components/VotingSection'
import StatisticsSection from './components/StatisticsSection'
import Footer from './components/Footer'
import { hasUserVoted } from './utils/voteTracker'

function App() {
  const [voteCount, setVoteCount] = useState(1247) // Starting with some initial votes
  const [userHasVoted, setUserHasVoted] = useState(false)

  // Check if user has voted on component mount
  useEffect(() => {
    const checkUserVote = async () => {
      const voteStatus = hasUserVoted()
      setUserHasVoted(voteStatus.hasVoted)
    }
    checkUserVote()
  }, [])

  const handleVote = () => {
    if (!userHasVoted) {
      setVoteCount(prev => prev + 1)
      setUserHasVoted(true)
    }
  }

  return (
    <div className="app">
      <Header />
      <main>
        <ProblemSection />
        <SolutionSection />
        <VotingSection 
          onVote={handleVote} 
          hasVoted={userHasVoted}
        />
        <StatisticsSection voteCount={voteCount} />
      </main>
      <Footer />
    </div>
  )
}

export default App

import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
  const [user, setUser] = useState(null)
  const [selectedPlan, setSelectedPlan] = useState('free')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [rateLimitStatus, setRateLimitStatus] = useState(null)
  const [loadingRateLimit, setLoadingRateLimit] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    if (userData && token) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      setSelectedPlan(parsedUser.plans?.tier || 'free') 
      fetchRateLimitStatus()
    }
  }, [])

  const fetchRateLimitStatus = async () => {
    setLoadingRateLimit(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:3000/api/users/rate-limit-status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.data.success) {
        setRateLimitStatus(response.data.data)
        console.log("response.data.data", response.data.data);
      }
    } catch (error) {
      console.error('Error fetching rate limit status:', error)
    } finally {
      setLoadingRateLimit(false)
    }
  }

  const handlePlanChange = (e) => {
    setSelectedPlan(e.target.value)
  }

  const handleUpgrade = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      const token = localStorage.getItem('token')
      const response = await axios.put('http://localhost:3000/api/users/plan', {
        tier: selectedPlan
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.data.success) {
        setMessage('Plan updated successfully!')
        setUser(response.data.data.user)
        localStorage.setItem('user', JSON.stringify(response.data.data.user))
        // Refresh rate limit status after plan change
        fetchRateLimitStatus()
      } else {
        setMessage('Failed to update plan')
      }
    } catch (error) {
      setMessage(error.response.data.message)
    } finally {
      setLoading(false)
    }
  }

  const handleNewsPage = () => {
    navigate('/news')
  }

  const handleCryptoPage = () => {
    console.log('Navigate to Crypto Page')
  }

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token')
      await axios.post('http://localhost:3000/api/users/logout', {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      navigate('/')
      // Clear localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      
    } catch (error) {
      console.error('Logout error:', error)
      // Still clear localStorage even if API call fails
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
      
      <div className="plan-section">
        <h3>Current Plan: {user.plans?.tier || 'free'}</h3>
        
        <div className="plan-options">
          <label className="radio-option">
            <input
              type="radio"
              name="plan"
              value="free"
              checked={selectedPlan === 'free'}
              onChange={handlePlanChange}
            />
            Free
          </label>
          <label className="radio-option">
            <input
              type="radio"
              name="plan"
              value="pro"
              checked={selectedPlan === 'pro'}
              onChange={handlePlanChange}
            />
            Pro
          </label>
          <button 
            onClick={handleUpgrade} 
            disabled={loading}
            className="upgrade-btn"
          >
            {loading ? 'Updating...' : 'Upgrade'}
          </button>
        </div>
        
        {message && <div className="message">{message}</div>}
      </div>

      <div className="rate-limit-section">
        <h3>API Rate Limits</h3>
        {loadingRateLimit ? (
          <div>Loading rate limit status...</div>
        ) : rateLimitStatus ? (
          <div className="rate-limit-info">
            <div className="plan-info">
              <strong>Current Plan: {rateLimitStatus.userPlan}</strong>
            </div>
            <div className="endpoints-list">
              {Object.entries(rateLimitStatus.endpoints).map(([endpoint, status]) => (
                <div key={endpoint} className="endpoint-item">
                  <div className="endpoint-name">{endpoint}</div>
                  <div className="endpoint-stats">
                    <span className="remaining">{status.remaining}</span> / <span className="limit">{status.limit}</span>
                    <div className="usage-bar">
                      <div 
                        className="usage-fill" 
                        style={{ 
                          width: `${(status.count / status.limit) * 100}%`,
                          backgroundColor: status.remaining > status.limit * 0.5 ? '#4CAF50' : status.remaining > 0 ? '#FF9800' : '#F44336'
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
          </div>
        ) : (
          <div>Failed to load rate limit status</div>
        )}
      </div>

      <div className="pages-section">
        <h3>Pages</h3>
        <div className="page-buttons">
          <button onClick={handleNewsPage} className="page-btn">
            News Page
          </button>
          <button onClick={handleCryptoPage} className="page-btn">
            Crypto Page
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

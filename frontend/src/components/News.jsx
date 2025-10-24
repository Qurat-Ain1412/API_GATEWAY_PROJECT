import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const News = () => {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchNews()
  }, [])

  const fetchNews = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:3000/api/v1/news', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.data.success) {
        setArticles(response.data.data.articles)
      } else {
        setError('Failed to fetch news')
      }
    } catch (err) {
      setError('Error fetching news')
    } finally {
      setLoading(false)
    }
  }

  const handleBackToDashboard = () => {
    navigate('/dashboard')
  }

  if (loading) {
    return (
      <div className="news-container">
        <div className="news-header">
          <button onClick={handleBackToDashboard} className="back-btn">
            ← Back to Dashboard
          </button>
          <h1>News</h1>
        </div>
        <div className="loading">Loading news...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="news-container">
        <div className="news-header">
          <button onClick={handleBackToDashboard} className="back-btn">
            ← Back to Dashboard
          </button>
          <h1>News</h1>
        </div>
        <div className="error">{error}</div>
      </div>
    )
  }

  return (
    <div className="news-container">
      <div className="news-header">
        <button onClick={handleBackToDashboard} className="back-btn">
          ← Back to Dashboard
        </button>
        <h1>Latest News</h1>
      </div>
      
      <div className="news-grid">
        {articles.map((article, index) => (
          <div key={index} className="news-card">
            {article.urlToImage && (
              <img src={article.urlToImage} alt={article.title} className="news-image" />
            )}
            <div className="news-content">
              <h3 className="news-title">{article.title}</h3>
              <p className="news-description">{article.description}</p>
              <div className="news-meta">
                <span className="news-source">{article.source?.name}</span>
                <span className="news-date">
                  {new Date(article.publishedAt).toLocaleDateString()}
                </span>
              </div>
              {article.url && (
                <a 
                  href={article.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="news-link"
                >
                  Read More
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default News

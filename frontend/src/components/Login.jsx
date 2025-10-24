import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import Header from './Header'

const Login = () => {
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await axios.post('http://localhost:3000/api/users/login', formData)
      const data = response.data
      const token = data.token;
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(data.user))
      console.log('User logged in:', data.user);
      if(token){
        navigate('/dashboard');
      }

      if (data.success) {
        setSuccess('Login successful!')
        navigate('/dashboard');
        localStorage.setItem('token', data.data.token)
        localStorage.setItem('user', JSON.stringify(data.data.user))
        console.log('User logged in:', data.data.user)
      } else {
        setError(data.message || 'Login failed')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Header />
      <div className="form-container">
        <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="identifier">Email or Username</label>
          <input
            type="text"
            id="identifier"
            name="identifier"
            value={formData.identifier}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      </div>
    </div>
  )
}

export default Login

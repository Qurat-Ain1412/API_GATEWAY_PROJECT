import { useState } from 'react'
import axios from 'axios'
import Header from './Header'

const Signup = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: '',
    plan: 'free'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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
      const response = await axios.post('http://localhost:3000/api/users/signup', formData)
      const data = response.data;

      if (data.success) {
        setSuccess('Signup successful! You are now logged in.')
        localStorage.setItem('token', data.data.token)
        localStorage.setItem('user', JSON.stringify(data.data.user))
        console.log('User created:', data.data.user)
      } else {
        if (data.errors && data.errors.length > 0) {
          setError(data.errors.map(err => err.message).join(', '))
        } else {
          setError(data.message || 'Signup failed')
        }
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
        <h2>Signup</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="first_name">First Name</label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="last_name">Last Name</label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
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

        <div className="form-group">
          <label>Plan</label>
          <div className="radio-group">
            <label className="radio-option">
              <input
                type="radio"
                name="plan"
                value="free"
                checked={formData.plan === 'free'}
                onChange={handleChange}
              />
              Free
            </label>
            <label className="radio-option">
              <input
                type="radio"
                name="plan"
                value="pro"
                checked={formData.plan === 'pro'}
                onChange={handleChange}
              />
              Pro
            </label>
          </div>
        </div> 

        {/* <div className="form-group">
          <label htmlFor="role">Role</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="user">User</option>
          </select>
        </div> */}

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? 'Creating Account...' : 'Signup'}
        </button>
      </form>
      </div>
    </div>
  )
}

export default Signup

import { useNavigate } from 'react-router-dom'

const Header = () => {
  const navigate = useNavigate()

  return (
    <div className="header">
      <h1>API Gateway</h1>
      <div className="nav-buttons">
        <button onClick={() => navigate('/')}>Login</button>
        <button onClick={() => navigate('/signup')}>Signup</button>
      </div>
    </div>
  )
}

export default Header

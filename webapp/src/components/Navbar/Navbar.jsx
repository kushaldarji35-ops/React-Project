import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import logo from '../../assets/apex.png';

export function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleHomeClick = (e) => {
    e.preventDefault();
    navigate('/home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src={logo} alt="Apex Jewellers Logo" className="navbar-apex-img" />
        APEX JEWELLERS
      </div>
      <div className="navbar-links">
        <Link to="/home" onClick={handleHomeClick}>Home</Link>
        {token ? (
          <>
            <Link to="/AdminDashboard">Dashboard</Link>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

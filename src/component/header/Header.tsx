import React from 'react';
import './Header.css'
import { logOutUser } from '../../service/service';
import { useNavigate } from 'react-router-dom';
interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
    const navigate = useNavigate();

    const handleLogout = async () => {
    await logOutUser();
    navigate('/'); // Navigation happens here
  };
  return (
    <header className="dashboard-header">
      <div className="header-left">
        <button className="menu-toggle" onClick={toggleSidebar}>
          ☰
        </button>
        <h1 className="logo">Dashboard</h1>
      </div>
      <div className="header-right">
        <div className="user-profile">
          <button onClick={handleLogout}>Log Out</button>
          {/* <span className="user-name">John Doe</span>
          <div className="user-avatar">JD</div> */}
        </div>
      </div>
    </header>
  );
};

export default Header;
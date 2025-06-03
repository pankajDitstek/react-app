import React, { useContext } from 'react';
import './Sidebar.css'
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext'
interface SidebarProps {
    isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
    const isAdmin = useContext(AuthContext)
    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
            <nav>
                <ul className="sidebar-menu">
                    <li className="menu-item">
                        <Link
                            to="/dashboard/home"
                        >
                            <span className="icon">🏠</span>
                            <span className="title">Home</span>
                        </Link>
                    </li>
                    {isAdmin?.isAdmin && (
                        <li className="menu-item">
                            <Link to="/dashboard/users" >
                                <span className="icon">👥</span>
                                <span className="title">Users</span>
                            </Link>
                        </li>
                    )}
                    {/* <li className="menu-item">
                        <Link to="/dashboard/userprofile" >
                            <span className="icon">👤</span>
                            <span className="title">Profile</span>
                        </Link>
                    </li> */}
                    <li className="menu-item">
                        <Link to="/dashboard/categories" >
                            <span className="icon">🗂️</span>
                            <span className="title">Categories</span>
                        </Link>
                    </li>
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;
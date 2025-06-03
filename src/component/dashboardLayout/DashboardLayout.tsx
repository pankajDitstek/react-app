import React, { useState } from 'react';
import './DashboradLayout.css'
import Header from '../header/Header';
import Sidebar from '../sidebar/Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="dashboard-container">
      <Header toggleSidebar={toggleSidebar} />
      <div className="dashboard-content">
        <Sidebar isOpen={sidebarOpen} />
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
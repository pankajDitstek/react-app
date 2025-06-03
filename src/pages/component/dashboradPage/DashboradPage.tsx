import React from 'react';
import DashboardLayout from '../../../component/dashboardLayout/DashboardLayout';
import { Outlet } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  return (
    <DashboardLayout>
      <Outlet/>
    </DashboardLayout>
  );
};

export default DashboardPage;
import React, { useEffect } from 'react';
import Login from '../pages/component/auth/login/Login';
import DashboardPage from '../pages/component/dashboradPage/DashboradPage';
import Home from '../pages/component/home/Home';
import UserProfile from '../pages/component/userProfile/UserProfile';
import UserList from '../pages/component/userlist/UserList';
import Categories from '../pages/component/categories/Categories';
import SignUp from '../pages/component/auth/signup/SignUp';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ProtectedRoute } from '../protectedRoute/ProtectedRoute';


const AppRoutes: React.FC = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard/home');
    }
  }, []);
  const role = localStorage.getItem('role');


  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path='/signup' element={<SignUp />} />
        <Route path="/dashboard" element={<DashboardPage />}>
          <Route path="home" element={<Home />} />
          {role == 'admin' && (
            <Route
              path="users"
              element={
                <ProtectedRoute>
                  <UserList />
                </ProtectedRoute>
              }
            />
          )}
          <Route
            path="userprofile"
            element={
              <UserProfile />
            }
          />
          <Route
            path="categories"
            element={
              <Categories />
            }
          />
        </Route>
      </Routes>
    </AuthProvider>
  );
};
export default AppRoutes;
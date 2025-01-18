import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import Navbar from './components/Navbar';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { setCredentials } from './store/slices/authSlice';
import { userApi } from './services/api';
import { ProtectedRoute } from './components/ProtectedRoute';

const Home = React.lazy(() => import('./pages/Home'));
const About = React.lazy(() => import('./pages/About'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Translate = React.lazy(() => import('./pages/Translate'));

function AppContent() {
 const dispatch = useDispatch();

 useEffect(() => {
   const initializeAuth = async () => {
     const token = localStorage.getItem('token');
     if (token) {
       try {
         const userData = await userApi.getProfile();
         dispatch(setCredentials({ user: userData, token }));
       } catch (error) {
        console.log(error)
       }
     }
   };

   initializeAuth();
 }, [dispatch]);

 return (
   <div className="min-h-screen bg-gray-50">
     <Navbar />
     <React.Suspense
       fallback={
         <div className="flex items-center justify-center min-h-screen">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
         </div>
       }
     >
       <Routes>
         <Route path="/" element={<Home />} />
         <Route path="/about" element={<About />} />
         <Route path="/login" element={<Login />} />
         <Route path="/register" element={<Register />} />
         <Route 
           path="/profile" 
           element={
             <ProtectedRoute>
               <Profile />
             </ProtectedRoute>
           } 
         />
         <Route 
           path="/translate" 
           element={
             <ProtectedRoute>
               <Translate />
             </ProtectedRoute>
           } 
         />
       </Routes>
     </React.Suspense>
   </div>
 );
}

function App() {
 return (
   <Provider store={store}>
     <Router>
       <AppContent />
     </Router>
   </Provider>
 );
}

export default App;
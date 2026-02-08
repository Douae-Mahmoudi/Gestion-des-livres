import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';

import './index.css'; 

import App from './App';
import SignInPage from './auth/sign-in/page'; 
import SignUpPage from './auth/sign-up/page'; 

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="200519948034-b4dumtqqa3o5jqsnqnapbffarpivduvt.apps.googleusercontent.com">
      <BrowserRouter>
        <Routes>
          <Route path="/*" element={<App />} /> 
          
          <Route path="/auth/sign-up" element={<SignUpPage />} />
          <Route path="/auth/sign-in" element={<SignInPage />} />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
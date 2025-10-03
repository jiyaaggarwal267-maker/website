// src/index.js (Example - you will add the HashRouter)

import React from 'react';
import ReactDOM from 'react-dom/client';
// 1. ADD: Import HashRouter (assuming you were importing BrowserRouter before)
import { HashRouter } from 'react-router-dom'; 

import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* 2. REPLACE: The original Router (e.g., BrowserRouter) with HashRouter */}
    <HashRouter> 
      <App />
    </HashRouter>
  </React.StrictMode>
);

reportWebVitals();
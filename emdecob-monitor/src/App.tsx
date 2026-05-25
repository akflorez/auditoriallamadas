import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AudiosList from './pages/AudiosList';
import AudioDetail from './pages/AudioDetail';
import KpisConfig from './pages/KpisConfig';
import Settings from './pages/Settings';
import Agents from './pages/Agents';
import Login from './pages/Login';
import JudicialClassification from './pages/JudicialClassification';
import QualityMatrix from './pages/QualityMatrix';

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuth = localStorage.getItem('emdecob_auth') === 'true';
  const location = useLocation();
  if (!isAuth) return <Navigate to="/login" state={{ from: location }} replace />;
  return <Layout>{children}</Layout>;
};

function App() {
  console.log('EMDECOB: App Rendering...');
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/audios" element={<RequireAuth><AudiosList /></RequireAuth>} />
        <Route path="/audios/:id" element={<RequireAuth><AudioDetail /></RequireAuth>} />
        <Route path="/quality-matrix" element={<RequireAuth><QualityMatrix /></RequireAuth>} />
        <Route path="/kpis" element={<RequireAuth><KpisConfig /></RequireAuth>} />
        <Route path="/judicial-classification" element={<RequireAuth><JudicialClassification /></RequireAuth>} />
        <Route path="/executives" element={<RequireAuth><Agents /></RequireAuth>} />
        <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

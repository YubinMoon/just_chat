import styles from './App.module.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './page/Home'
import Login from './page/Login'
import Signup from './page/Signup'
import Invite from './page/Invite';
import Line from './component/Line';
import { useEffect } from 'react';

function App() {
  return (
    <BrowserRouter>
      <div className="h-full font-ko">
        <Routes>
          <Route path="/*">
            <Route path="" element={<Home />} />
            <Route path=":server" element={<Home />} />
            <Route path=":server/:channel" element={<Home />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/invite/:token" element={<Invite />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

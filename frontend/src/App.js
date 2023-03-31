import styles from './App.module.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './page/Home'
import Login from './page/Login'
import Signup from './page/Signup'
import Line from './component/Line';

function App() {
  return (
    <BrowserRouter>
      <div className={styles.App}>
        <Routes>
          <Route path="/*">
            <Route path="" element={<Home />} />
            <Route path=":server" element={<Home />} />
            <Route path=":server/:channel" element={<Home />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

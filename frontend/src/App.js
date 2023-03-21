import styles from './App.module.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './page/Home'
import Login from './page/Login'
import Signup from './page/Signup'

function App() {
  return (
    <BrowserRouter>
      <div className={styles.App}>
        <Routes>
          <Route path="/" exact element={<Home />} />
          <Route path="/login" exact element={<Login />} />
          <Route path="/signup" exact element={<Signup />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

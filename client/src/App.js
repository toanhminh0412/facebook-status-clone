import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom'

import AuthPage from './components/AuthPage';
import MainPage from './components/MainPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<AuthPage/>}></Route>
        <Route exact path="/" element={<MainPage></MainPage>}></Route>
      </Routes>
    </Router>
  );
}

export default App;

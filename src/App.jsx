import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import ThemeToggle from './components/ThemeToggle';
import Home from './pages/Home';
import Exam from './pages/Exam';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <ThemeToggle />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/exam" element={<Exam />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;




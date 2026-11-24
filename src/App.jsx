import { Routes, Route } from 'react-router-dom';
import StartPage from './pages/StartPage';
import TestPage from './pages/TestPage';
import ResultPage from './pages/ResultPage';
import TodayPickPage from './pages/TodayPickPage';
import PrintPage from './pages/PrintPage';
import AdminPage from './pages/AdminPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<StartPage />} />
      <Route path="/test" element={<TestPage />} />
      <Route path="/result" element={<ResultPage />} />
      <Route path="/today" element={<TodayPickPage />} />
      <Route path="/print/:id" element={<PrintPage />} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  );
}

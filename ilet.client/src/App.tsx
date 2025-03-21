import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';

export default function App() {
    return (
        <I18nextProvider i18n={i18n}>
            <Router>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                </Routes>
            </Router>
        </I18nextProvider>
    );
}

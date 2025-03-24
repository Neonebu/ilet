import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import './i18n'; // Bunu en üste ekle


createRoot(document.getElementById('root')!).render(
    <App />,
)

import { Navigate, Route, Routes } from 'react-router-dom';

import { AppShell } from './components/AppShell.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { HowItWorksPage } from './pages/HowItWorksPage.jsx';
import { PrivacyPage } from './pages/PrivacyPage.jsx';
import { ProductPage } from './pages/ProductPage.jsx';
import { ResultsPage } from './pages/ResultsPage.jsx';
import { SecurityPage } from './pages/SecurityPage.jsx';
import { TermsPage } from './pages/TermsPage.jsx';

/**
 * Route map stays tiny; feature screens live under /pages.
 */
export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/product" element={<ProductPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/security" element={<SecurityPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/results/:id" element={<ResultsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}

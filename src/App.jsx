  import { lazy, Suspense } from 'react';
  import './styles/tokens.css';
  import './App.css';

  /*
   * Every component stylesheet is imported here, eagerly and in the order the
   * app had before route-level code splitting. React.lazy() only splits the
   * JS: keeping the CSS in this single entry stylesheet guarantees the cascade
   * (and therefore the rendered output) is unchanged no matter which route
   * chunk loads first.
   */
  import './Components/NavBar.css';
  import './Components/HomePage.css';
  import './Components/NavMbl.css';
  import './Components/HeroSection.css';
  import './Components/WhatWeDo.css';
  import './Components/FAQSection.css';
  import './Components/Footer.css';
  import './Components/ServicesTab.css';
  import './Components/AboutSection.css';
  import './Components/FAQSectionV2.css';
  import './Components/FindOutSection.css';
  import './Components/GetStartedSection.css';

  import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

  /* Route components are loaded on demand, one chunk per route. */
  const HomePage = lazy(() => import('./Components/HomePage'));
  const ServicesTab = lazy(() => import('./Components/ServicesTab'));
  const NavBar = lazy(() => import('./Components/NavBar'));
  const NavMbl = lazy(() => import('./Components/NavMbl'));
  const Footer = lazy(() => import('./Components/Footer'));
  const AboutSection = lazy(() => import('./Components/AboutSection'));
  const FAQSectionV2 = lazy(() => import('./Components/FAQSectionV2'));
  const FindOutSection = lazy(() => import('./Components/FindOutSection'));
  const GetStartedSection = lazy(() => import('./Components/GetStartedSection'));
  const Login = lazy(() => import('./Components/Auth/Login'));
  const Register = lazy(() => import('./Components/Auth/Register'));
  const ProtectedRoute = lazy(() => import('./Components/Auth/ProtectedRoute'));

  function NotFound() {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', textAlign: 'center' }}>
        <h1 style={{ margin: 0 }}>404</h1>
        <p>Page not found.</p>
        <Link to="/">Back to home</Link>
      </div>
    );
  }

  function App() {

    return (
      <>
        <Router>
        <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<> <NavBar/> <NavMbl/> <ServicesTab/> <Footer/> </>} />
          <Route path="/about" element={<><AboutSection/></>} />
          <Route path="/find" element={<><NavBar/> <NavMbl/> <FindOutSection/> <Footer/> </>} />
          <Route path="/get-started" element={<ProtectedRoute><NavBar/> <NavMbl/> <GetStartedSection/> <Footer/> </ProtectedRoute>} />
          {/* <Route path="/faq" element={<> <FAQSectionV2/> </>} /> */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </Router>
      </>
    )
  }

  export default App

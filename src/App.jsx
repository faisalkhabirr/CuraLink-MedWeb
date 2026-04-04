  import { useState } from 'react';
  import './App.css';
  import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
  import HomePage from './Components/HomePage';
import ServicesTab from './Components/ServicesTab';
import NavBar from './Components/NavBar';
import NavMbl from './Components/NavMbl';
import Footer from './Components/Footer';
import AboutSection from './Components/AboutSection';
import FAQSectionV2 from './Components/FAQSectionV2';
import FindOutSection from './Components/FindOutSection';
import GetStartedSection from './Components/GetStartedSection';
import Login from './Components/Auth/Login';
import Register from './Components/Auth/Register';
import ProtectedRoute from './Components/Auth/ProtectedRoute';
  function App() {

    return (
      <>
        <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<> <NavBar/> <NavMbl/> <ServicesTab/> <Footer/> </>} />
          <Route path="/about" element={<><AboutSection/></>} />
          <Route path="/find" element={<><NavBar/> <NavMbl/> <FindOutSection/> <Footer/> </>} />
          <Route path="/get-started" element={<ProtectedRoute><NavBar/> <NavMbl/> <GetStartedSection/> <Footer/> </ProtectedRoute>} />
          {/* <Route path="/faq" element={<> <FAQSectionV2/> </>} /> */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Router>
      </>
    )
  }

  export default App

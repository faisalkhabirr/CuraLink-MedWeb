import React from 'react';
import NavBar from './NavBar';
import './HomePage.css'
import NavMbl from './NavMbl';
import HeroSection from './HeroSection';
import WhatWeDoSection from './WhatWeDo';
import FAQSection from './FAQSection';
import Footer from './Footer';

function HomePage() {
  return (
    <div className='homePageContainer'>
        <NavBar/>
        <NavMbl/>
        <HeroSection/>
        <WhatWeDoSection/>
        <FAQSection/>
        <Footer/>
    </div>
  )
}

export default HomePage
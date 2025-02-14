import React from 'react'
import Hero from '../../components/Hero/Hero'
import './Home.css'
import Features from '../../components/Features/Features'
function Home() {
  return (
    <>
    <div className="hero">
    <Hero/>
    </div>
    <div className="features">
    <Features/>
    </div>
    </>
  )
}

export default Home
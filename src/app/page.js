"use client"

import Header from "@/components/Header/Header"
import Hero from "@/components/Hero/Hero"
import Menu from "@/components/Menu/Menu"
import About from "@/components/About/About"
import Contact from "@/components/Contact/Contact"

export default function Home() {
  const handleCartClick = () => {
    // Handle cart click
    console.log("Cart clicked")
  }

  const handleLoginClick = () => {
    // Handle login click
    console.log("Login clicked")
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Header onCartClick={handleCartClick} onLoginClick={handleLoginClick} />
      <main>
        <Hero />
        <Menu />
        <About />
        <Contact />
      </main>
    </div>
  )
}

import { Header } from "./components/Header"
import { Hero } from "./components/Hero"
import { RFPsAiSection } from "./components/RFPsAi-Section"

import { Accordion } from "./components/Faqs"
import { BoxCards } from "./components/Boxcards"
import { Footer } from "./components/Footer"
function App() {
  return (
    <div>
      <Header/>
      <Hero/>
      <RFPsAiSection/>
      <BoxCards/>
     <Accordion/> 
     <Footer/>
  

    </div>
  )
}

export default App

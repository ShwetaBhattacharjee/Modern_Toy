
import { useEffect } from 'react'


import Header from "./components/Header"
import Hero from "./components/Hero"
import background from "./assets/bg.png";
import Collections from "./components/Collections";
import Transactions from "./components/Transactions";
import Footer from "./components/Footer";
import CreateNFT from "./components/CreateNFT";
import { getAllNFTs, isWallectConnected, deployContract } from './Blockchain.services'

//import { isWallectConnected } from './Blockchain.services'
import ShowNFT from "./components/ShowNFT";
import UpdateNFT from "./components/UpdateNFT";
import Loading from "./components/Loading";
import Alert from "./components/Alert";

const App = () => {
  console.debug("Tested")
  useEffect(async () => {
      await isWallectConnected()
      await getAllNFTs()
    }, [])
  
 
  return (
    <div className="min-h-screen">
     <div className='gradient-bg-hero'>
     <Header/>
     </div>
     <div className='gradient-bg-hero1' style={{ backgroundImage: `url(${background})` }}>
     <Hero/>
     </div>
     <Collections />
     <Transactions />
     <Footer />
     <CreateNFT />
     <ShowNFT />
     <UpdateNFT />
     <Loading />
     <Alert />
    </div>
  )
}


export default App


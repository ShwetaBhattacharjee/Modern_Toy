/*Author:Shweta Bhattacharjee
Date:31-01-2023*/
import logo from '../assets/remove.png'
import imgHero from '../assets/imgToy1.png'
import Identicon from 'react-identicons'
import { setGlobalState } from '../store'

const Hero = () => {
  return (
    <div>
        <div className='flex flex-col md:flex-row w-4/5 justify-between items center mx-auto py-10'>
            <div className='md:w-3/6 w-full'>
            <div className='text-white'>
        <button className='shadow-xl shadow-black-500 font-bold bg-black md:text-xs p-3 rounded-full cursor-pointer scale-100 hover:scale-125 ease-in duration-500'>
        <span class="dot mx-2"></span>Make your kids happy
        </button>
        <div className='md:flex-[1] mt-5 flex-initial justify-center items-center'>
            <img className= "w-36 cursor-pointer mt-5" src={logo} alt="logo"/>
        </div>
        <p className='text-white font-semibold text-sm mt-5'>
            Games and Art
        </p>
        
        <p className=' text-white font-semibold text-sm mt-5 '>
        Our objective and promise is to create great material for our community and clients that depict and brings life to ideas, 
        dreams, and goals of our community, staff, and clients, as well as any inspiration we encounter along the way.
        </p>
        
        </div>
       
        <div class='flex mt-5'>
        <button className='shadow-xl shadow-green-300 font-bold bg-green-500   p-2  scale-100 hover:scale-125 ease-in duration-500
        rounded-full ' onClick={() => setGlobalState('modal', 'scale-100')}>
        Create NFT
        </button>
        </div>
        
        <div className='w-3/4 flex justify-between items-center mt-5'>
            <div className='text-white'>
                <p className='font-bold'>123k</p>
                <small className='text-white'>The Tribe</small>
            </div>
            <div className='text-white'>
                <p className='font-bold'>152k</p>
                <small className='text-white'>Roadmap</small>
            </div>
            <div className='text-white'>
                <p className='font-bold'>200k</p>
                <small className='text-white'>Team</small>
            </div>
            <div className='text-white'>
                <p className='font-bold'>250k</p>
                <small className='text-white'>Collection</small>
            </div>
            
        </div>
        </div>
        
        
        <div className='shadow-xl shadow-black md:w-2/5 w-full mt-10 md:mt-0 rounded-md overflow-hidden bg-gray-800'>
            <img className ='h-60 w-full object-cover' src={imgHero} alt="hero" />
            <div className='flex justify-start items center p-3'>
            <Identicon className="h-10 w-10 object-contain rounded-full mr-3"
            string={'0x21...786a'} size={50}/>
            <div>
                <p className='text-white font-semibold'>0x21...786a</p>
                <small className='text-blue-800 font-bold'>@you</small>
                </div> </div>
        </div>
        </div>
        
    </div>
  )
}

export default Hero
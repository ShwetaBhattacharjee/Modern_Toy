/*Author:Shweta Bhattacharjee
Date:31-01-2023*/
import logo from '../assets/remove.png'
import { connectWallet } from '../Blockchain.services'

import { useGlobalState, truncate } from '../store'


const Header = () => {
  const [connectedAccount] = useGlobalState('connectedAccount')
  return (
    <nav className='w-4/5 flex justify-between md:justify-center items-center py-4 mx-auto'>
        <div className='md:flex-[1] flex-initial justify-center items-center'>
            <img className= "w-13 h-10 cursor-pointer" src={logo} alt="logo"/>
        </div>
        <ul className='md:flex-[1] text-white md:flex hidden list-none justify-between items-center flex-initial'>
            <li className='mx-4 cursor-pointer font-bold'>Home</li>
            <li className='mx-4 cursor-pointer font-bold'>Crafts</li>
            <li className='mx-4 cursor-pointer font-bold'>Brand</li>
            <li className='mx-4 cursor-pointer font-bold'>Gifting</li>
            <li className='mx-4 cursor-pointer font-bold'>Collections</li>
            
        </ul>
        {connectedAccount ? (
       <button  className="shadow-xl shadow-black text-white
       bg-[#e32970] hover:bg-[#bd255f] md:text-xs p-2
         rounded-full cursor-pointer"
       >
         {truncate(connectedAccount, 4, 4, 11)}
       </button>
     ) : (
       <button
         className="shadow-xl shadow-black font-bold text-white cursor-pointer scale-100 hover:scale-125 ease-in duration-500   bg-blue-500  md:text-xs p-2 rounded-full"
         onClick={connectWallet}
       >
         Connect Wallet
       </button>
     )}
   </nav>
 )
}


        
export default Header
import { useState } from 'react'
import {FaTimes} from 'react-icons/fa'
import imgHero from '../assets/toys.png'
import { setGlobalState, useGlobalState ,setLoadingMsg,setAlert,} from '../store'
import { create } from 'ipfs-http-client'
import { mintNFT } from '../Blockchain.services'


const auth =
 'Basic ' +
 Buffer.from(
   process.env.REACT_APP_INFURIA_PID + ':' + process.env.REACT_APP_INFURIA_API,
 ).toString('base64')

const client = create({
 host: 'ipfs.infura.io',
 port: 5001,
 protocol: 'https',
 headers: {
   authorization: auth,
 },
})

const CreateNFT = async() => {
    const [modal]= useGlobalState('modal')
    const [title,setTitle]=useState('')
    const [description,setDescription]=useState('')
    const [price,setPrice]=useState('')
    const [fileUrl,setFileUrl]=useState('')
    const [imgBase64,setimgBase64]=useState('null')

    const handleSubmit = async(e) =>{
        e.preventDefault()
        if(!title || !description || !price) return
        setGlobalState('modal', 'scale-0')
   setLoadingMsg('Uploading IPFS data...' )

   try {
     const created = await client.add(fileUrl)
     const metadataURI = `https://ipfs.io/ipfs/${created.path}`
     const nft = { title, price, description, metadataURI }

     setLoadingMsg('Intializing transaction...')
     //setFileUrl(metadataURI)
     await mintNFT(nft)

     resetForm()
     setAlert('Minting completed...', 'green')
   } catch (error) {
     console.log('Error uploading file: ', error)
     setAlert('Minting failed...', 'red')
   }
 }

 const changeImage = async (e) => {
   const reader = new FileReader()
   if (e.target.files[0]) reader.readAsDataURL(e.target.files[0])

   reader.onload = (readerEvent) => {
     const file = readerEvent.target.result
     setImgBase64(file)
     setFileUrl(e.target.files[0])
   }
 }


    }
    const closeModal = () =>{
        setGlobalState('modal', 'scale-0')
        resetForm()
    }
    const resetForm =() =>{
        setFileUrl('')
        setimgBase64(null)
        setTitle('')
        setDescription('')
        setPrice('')
    }
  return (
    <div className={`fixed top-0 left-0 w-screen h-screen flex items-center justify-center bg-black bg-opacity-50
    transform transition-transform duration-300 ${modal}`}>
    <div className="bg-[#0c294c] shadow-xl   shadow-[#6592ce] rounded-xl w-11/12 md:w-2/5 h-7/12 p-6 ">
        <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="flex justify-between items-center  text-gray-400">
                <p className="font-semibold">Add NFT</p>
                <button type='button' onClick={closeModal} className="border-0 bg-transparent focus:outline-none ">
                    <FaTimes />
                </button>
            </div>
            <div className='flex justify-center items-center rounded-xl mt-5'>
                <div className='shrink-0 rounded-xl overflow-hidden h-20 w-20'>
                    <img className='h-full w-full object-cover curson-pointer' src={ imgHero || imgBase64} alt='NFT' />
                </div>
            </div>

            <div className='flex justify-between items-center bg-gray-800 rounded-xl mt-5'>
                <label className='block'>
                    <span className='sr-only'>Choose Profile Photo</span>
                    <input type='file' accept='image/png, image/gif, image/jpeg.image/jpg,image/webp'
                    className='block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0
                    file:text-sm file:font-semibold hover:file:bg-[#1d2631] focus:outline-none cursor-pointer focus:ring-0'
                     
                    onChange={changeImage} required />
                </label>
            </div>

            <div className='flex justify-between items-center bg-gray-800 rounded-xl mt-5'>
                
                    <span className='sr-only'>Choose Profile Photo</span>
                    <input type='text' accept='image/png, image/gif, image/jpeg.image/jpg,image/webp'
                    className='block w-full text-sm text-slate-500  focus:outline-none cursor-pointer focus:ring-0 bg-transparent border-0'
                    placeholder ='Title' name='title' 
                    onChange ={(e)=>setTitle(e.target.value)}
                    value={title}
                    required />
                
            </div>
            <div className='flex justify-between items-center bg-gray-800 rounded-xl mt-5'>
                
                <span className='sr-only'>Choose Profile Photo</span>
                <input type='number' accept='image/png, image/gif, image/jpeg.image/jpg,image/webp'
                className='block w-full text-sm text-slate-500  focus:outline-none cursor-pointer focus:ring-0 bg-transparent border-0'
                placeholder ='Price (ETH)'
                min={0.01}
                step={0.01} name='price' 
                onChange ={(e)=>setPrice(e.target.value)}
                value={price} required />
            
        </div>
        <div className='flex justify-between items-center bg-gray-800 rounded-xl mt-5'>
                
                <span className='sr-only'>Choose Profile Photo</span>
                <textarea type='text' accept='image/png, image/gif, image/jpeg.image/jpg,image/webp'
                className='block w-full text-sm text-slate-500  focus:outline-none cursor-pointer focus:ring-0 bg-transparent 
                border-0 h-20 resize-none'
                placeholder ='Description'  name='description' 
                onChange ={(e)=>setDescription(e.target.value)}
                value={description} required ></textarea>
            </div>
            <button className='flex justify-center items-center shadow-lg shadow-black text-white text-md mt-5
            w-full  bg-blue-500 hover:bg-[#230e6e] rounded-full p-2'>
                Mint Now</button>
        </form>
   </div>
    </div>
  )


export default CreateNFT
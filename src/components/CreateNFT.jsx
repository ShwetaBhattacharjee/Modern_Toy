/*Author: Shweta Bhattacharjee
Date: 31-01-2023
Fixed: 05-10-2025 - Using Lighthouse.storage + Fixed wallet connection + Image Gateway Fix
Updated: 10-10-2025 - Fixed image display issues with multiple IPFS gateways*/

import { useState } from 'react'
import { FaTimes } from 'react-icons/fa'
import imgHero from '../assets/toys.png'
import { mintNFT, connectWallet } from '../Blockchain.services'
import {
  useGlobalState,
  setGlobalState,
  setLoadingMsg,
  setAlert,
} from '../store'

// Lighthouse API key - Get free at https://files.lighthouse.storage
const LIGHTHOUSE_API_KEY = process.env.REACT_APP_LIGHTHOUSE_API_KEY

const CreateNFT = () => {
  const [modal] = useGlobalState('modal')
  const [connectedAccount] = useGlobalState('connectedAccount')
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [fileUrl, setFileUrl] = useState('')
  const [imgBase64, setImgBase64] = useState(null)

  // 🔹 Upload to Lighthouse
  const uploadToLighthouse = async (file) => {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('https://node.lighthouse.storage/api/v0/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LIGHTHOUSE_API_KEY}`
        },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || `Upload failed: ${response.status}`)
      }

      const data = await response.json()
      console.log('Lighthouse response:', data)
      return data.Hash
    } catch (error) {
      console.error('Lighthouse upload error:', error)
      throw error
    }
  }

  // 🔹 Handle NFT Mint
  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log("Submitting...")

    if (!title || !price || !description || !fileUrl || fileUrl.length === 0) {
      setAlert('Please fill all fields', 'red')
      return
    }

    if (!LIGHTHOUSE_API_KEY) {
      setAlert('Please add REACT_APP_LIGHTHOUSE_API_KEY to your .env file', 'red')
      console.error('Missing API key. Get one free at https://files.lighthouse.storage')
      return
    }

    if (typeof window === 'undefined' || !window.ethereum) {
      setAlert('Please install MetaMask to mint NFTs', 'red')
      window.open('https://metamask.io/download.html', '_blank')
      return
    }

    if (!connectedAccount) {
      setAlert('Connecting wallet...', 'blue')
      try {
        await connectWallet()
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        setAlert('Please connect your wallet to continue', 'red')
        return
      }
    }

    setGlobalState('modal', 'scale-0')
    setLoadingMsg('Uploading image to IPFS via Lighthouse...')

    try {
      const imageFile = fileUrl[0]

      console.log("Uploading image to Lighthouse...")
      const imageCID = await uploadToLighthouse(imageFile)
      console.log('✅ Image uploaded! CID:', imageCID)

      setLoadingMsg('Creating and uploading metadata...')

      // ✅ Using multiple gateway URLs for better compatibility
      // Primary: Lighthouse gateway, Fallback: ipfs.io (widely supported)
      const imageGatewayURL = `https://ipfs.io/ipfs/${imageCID}`
      
      // Alternative gateways (you can switch if one doesn't work):
      // const imageGatewayURL = `https://gateway.lighthouse.storage/ipfs/${imageCID}`
      // const imageGatewayURL = `https://cloudflare-ipfs.com/ipfs/${imageCID}`
      // const imageGatewayURL = `https://gateway.pinata.cloud/ipfs/${imageCID}`

      const metadata = {
        name: title,
        description: description,
        image: imageGatewayURL,
        // Adding additional fields for better NFT marketplace compatibility
        external_url: imageGatewayURL,
        attributes: []
      }

      console.log('Metadata:', metadata)
      console.log('Image will be accessible at:', imageGatewayURL)

      const metadataBlob = new Blob([JSON.stringify(metadata)], {
        type: 'application/json'
      })
      const metadataFile = new File([metadataBlob], 'metadata.json', {
        type: 'application/json'
      })

      console.log("Uploading metadata to Lighthouse...")
      const metadataCID = await uploadToLighthouse(metadataFile)
      console.log('✅ Metadata uploaded! CID:', metadataCID)

      const metadataURI = `https://gateway.lighthouse.storage/ipfs/${metadataCID}`

      // Log for debugging
      console.log('📋 NFT Details:')
      console.log('- Image CID:', imageCID)
      console.log('- Image URL:', imageGatewayURL)
      console.log('- Metadata CID:', metadataCID)
      console.log('- Metadata URI:', metadataURI)
      console.log('Visit metadata URI to verify image link:', metadataURI)

      const nft = { title, price, description, metadataURI }

      setLoadingMsg('Initializing blockchain transaction...')
      console.log('Minting NFT with metadata URI:', metadataURI)

      await mintNFT(nft)

      resetForm()
      setAlert('Minting completed successfully!', 'green')
      
      // Log final info
      console.log('✅ NFT Minted! To view your NFT:')
      console.log('1. Check metadata:', metadataURI)
      console.log('2. Check image directly:', imageGatewayURL)
      console.log('3. Wait 15-30 mins for OpenSea to index')
      
      setTimeout(() => window.location.reload(), 3000)

    } catch (error) {
      console.error('Error during minting process:', error)
      setAlert(`Minting failed: ${error.message}`, 'red')
      setGlobalState('modal', 'scale-100')
    }
  }

  // 🔹 Preview Image
  const changeImage = async (e) => {
    console.log("File selected:", e.target.files[0])
    const reader = new FileReader()
    if (e.target.files[0]) {
      reader.readAsDataURL(e.target.files[0])
      setFileUrl(e.target.files)
    }
    reader.onload = (readerEvent) => {
      const file = readerEvent.target.result
      setImgBase64(file)
    }
  }

  // 🔹 Reset Form
  const closeModal = () => {
    setGlobalState('modal', 'scale-0')
    resetForm()
  }

  const resetForm = () => {
    setFileUrl('')
    setImgBase64(null)
    setTitle('')
    setPrice('')
    setDescription('')
  }

  return (
    <div
      className={`fixed top-0 left-0 w-screen h-screen flex items-center
        justify-center bg-black bg-opacity-50 transform
        transition-transform duration-300 ${modal}`}
    >
      <div className="bg-[#151c25] shadow-xl shadow-[#6668c9] rounded-xl w-11/12 md:w-2/5 h-7/12 p-6">
        <form className="flex flex-col">
          <div className="flex flex-row justify-between items-center">
            <p className="font-semibold text-gray-400">Add NFT</p>
            <button
              type="button"
              onClick={closeModal}
              className="border-0 bg-transparent focus:outline-none"
            >
              <FaTimes className="text-gray-400" />
            </button>
          </div>

          <div className="flex flex-row justify-center items-center rounded-xl mt-5">
            <div className="shrink-0 rounded-xl overflow-hidden h-20 w-20">
              <img
                alt="NFT"
                className="h-full w-full object-cover cursor-pointer"
                src={imgBase64 || imgHero}
              />
            </div>
          </div>

          <div className="flex flex-row justify-between items-center bg-gray-800 rounded-xl mt-5">
            <label className="block w-full">
              <span className="sr-only">Choose NFT image</span>
              <input
                type="file"
                accept="image/png, image/gif, image/jpeg, image/webp"
                className="block w-full text-sm text-slate-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-[#19212c] file:text-gray-400
                  hover:file:bg-[#1d2631]
                  cursor-pointer focus:ring-0 focus:outline-none"
                onChange={changeImage}
                required
              />
            </label>
          </div>

          <input
            className="block w-full text-sm text-slate-500 bg-transparent border-0
              focus:outline-none focus:ring-0 px-4 py-3 mt-5 bg-gray-800 rounded-xl"
            type="text"
            placeholder="Title"
            onChange={(e) => setTitle(e.target.value)}
            value={title}
            required
          />

          <input
            className="block w-full text-sm text-slate-500 bg-transparent border-0
              focus:outline-none focus:ring-0 px-4 py-3 mt-5 bg-gray-800 rounded-xl"
            type="number"
            step={0.01}
            min={0.01}
            placeholder="Price (ETH)"
            onChange={(e) => setPrice(e.target.value)}
            value={price}
            required
          />

          <textarea
            className="block w-full text-sm resize-none text-slate-500 bg-transparent border-0
              focus:outline-none focus:ring-0 h-20 px-4 py-3 mt-5 bg-gray-800 rounded-xl"
            placeholder="Description"
            onChange={(e) => setDescription(e.target.value)}
            value={description}
            required
          ></textarea>

          <button
            type="submit"
            onClick={handleSubmit}
            className="flex flex-row justify-center items-center
              w-full text-white text-md bg-[#3941db]
              hover:bg-[#4a32b4] py-2 px-5 rounded-full
              drop-shadow-xl border border-transparent
              hover:bg-transparent hover:text-[#d6cfeb]
              hover:border hover:border-[#e4dff1]
              focus:outline-none focus:ring mt-5"
          >
            Mint Now
          </button>
        </form>
      </div>
    </div>
  )
}

export default CreateNFT
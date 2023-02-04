/*Author:Shweta Bhattacharjee
Date:31-01-2023*/
import { useState } from 'react'
import {FaTimes} from 'react-icons/fa'
import imgHero from '../assets/toys.png'

import { create } from 'ipfs-http-client'
import { Web3Storage } from 'web3.storage'

import { NFTStorage, File } from 'nft.storage'
// The 'mime' npm package helps us set the correct file type on our File objects
import mime from 'mime'

// The 'fs' builtin module on Node.js provides access to the file system
//import fs from 'fs'


import { mintNFT } from '../Blockchain.services'

import {
  useGlobalState,
  setGlobalState,
  setLoadingMsg,
  setAlert,
 } from '../store'
//import { deployContract } from '@nomiclabs/hardhat-ethers/types'
 
/* 
  const auth =
  'Bearer ' +
  Buffer.from(
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGI0ZEQzNDdkZTU1ZjE0MEJlMTk1ODUzOGU4MTY3YTk3ZDk5ZDkzODUiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NzQ4OTM4MTIwMTAsIm5hbWUiOiJ0ZXN0In0.FfkUoyRyKvY4JOHSBpVihv50eOYP4rYAVYWZAedpEFU',
  ).toString('base64')
 
 const client = create({
  host: 'api.web3.storage',
  port: 443,
  protocol: 'https',
  headers: {
    authorization: auth,
  },
 })
*/

const NFT_STORAGE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDY4YkI4ZDliMkUwMkU2RkRiODlGQjNjRTdGOWJmNTlFNGUxRTY4NGUiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY3NTA2ODgxMTA1MiwibmFtZSI6InNod2V0YV9uZnQifQ.woImUnxdm2D8ubgcFAXMm4OLbOCLgnbqbu3P_YGTnjQ'
const client = new NFTStorage({ token: NFT_STORAGE_KEY })

//const client = new Web3Storage({ token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGI0ZEQzNDdkZTU1ZjE0MEJlMTk1ODUzOGU4MTY3YTk3ZDk5ZDkzODUiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NzQ4OTM4MTIwMTAsIm5hbWUiOiJ0ZXN0In0.FfkUoyRyKvY4JOHSBpVihv50eOYP4rYAVYWZAedpEFU' })


 const CreateNFT = () => {
  const [modal] = useGlobalState('modal')
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [fileUrl, setFileUrl] = useState('')
  const [imgBase64, setImgBase64] = useState(null)
 
  const handleSubmit = async (e) => {
    //deployContract()
    console.debug("Submitting..")
    e.preventDefault()
    console.log("Submititing")
    if (!title || !price || !description) return
 
    setGlobalState('modal', 'scale-0')
    setLoadingMsg('Uploading IPFS data...')
 
    try {
      console.log("FileURL ", fileUrl)

      //const created = await client.put(fileUrl)
      //const metadataURI = `https://dweb.link/ipfs/${created}`

      const image = fileUrl[0] //new File([content], path.basename(fileUrl[0].File), { type })
      //const name = title
      
      const result = await client.store({
        image,
        name: 'ExampleNFT',
        description
      })

      console.log(result)

      const metadataURI = result.data.image.href
      const nft = { title, price, description, metadataURI }
 
      setLoadingMsg('Intializing transaction...')
      setFileUrl(metadataURI)
      await mintNFT(nft)
 
      resetForm()
      setAlert('Minting completed...', 'green')
      window.location.reload()
    } catch (error) {
      console.log('Error uploading file: ', error)
      setAlert('Minting failed...', 'red')
    }
  }
 
  const changeImage = async (e) => {
    console.log("File ", e.target.files)
    const reader = new FileReader()
    if (e.target.files[0]) reader.readAsDataURL(e.target.files[0])
    setFileUrl(e.target.files)
    reader.onload = (readerEvent) => {
      const file = readerEvent.target.result
      setImgBase64(file)
      
    }
  }
 
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
                src={
                  imgBase64
                }
              />
            </div>
          </div>
 
          <div className="flex flex-row justify-between items-center bg-gray-800 rounded-xl mt-5">
            <label className="block">
              <span className="sr-only">Choose profile photo</span>
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
 
          <div className="flex flex-row justify-between items-center bg-gray-800 rounded-xl mt-5">
            <input
              className="block w-full text-sm
                text-slate-500 bg-transparent border-0
                focus:outline-none focus:ring-0"
              type="text"
              name="title"
              placeholder="Title"
              onChange={(e) => setTitle(e.target.value)}
              value={title}
              required
            />
          </div>
 
          <div className="flex flex-row justify-between items-center bg-gray-800 rounded-xl mt-5">
            <input
              className="block w-full text-sm
                text-slate-500 bg-transparent border-0
                focus:outline-none focus:ring-0"
              type="number"
              step={0.01}
              min={0.01}
              name="price"
              placeholder="Price (Eth)"
              onChange={(e) => setPrice(e.target.value)}
              value={price}
              required
            />
          </div>
 
          <div className="flex flex-row justify-between items-center bg-gray-800 rounded-xl mt-5">
            <textarea
              className="block w-full text-sm resize-none
                text-slate-500 bg-transparent border-0
                focus:outline-none focus:ring-0 h-20"
              type="text"
              name="description"
              placeholder="Description"
              onChange={(e) => setDescription(e.target.value)}
              value={description}
              required
            ></textarea>
          </div>
 
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
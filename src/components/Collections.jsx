/*Author:Shweta Bhattacharjee
Date:31-01-2023
Fixed:10-10-2025 - Image display fix*/

import { useEffect, useState } from 'react'
import { setGlobalState, useGlobalState } from '../store'

const Collections = () => {
  const [nfts] = useGlobalState('nfts')
  const [end, setEnd] = useState(4)
  const [count] = useState(4)
  const [collection, setCollection] = useState([])

  const getCollection = () => {
    return nfts.slice(0, end)
  }

  useEffect(() => {
    setCollection(getCollection())
  }, [nfts, end])

  return (
    <div className="bg-[#151c25] gradient-bg-artworks">
      <div className="w-4/5 py-10 mx-auto">
        <h4 className="text-white text-3xl font-bold uppercase text-gradient">
          {collection.length > 0 ? 'Latest Artworks' : 'No Collections Yet'}
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-4 lg:gap-3 py-2.5">
          {collection.map((nft, i) => (
            <Card key={i} nft={nft} />
          ))}
        </div>

        {collection.length > 0 && nfts.length > collection.length ? (
          <div className="text-center my-5">
            <button
              className="shadow-xl shadow-black text-white
              bg-blue-500 hover:bg-[#230e6e]
            rounded-full cursor-pointer p-2"
              onClick={() => setEnd(end + count)}
            >
             Load More
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

const Card = ({ nft }) => {
  const setNFT = () => {
    setGlobalState('nft', nft)
    setGlobalState('showModal', 'scale-100')
  }

  // ✅ FIX: Handle both imgURI and image fields, with fallback for missing images
  const getImageUrl = () => {
    // Try different possible image field names
    return nft.imgURI || nft.image || nft.imageUrl || nft.metadata?.image || ''
  }

  const imageUrl = getImageUrl()

  return (
    <div className="w-full shadow-xl shadow-black rounded-md overflow-hidden bg-gray-800 my-2 p-3">
      <img
        src={imageUrl || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23374151" width="400" height="400"/%3E%3Ctext fill="%239CA3AF" font-family="sans-serif" font-size="24" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E'}
        alt={nft.title || 'NFT'}
        loading="lazy"
        className="h-60 w-full object-cover shadow-lg shadow-black rounded-lg mb-3"
        onError={(e) => {
          console.error('Image failed to load:', imageUrl)
          // Try alternative IPFS gateways in order
          const currentSrc = e.target.src
          
          // Extract CID safely
          const extractCID = (url) => {
            if (!url) return null
            const parts = url.split('/ipfs/')
            return parts.length > 1 ? parts[1].split('?')[0] : null
          }
          
          const cid = extractCID(currentSrc)
          if (!cid) {
            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23374151" width="400" height="400"/%3E%3Ctext fill="%239CA3AF" font-family="sans-serif" font-size="20" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EInvalid Image%3C/text%3E%3C/svg%3E'
            return
          }
          
          if (currentSrc.includes('cf-ipfs.com')) {
            e.target.src = `https://dweb.link/ipfs/${cid}`
            console.log('Trying dweb.link gateway')
          } else if (currentSrc.includes('dweb.link')) {
            e.target.src = `https://ipfs.io/ipfs/${cid}`
            console.log('Trying ipfs.io gateway')
          } else if (currentSrc.includes('ipfs.io')) {
            e.target.src = `https://gateway.lighthouse.storage/ipfs/${cid}`
            console.log('Trying lighthouse gateway')
          } else if (currentSrc.includes('gateway.lighthouse.storage')) {
            // All gateways failed, show placeholder
            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23374151" width="400" height="400"/%3E%3Ctext fill="%239CA3AF" font-family="sans-serif" font-size="20" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EImage Not Found%3C/text%3E%3C/svg%3E'
            console.error('All gateways failed for CID:', cid)
          }
        }}
      />
      
      <h4 className="text-white font-semibold">{nft.title}</h4>
      <p className="text-gray-400 text-xs my-1">{nft.description}</p>
      <div className="flex justify-between items-center mt-3 text-white">
        <div className="flex flex-col">
          <small className="text-xs">Current Price</small>
          <p className="text-sm font-semibold">{nft.cost} ETH</p>
        </div>

        <button
          className="shadow-lg shadow-black text-white text-sm bg-blue-500 hover:bg-[#230e6e] cursor-pointer rounded-full px-1.5 py-1"
          onClick={setNFT}
        >
          View Details
        </button>
      </div>
    </div>
  )
}

export default Collections
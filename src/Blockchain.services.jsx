/*Author:Shweta Bhattacharjee
Date:31-01-2023
Fixed: 05-10-2025 - Fixed ethereum object detection
Updated: 10-10-2025 - Fixed NFT image display by fetching metadata*/

import Web3 from 'web3'
import { setGlobalState, getGlobalState, setAlert } from './store'
import abi from './abis/MetadNFT.json'

// Safe ethereum getter
const getEthereum = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return window.ethereum
  }
  return null
}

// Initialize web3 safely
const initWeb3 = () => {
  const ethereum = getEthereum()
  if (ethereum) {
    window.web3 = new Web3(ethereum)
    return window.web3
  }
  return null
}

const getEtheriumContract = async () => {
  const connectedAccount = getGlobalState('connectedAccount')

  if (connectedAccount) {
    const web3 = initWeb3()
    if (!web3) {
      throw new Error('Please install MetaMask')
    }
    
    const networkId = await web3.eth.net.getId()
    console.log("network ID ", networkId)
    const networkData = abi.networks[networkId]
    console.log("network data ", networkData)
    
    if (networkData) {
      const contract = new web3.eth.Contract(abi.abi, networkData.address)
      return contract
    } else {
      throw new Error('Contract not deployed on this network. Please switch to the correct network.')
    }
  } else {
    console.log("No connected account")
    return getGlobalState('contract')
  }
}

const connectWallet = async () => {
  try {
    const ethereum = getEthereum()
    if (!ethereum) {
      setAlert('Please install MetaMask browser extension', 'red')
      window.open('https://metamask.io/download.html', '_blank')
      return
    }
    
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
    setGlobalState('connectedAccount', accounts[0].toLowerCase())
    console.log('Wallet connected:', accounts[0])
    setAlert('Wallet connected successfully!', 'green')
  } catch (error) {
    reportError(error)
  }
}

const isWallectConnected = async () => {
  try {
    const ethereum = getEthereum()
    if (!ethereum) {
      console.log('MetaMask not detected')
      return false
    }
    
    const accounts = await ethereum.request({ method: 'eth_accounts' })

    window.ethereum.on('chainChanged', (chainId) => {
      window.location.reload()
    })

    window.ethereum.on('accountsChanged', async () => {
      setGlobalState('connectedAccount', accounts[0]?.toLowerCase() || '')
      await isWallectConnected()
    })

    if (accounts.length) {
      setGlobalState('connectedAccount', accounts[0].toLowerCase())
      return true
    } else {
      console.log('No accounts found. Please connect wallet.')
      return false
    }
  } catch (error) {
    console.error('Error checking wallet connection:', error)
    return false
  }
}

const mintNFT = async ({ title, description, metadataURI, price }) => {
  try {
    const ethereum = getEthereum()
    if (!ethereum) {
      throw new Error('Please install MetaMask to mint NFTs')
    }

    // Check if wallet is connected
    const connectedAccount = getGlobalState('connectedAccount')
    if (!connectedAccount) {
      console.log('Wallet not connected, connecting...')
      await connectWallet()
      // Wait a bit for connection to complete
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    const web3 = initWeb3()
    if (!web3) {
      throw new Error('Failed to initialize Web3')
    }

    const priceInWei = web3.utils.toWei(price.toString(), 'ether')
    console.log("Price set:", priceInWei)
    
    const contract = await getEtheriumContract()
    if (!contract) {
      throw new Error('Failed to get contract. Make sure you are on the correct network.')
    }
    
    console.log("Contract loaded successfully")
    
    const account = getGlobalState('connectedAccount')
    console.log("Minting from account:", account)
    
    const mintPrice = web3.utils.toWei('0.01', 'ether')
    
    setAlert('Please confirm the transaction in MetaMask...', 'blue')
    
    const result = await contract.methods
      .payToMint(title, description, metadataURI, priceInWei)
      .send({ from: account, value: mintPrice })
    
    console.log('Mint transaction successful:', result)
    return true
    
  } catch (error) {
    console.error('Minting error:', error)
    if (error.message.includes('User denied')) {
      setAlert('Transaction rejected by user', 'red')
    } else if (error.message.includes('install MetaMask')) {
      setAlert('Please install MetaMask', 'red')
    } else {
      reportError(error)
    }
    throw error
  }
}

const getAllNFTs = async () => {
  try {
    const ethereum = getEthereum()
    if (!ethereum) {
      console.log('MetaMask not installed')
      return
    }
    
    const contract = await getEtheriumContract()
    if (!contract) return
    
    const nfts = await contract.methods.getAllNFTs().call()
    const transactions = await contract.methods.getAllTransactions().call()
    
    // ✅ FIX: Use async version to fetch metadata
    const structuredNFTs = await structuredNfts(nfts)
    const structuredTransactions = await structuredNfts(transactions)
    
    setGlobalState('nfts', structuredNFTs)
    setGlobalState('transactions', structuredTransactions)
  } catch (error) {
    reportError(error)
  }
}

// ✅ OPTIMIZED: Fetch metadata with caching and faster gateways
const structuredNfts = async (nfts) => {
  const web3 = initWeb3()
  if (!web3) return []
  
  // Handle empty array
  if (!nfts || nfts.length === 0) return []
  
  // Use faster IPFS gateways in order of preference
  const gateways = [
    'https://cf-ipfs.com/ipfs/',
    'https://dweb.link/ipfs/',
    'https://ipfs.io/ipfs/'
  ]
  
  // Map through all NFTs and fetch their metadata
  const structuredNFTs = await Promise.all(
    nfts.map(async (nft) => {
      try {
        // Convert IPFS URI to HTTP gateway URL if needed
        let metadataURL = nft.metadataURI
        if (metadataURL.startsWith('ipfs://')) {
          const cid = metadataURL.replace('ipfs://', '')
          metadataURL = `${gateways[0]}${cid}` // Use fastest gateway
        } else if (metadataURL.includes('gateway.lighthouse.storage')) {
          const cid = metadataURL.split('/ipfs/')[1]
          metadataURL = `${gateways[0]}${cid}`
        }
        
        console.log('Fetching metadata from:', metadataURL)
        
        // Fetch the metadata JSON with shorter timeout for faster failure
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
        
        const response = await fetch(metadataURL, { 
          signal: controller.signal,
          // Add cache control for faster subsequent loads
          cache: 'force-cache'
        })
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const metadata = await response.json()
        
        console.log('✅ Metadata loaded for NFT', nft.id)
        
        // ✅ Extract the image URL from metadata and use fastest gateway
        let imageURL = metadata.image || metadata.imageUrl || ''
        
        // Convert ANY IPFS URLs to use cloudflare gateway (fastest)
        if (imageURL.startsWith('ipfs://')) {
          const cid = imageURL.replace('ipfs://', '')
          imageURL = `${gateways[0]}${cid}`
        } else if (imageURL.includes('gateway.lighthouse.storage') || imageURL.includes('lighthouse.storage')) {
          const cid = imageURL.split('/ipfs/')[1]
          if (cid) {
            imageURL = `${gateways[0]}${cid}`
          }
        } else if (imageURL.includes('ipfs.io')) {
          // Replace ipfs.io with cloudflare (faster)
          const cid = imageURL.split('/ipfs/')[1]
          imageURL = `${gateways[0]}${cid}`
        }
        
        console.log('Image URL for NFT', nft.id, ':', imageURL)
        
        return {
          id: Number(nft.id),
          owner: nft.owner.toLowerCase(),
          cost: web3.utils.fromWei(nft.cost),
          title: nft.title || metadata.name || 'Untitled',
          description: nft.description || metadata.description || 'No description',
          metadataURI: nft.metadataURI,
          imgURI: imageURL, // ✅ This is the actual image URL from metadata
          timestamp: nft.timestamp,
        }
      } catch (error) {
        console.error('⚠️ Error fetching metadata for NFT', nft.id, ':', error.message)
        
        // Return NFT with fallback values if metadata fetch fails
        return {
          id: Number(nft.id),
          owner: nft.owner.toLowerCase(),
          cost: web3.utils.fromWei(nft.cost),
          title: nft.title || 'Loading...',
          description: nft.description || 'Loading metadata...',
          metadataURI: nft.metadataURI,
          imgURI: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23374151" width="400" height="400"/%3E%3Ctext fill="%239CA3AF" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ELoading...%3C/text%3E%3C/svg%3E',
          timestamp: nft.timestamp,
        }
      }
    })
  )
  
  return structuredNFTs.reverse()
}

const updateNFT = async ({ id, cost }) => {
  try {
    const web3 = initWeb3()
    if (!web3) throw new Error('Web3 not initialized')
    
    const costInWei = web3.utils.toWei(cost.toString(), 'ether')
    const contract = await getEtheriumContract()
    const buyer = getGlobalState('connectedAccount')
 
    await contract.methods.changePrice(Number(id), costInWei).send({ from: buyer })
  } catch (error) {
    reportError(error)
  }
}

const buyNFT = async ({ id, cost }) => {
  try {
    const web3 = initWeb3()
    if (!web3) throw new Error('Web3 not initialized')
    
    const costInWei = web3.utils.toWei(cost.toString(), 'ether')
    const contract = await getEtheriumContract()
    const buyer = getGlobalState('connectedAccount')
 
    await contract.methods
      .payToBuy(Number(id))
      .send({ from: buyer, value: costInWei })
 
    return true
  } catch (error) {
    reportError(error)
  }
}

const reportError = (error) => {
  console.error('Blockchain error:', error)
  
  let errorMessage = 'An error occurred'
  
  if (error.message) {
    errorMessage = error.message
  } else if (typeof error === 'string') {
    errorMessage = error
  } else {
    errorMessage = JSON.stringify(error)
  }
  
  setAlert(errorMessage, 'red')
}

export {
  connectWallet,
  isWallectConnected,
  mintNFT,
  getAllNFTs,
  updateNFT,
  buyNFT,
  getEthereum,
}
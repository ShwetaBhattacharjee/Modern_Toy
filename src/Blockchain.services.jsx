/*Author:Shweta Bhattacharjee
Date:31-01-2023*/
import Web3 from 'web3'
import { setGlobalState, getGlobalState, setAlert } from './store'
import abi from './abis/MetadNFT.json'

const { ethereum } = window
window.web3 = new Web3(ethereum)
window.web3 = new Web3(window.web3.currentProvider)

const getEtheriumContract = async () => {
 const connectedAccount = getGlobalState('connectedAccount')

 if (connectedAccount) {
   const web3 = window.web3
   const networkId = await web3.eth.net.getId()
   console.log("network ID ", networkId)
   const networkData = abi.networks[networkId]
    console.log("network data ", networkData)
   if (networkData) {
     const contract = new web3.eth.Contract(abi.abi, networkData.address)
     return contract
   } else {
     console.log("No contract eth");
     return null
   }
 } else {
  console.log("No connected account")
   return getGlobalState('contract')
 }
}

const connectWallet = async () => {
 try {
   if (!ethereum) return alert('Please install Metamask')
   const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
   setGlobalState('connectedAccount', accounts[0].toLowerCase())
 } catch (error) {
   reportError(error)
 }
}

const isWallectConnected = async () => {
 try {
   if (!ethereum) return alert('Please install Metamask')
   //connectWallet()
   const accounts = await ethereum.request({ method: 'eth_accounts' })

   window.ethereum.on('chainChanged', (chainId) => {
     window.location.reload()
   })

   window.ethereum.on('accountsChanged', async () => {
     setGlobalState('connectedAccount', accounts[0].toLowerCase())
     await isWallectConnected()
   })

   if (accounts.length) {
     setGlobalState('connectedAccount', accounts[0].toLowerCase())
   } else {
     alert('Please connect wallet.')
     console.log('No accounts found.')
   }
  } catch (error) {
    reportError(error)
  }
 }
 const mintNFT = async ({ title, description, metadataURI, price }) => {
  try {
    connectWallet()
    price = window.web3.utils.toWei(price.toString(), 'ether')
    console.log("Price set", price)
    const contract = await getEtheriumContract()
    console.log("Ethereum contract ", contract)
    const account = getGlobalState('connectedAccount')
    console.log("Connected account", account)
    const mintPrice = window.web3.utils.toWei('0.01', 'ether')
    await contract.methods
      .payToMint(title, description, metadataURI, price)
      .send({ from: account, value: mintPrice })
 
    return true
  } catch (error) {

    reportError(error)
  }
 }

 const getAllNFTs = async () => {
  try {
    if (!ethereum) return alert('Please install Metamask')
    const contract = await getEtheriumContract()
    const nfts = await contract.methods.getAllNFTs().call()
    const transactions = await contract.methods.getAllTransactions().call()
    
    setGlobalState('nfts', structuredNfts(nfts))
    setGlobalState('transactions', structuredNfts(transactions))
  } catch (error) {
    reportError(error)
  }
}

const structuredNfts = (nfts) => {
return nfts
  .map((nft) => ({
    id: Number(nft.id),
    owner: nft.owner.toLowerCase(),
    cost: window.web3.utils.fromWei(nft.cost),
    title: nft.title,
    description: nft.description,
    metadataURI: nft.metadataURI,
    imgURI: nft.metadataURI.replace("ipfs://", "https://ipfs.io/ipfs/"),
    timestamp: nft.timestamp,
  }))
  .reverse()
}
const updateNFT = async ({ id, cost }) => {
  try {
    cost = window.web3.utils.toWei(cost.toString(), 'ether')
    const contract = await getEtheriumContract()
    const buyer = getGlobalState('connectedAccount')
 
    await contract.methods.changePrice(Number(id), cost).send({ from: buyer })
  } catch (error) {
    reportError(error)
  }
 }
 
 const buyNFT = async ({ id, cost }) => {
  try {
    cost = window.web3.utils.toWei(cost.toString(), 'ether')
    const contract = await getEtheriumContract()
    const buyer = getGlobalState('connectedAccount')
 
    await contract.methods
      .payToBuy(Number(id))
      .send({ from: buyer, value: cost })
 
    return true
  } catch (error) {
    reportError(error)
  }
 }
 
 
 const reportError = (error) => {
  setAlert(JSON.stringify(error), 'red')
  throw new Error('No ethereum object.')
 }
 export {
  connectWallet,
  isWallectConnected,
  mintNFT,
  getAllNFTs,updateNFT,buyNFT,
 }
 
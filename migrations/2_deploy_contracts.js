const MetadNFT = artifacts.require('MetadNFT')

module.exports = async (deployer) => {
  const accounts = await web3.eth.getAccounts()

  await deployer.deploy(MetadNFT, 'MetadNFTs', 'TNT', 10, accounts[1])
}


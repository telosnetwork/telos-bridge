const ethers = require('ethers')
const endpointAbi = require('./endpointAbi')
const {Contract} = require('ethers')

// Same address on all chains
const originalTokenBridge = '0x9c5ebCbE531aA81bD82013aBF97401f5C6111d76'
const wrappedTokenBridge = '0x9c5ebCbE531aA81bD82013aBF97401f5C6111d76'
const endpointAddress = '0x66A71Dcef29A0fFBDBE3c6a460a3B5BC225Cd675'
const rpc = 'https://mainnet.telos.net/evm'
const provider = ethers.getDefaultProvider(rpc)
const trustedRemote = ethers.utils.solidityPack(
  ['address','address'],
  [originalTokenBridge, wrappedTokenBridge]
)

const endpoint = new Contract(endpointAddress, endpointAbi, provider)

const chainIds = {
  "Ethereum": 101,
  "BSC": 102,
  "Arbitrum": 110,
  "Avalanche": 106,
  "Polygon": 109,
}

async function checkAndFix() {
  for (let network in chainIds) {
    try {
      const chainId = chainIds[network]
      const result = await endpoint.hasStoredPayload(chainId, trustedRemote)
      console.log(`${network} has stored payload = ${result}`)
      // TODO: if result === true, clear payload: https://layerzero.gitbook.io/docs/evm-guides/error-messages/storedpayload
      //   I believe we'd use the read function `storedPayload` with the same parameters to get the payload value itself
      //   and then call `retryPayload` with that payload value
    } catch (e) {
      console.error(e)
    }
  }
}

checkAndFix()

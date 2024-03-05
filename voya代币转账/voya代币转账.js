const Web3 = require('web3');
const fs = require("fs")

async function callContractFunction(web3, privateKey, toAddress, nonce) {
    const contractAddress = '0x480E158395cC5b41e5584347c495584cA2cAf78d';//合同address
    const contractABI = [
        {
            "type": "function",
            "stateMutability": "nonpayable",
            "outputs": [{"type": "bool", "name": "", "internalType": "bool"}],
            "name": "transfer",
            "inputs": [{"type": "address", "name": "to", "internalType": "address"}, {
                "type": "uint256",
                "name": "value",
                "internalType": "uint256"
            }]
        }
    ];
    const functionName = 'transfer'; // 使用实际的函数名替换

    const contract = new web3.eth.Contract(contractABI, contractAddress);
    const txData = contract.methods[functionName](
        toAddress,
        Web3.utils.toWei("1","ether")
    ).encodeABI();

    const tx = {
        to: contractAddress,
        nonce: nonce,
        data: txData,
        gasPrice: Web3.utils.toWei("0.00000000005","ether"),
        gasLimit: 60000,
        chainId: 4200
    };

    const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log("交易收据: ", receipt.transactionHash,"to：",toAddress);
}

async function main() {
    console.log('start')

    const web3 = new Web3('https://rpc.merlinchain.io');
    const fromAddress = ""//  大号地址
    const privateKey = ''; //大号秘钥
    let wallets = fs.readFileSync('wallets.txt', 'utf-8').split('\r\n')

    const sleepBool = false//是否同步
    let nonce = await web3.eth.getTransactionCount(fromAddress);

    for (const wallet of wallets) {
        if (!sleepBool) {
            if (wallet) {
                callContractFunction(web3, privateKey, wallet, nonce).catch(console.error);
                nonce++
            }

        } else {
            if (wallet) {
                let nonce = await web3.eth.getTransactionCount(wallet);
                await callContractFunction(web3, privateKey, wallet, nonce).catch(console.error);
            }
        }
    }
}


main().catch()

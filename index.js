console.log("Hiiii Console Module");

import { ethers } from "./ethers-5.7.esm.min.js";
import { abi, contractAddress } from "./constants.js";

const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
const balanceButton = document.getElementById("balanceButton");
const withdrawButton = document.getElementById("withdrawButton");
connectButton.onclick = connect;
fundButton.onclick = fund;
balanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;

async function connect() {
  if (typeof window.ethereum !== "undefined") {
    // i.e if it can detect metamask or any eth wallet
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      connectButton.innerHTML = "Connected to Metamask";
      console.log("Connected to Metamask");

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log(accounts);
    } catch (error) {
      console.log(error);
    }
  } else {
    document.getElementById("connectButton").innerHTML =
      "Please Install Metamask";
  }
}

async function fund() {
  const ethAmount = document.getElementById("ethAmount").value;
  console.log(
    `Process to begin funding with ${ethAmount} ETH is starting. . .`
  );
  if (typeof window.ethereum !== "undefined") {
    // connect to the blockchain
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // get the current connected wallet
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      });
      // listen to check if the transaction has been mined
      await listenForTransactionMine(transactionResponse, provider);
      console.log(`${ethAmount} ETH sucessfully sent`);
    } catch (error) {
      console.log(error);
    }
  }
}

async function getBalance() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(contractAddress);
    console.log(`Current balance is: ${ethers.utils.formatEther(balance)} ETH`);
  } else {
    document.getElementById("connectButton").innerHTML =
      "Please Install Metamask";
  }
}

async function withdraw() {
  if (typeof window.ethereum !== "undefined") {
    // connect to the blockchain
    console.log("withdrawing Eth. . . ");

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // get the current connected wallet
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    const balance = await provider.getBalance(contractAddress);
    try {
      const transactionResponse = await contract.withdraw();
      // listen to check if the transaction has been mined
      await listenForTransactionMine(transactionResponse, provider);
      console.log(
        `${ethers.utils.formatEther(balance)} ETH withdrawn successfully`
      );
    } catch (error) {
      console.log(error);
    }
  }
}

function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}. . . `);
  // listen for this transaction to be finished
  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, (transactionReciept) => {
      console.log(
        `Completed with ${transactionReciept.confirmations} confirmations`
      );
      resolve();
    });
  });
}

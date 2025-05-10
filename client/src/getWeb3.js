import Web3 from "web3";

const getWeb3 = () =>
  new Promise((resolve, reject) => {
    window.addEventListener("load", async () => {
      // Modern dapp browsers
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
          await window.ethereum.request({ method: "eth_requestAccounts" });
          resolve(web3);
        } catch (error) {
          reject(error);
        }
      }
      // Legacy dapp browsers
      else if (window.web3) {
        resolve(window.web3);
      }
      // Fallback
      else {
        reject("No Ethereum browser extension detected.");
      }
    });
  });

export default getWeb3;

import { BrowserProvider, JsonRpcProvider, Wallet } from "ethers";

const LOCAL_RPC_URL = "http://127.0.0.1:8545";

export async function connectWallet() {
  if (typeof window !== "undefined" && window.ethereum) {
    const provider = new BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    return {
      provider,
      signer,
      address: accounts[0],
      isMetaMask: true,
    };
  }

  throw new Error("MetaMask is not detected. You can select one of the Demo Profiles below to test directly!");
}

export async function connectDemoProfile(profile) {
  const provider = new JsonRpcProvider(LOCAL_RPC_URL);
  const signer = new Wallet(profile.privateKey, provider);
  return {
    provider,
    signer,
    address: profile.address,
    profile,
    isMetaMask: false,
  };
}
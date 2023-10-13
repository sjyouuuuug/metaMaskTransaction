import React, { useState } from 'react';
import './App.css';
import { JsonRpcSigner, ethers, parseEther } from 'ethers';
import { FeeData } from 'ethers';

function App() {
    const [input1, setInput1] = useState('');
    const [input2, setInput2] = useState('');
    const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
    const [walletAddress, setWalletAddress] = useState("");
    const [feedata, setFeedata] = useState<Pick<FeeData, 'maxFeePerGas' | 'maxPriorityFeePerGas'>>({
        maxFeePerGas: null,
        maxPriorityFeePerGas: null
    });


    async function requestAccounts() {
        if (window.ethereum) {
            console.log('detected');
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                console.log('successfully connected', accounts);
                setWalletAddress(accounts[0]);
            }
            catch (error) {
                console.log('error processing');
            }
        } else {
            console.log('metamask not detected');
        }
    }

    async function ConnectMetamask() {
        console.log(ethers.version);
        console.log(`Button 1 clicked with value: ${input1}`);
        if (typeof window.ethereum !== 'undefined') {
            await requestAccounts();
        }
        const provider = new ethers.BrowserProvider(window.ethereum);


        const chainId = (await provider.getNetwork()).chainId;
        if (Number(chainId) !== 5) {
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0x5' }],
                });
            } catch (switchError) {
                console.error(switchError);
            }
        }

        const connectedSigner = await provider.getSigner();
        const currentFeeData = await provider.getFeeData();

        setFeedata(currentFeeData)
        setSigner(connectedSigner)

    };

    async function TransferButton() {
        console.log(`Button 2 clicked with value: ${input2}`);
        let provider;
        let signer = null;
        if (window.ethereum == null) {
            console.log('metamask not detected');
        }
        else {
            provider = new ethers.BrowserProvider(window.ethereum);
            signer = await provider.getSigner();
            if (!signer) {
                return alert('please connect to metamask ');
            }
        }
        const receiver = input2;
        try {
            const transaction = {
                to: receiver.valueOf(),
                value: ethers.parseEther(input1),
                ...feedata,
                gasPrice: null,
            }
            console.log('Transaction created: ' + transaction);
            const tx = await signer?.sendTransaction(transaction);
            const receipt = await tx?.wait();
            if (receipt?.status === 1) {
                console.log(receipt + " transaction successfully");
            }
            else {
                console.log(" transaction failed");
            }

        }
        catch (err) {
            console.log('failed to create transaction');
        };
    };

    return (
        <div className="App">
            <button onClick={ConnectMetamask}>Connect MetaMask</button>
            <div>
                <input
                    type="number"
                    value={input1}
                    onChange={(e) => setInput1(e.target.value)}
                    placeholder="Enter Value in ETH"
                />
            </div>
            <div>
                <input
                    type="text"
                    value={input2}
                    onChange={(e) => setInput2(e.target.value)}
                    placeholder="Enter Receiver Address"
                />
            </div>{' '}
            <button onClick={TransferButton}>Tranasfer</button>
        </div>
    );
}

export default App;

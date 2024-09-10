'use client';

import Image from "next/image";
import { ConnectButton, MediaRenderer, TransactionButton, useActiveAccount, useReadContract } from "thirdweb/react";
import thirdwebIcon from "@public/thirdweb.svg";
import { client } from "./client";
import { defineChain, getContract, toEther } from "thirdweb";
import { ethereum } from "thirdweb/chains";
import { getContractMetadata } from "thirdweb/extensions/common";
import { claimTo, getActiveClaimCondition, getTotalClaimedSupply, nextTokenIdToMint } from "thirdweb/extensions/erc721";
import { useState } from "react";

export default function Home() {
  const account = useActiveAccount();

  // Replace the chain with the chain you want to connect to
  const chain = defineChain( ethereum );

  const [quantity, setQuantity] = useState(1);

  // Replace the address with the address of the deployed contract
  const contract = getContract({
    client: client,
    chain: chain,
    address: "0xC273D212869B8C89b764220296A74E13dDb40470"
  });

  const { data: contractMetadata, isLoading: isContractMetadataLaoding } = useReadContract( getContractMetadata,
    { contract: contract }
  );

  const { data: claimedSupply, isLoading: isClaimedSupplyLoading } = useReadContract( getTotalClaimedSupply,
    { contract: contract}
  );

  const { data: totalNFTSupply, isLoading: isTotalSupplyLoading } = useReadContract( nextTokenIdToMint,
    { contract: contract }
  );

  const { data: claimCondition } = useReadContract( getActiveClaimCondition,
    { contract: contract }
  );

  const getPrice = (quantity: number) => {
    const total = quantity * parseInt(claimCondition?.pricePerToken.toString() || "0");
    return toEther(BigInt(total));
  }

  return (
    <>
      <main
        className="p-4 pb-10 min-h-[100vh] flex items-center justify-center container max-w-screen-lg mx-auto"
        style={{
          backgroundImage: "url('/background.png')",
          backgroundSize: "60%",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed"
        }}
      >
        <div className="py-20 text-center bg-opacity-50 bg-black rounded-lg">
        <div className="py-20 text-center">
        <Header />
        <ConnectButton
          client={client}
          chain={chain}
        />
        <div className="flex flex-col items-center mt-4">
          {isContractMetadataLaoding ? (
            <p>Loading...</p>
          ) : (
            <>
              <MediaRenderer
                client={client}
                src={contractMetadata?.image}
                className="rounded-xl"
              />
              <h2 className="text-2xl font-semibold mt-4">
                {contractMetadata?.name}
              </h2>
              <p className="text-lg mt-2">
                {contractMetadata?.description}
              </p>
            </>
          )}
          {isClaimedSupplyLoading || isTotalSupplyLoading ? (
            <p>Loading...</p>
          ) : (
            <p className="text-lg mt-2 font-bold">
              Total NFT Supply: {claimedSupply?.toString()}/{totalNFTSupply?.toString()}
            </p>
          )}
          <div className="flex flex-row items-center justify-center my-4">
            <button
              className="bg-black text-white px-4 py-2 rounded-md mr-4"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >-</button>
            <input 
              type="number" 
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="w-10 text-center border border-gray-300 rounded-md bg-black text-white"
            />
            <button
              className="bg-black text-white px-4 py-2 rounded-md mr-4"
              onClick={() => setQuantity(quantity + 1)}
            >+</button>
          </div>
          <TransactionButton
  transaction={async () => {
    const address = account?.address;

    // Check if address is valid and follows the Ethereum address format
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      throw new Error("Invalid or missing Ethereum address");
    }

    return claimTo({
      contract: contract,
      to: address,  // Now it's guaranteed to be a valid Ethereum address
      quantity: BigInt(quantity),
    });
  }}
  onTransactionConfirmed={async () => {
    alert("NFT Claimed!");
    setQuantity(1);
  }}
>
  {`Claim NFT (${getPrice(quantity)} ETH)`}
</TransactionButton>


            <a href="https://www.hairoftrump.com" className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md">Home</a>
          </div>
          </div>
        </div>
      </main>
      <footer className="bg-black text-white text-center py-4">
        <div className="flex justify-center space-x-6">
          <a href="https://x.com/hair_oftrump?s=21" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 4.557a9.9 9.9 0 01-2.828.775A4.932 4.932 0 0023.337 3.1a9.868 9.868 0 01-3.127 1.195 4.922 4.922 0 00-8.384 4.482A13.978 13.978 0 011.671 3.149a4.916 4.916 0 001.524 6.57 4.903 4.903 0 01-2.23-.616v.062a4.924 4.924 0 003.95 4.827 4.932 4.932 0 01-2.224.085 4.928 4.928 0 004.604 3.417 9.867 9.867 0 01-6.102 2.104c-.396 0-.788-.023-1.177-.069a13.94 13.94 0 007.548 2.213c9.142 0 14.307-7.72 14.307-14.421 0-.22-.005-.438-.014-.653A10.243 10.243 0 0024 4.557z" />
            </svg>
          </a>
          <a href="https://t.me/hairoftrump" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.545 7.273l-1.636 7.727c-.122.567-.446.703-.904.436l-2.491-1.822-1.2.992c-.133.1-.244.182-.504.182l.18-2.55 4.633-4.189c.2-.18-.044-.283-.308-.103L8.73 13.1l-2.476-.773c-.538-.168-.55-.538.11-.79l9.718-3.75c.444-.164.832.108.664.686z" />
            </svg>
          </a>
        </div>
      </footer>
    </>
  );
}

function Header() {
  return (
    <header className="flex flex-col items-center justify-center w-full p-4">
      <div className="py-20 text-center">
        <h1 className="text-xl md:text-4xl font-semibold md:font-bold text-center text-zinc-100">
          GOLDEN STRANDS OF POWER
        </h1>
      </div>
      <div className="rounded-full border-2 border-gray-400 p-1">
        <Image
          src="/Logo.png" // Ensure that 'Logo.png' is in your 'public' directory
          alt="Logo"
          width={50}
          height={50}
          className="rounded-full"
        />
      </div>
    </header>
  );
}

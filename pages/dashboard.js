import { ethers } from "ethers";
import { useEffect, useState } from "react";
import axios from "axios";
import Web3Modal from "web3modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

import { nftmarketaddress, nftaddress } from "../config";

import Market from "../artifacts/contracts/Market.sol/NFTMarket.json";
import NFT from "../artifacts/contracts/NFT.sol/NFT.json";

export default function CreatorDashboard() {
  const [nfts, setNfts] = useState([]);
  const [sold, setSold] = useState([]);
  const [openListingModal, setOpenListingModal] = useState(false);
  const [loadingState, setLoadingState] = useState("not-loaded");

  useEffect(() => {
    loadNFTs();
  }, []);

  async function loadNFTs() {
    setLoadingState("loading");
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    const signer = provider.getSigner();

    const marketContract = new ethers.Contract(
      nftmarketaddress,
      Market.abi,
      signer
    );
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider);
    const data = await marketContract.fetchCreatedItems();

    const items = await Promise.all(
      data.map(async (i) => {
        const tokenUri = await tokenContract.tokenURI(i.tokenId);
        const meta = await axios.get(tokenUri);
        let price = ethers.utils.formatUnits(i.price.toString(), "ether");
        let item = {
          tokenId: i.tokenId.toNumber(),
          createdAt: i.createdAt,
          startedAt: i.startedAt,
          endedAt: i.endedAt,
          creator: i.creator,
          seller: i.seller,
          owner: i.owner,
          price,
          sold: i.sold,
          image: meta.data.image,
        };
        return item;
      })
    );

    /* create a filtered array of items that have been sold */
    const soldItems = items.filter((i) => i.sold);
    setSold(soldItems);
    setNfts(items);
    setLoadingState("loaded");
  }

  function setListing(tokenId) {
    return function () {
      setOpenListingModal(true);
    };
  }

  async function listItem(tokenId, startedAt, endedAt, price, royalty) {
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    const signer = provider.getSigner();

    price = ethers.utils.parseUnits(price, "ether");

    contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);
    let listingPrice = await contract.getListingPrice();
    listingPrice = listingPrice.toString();

    transaction = await contract.createMarketItem(
      nftaddress,
      tokenId,
      startedAt,
      endedAt,
      price,
      royalty,
      {
        value: listingPrice,
      }
    );
    await transaction.wait();
  }

  if (loadingState === "loading")
    return (
      <div className="flex justify-center items-center mt-56">
        <FontAwesomeIcon icon={faSpinner} pulse size="4x" color="#bc7bdc" />
      </div>
    );

  if (loadingState === "loaded" && !nfts.length)
    return (
      <h1 className="py-10 px-20 text-3xl text-gray-300">No assets created</h1>
    );

  if (openListingModal) {
    return (
      <div
        className="flex justify-center items-center"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
      >
        <div className="w-96 p-8 bg-white rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="p-4">
        <h2 className="text-2xl py-2 text-gray-600">Items Created</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {nfts.map((nft, i) => (
            <div
              key={i}
              className="border shadow rounded-xl overflow-hidden asset-card"
            >
              <img src={nft.image} className="h-56 object-cover w-full" />
              <div className="p-4 bg-black">
                <p className="text-2xl font-bold text-white">
                  Price - {nft.price} MATIC
                </p>
                <button
                  className="w-full text-white font-bold py-2 px-12 mt-4 rounded buy-button"
                  onClick={setListing(nft.tokenId)}
                >
                  List
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="px-4">
        {Boolean(sold.length) && (
          <div>
            <h2 className="text-2xl py-2 text-gray-600">Items sold</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
              {sold.map((nft, i) => (
                <div
                  key={i}
                  className="border shadow rounded-xl overflow-hidden asset-card"
                >
                  <img src={nft.image} className="h-56 object-cover w-full" />
                  <div className="p-4 bg-black">
                    <p className="text-2xl font-bold text-white">
                      Price - {nft.price} MATIC
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

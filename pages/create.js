import React, { useState, useRef } from "react";
import { ethers } from "ethers";
import { create as ipfsHttpClient } from "ipfs-http-client";
import { useRouter } from "next/router";
import Web3Modal from "web3modal";
import { useDropzone } from "react-dropzone";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileUpload, faSpinner } from "@fortawesome/free-solid-svg-icons";

const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

import { nftaddress, nftmarketaddress, coinaddress } from "../config";

import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import Market from "../artifacts/contracts/Market.sol/NFTMarket.json";

export default function CreateItem() {
  const [fileUrl, setFileUrl] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [loadingState, setLoadingState] = useState("not-loaded");
  const [formInput, updateFormInput] = useState({
    price: "",
    name: "",
    description: "",
  });
  const router = useRouter();
  const { _, getRootProps, getInputProps } = useDropzone();

  function fileTypeHandler() {
    return {
      apng: <img className="rounded m-auto preview" src={fileUrl} />,
      avif: <img className="rounded m-auto preview" src={fileUrl} />,
      gif: <img className="rounded m-auto preview" src={fileUrl} />,
      jpeg: <img className="rounded m-auto preview" src={fileUrl} />,
      mp3: (
        <audio controls className="rounded m-auto preview" src={fileUrl}>
          Your browser does not support the
          <code>audio</code> element.
        </audio>
      ),
      mp4: (
        <video controls className="rounded m-auto preview" src={fileUrl}>
          Sorry, your browser doesn't support embedded videos.
        </video>
      ),
      ogg: (
        <video controls className="rounded m-auto preview" src={fileUrl}>
          Sorry, your browser doesn't support embedded videos.
        </video>
      ),
      png: <img className="rounded m-auto preview" src={fileUrl} />,
      "svg+xml": <img className="rounded m-auto preview" src={fileUrl} />,
      wav: (
        <audio controls className="rounded m-auto preview" src={fileUrl}>
          Your browser does not support the
          <code>audio</code> element.
        </audio>
      ),
      webp: <img className="rounded m-auto preview" src={fileUrl} />,
      webm: (
        <video controls className="rounded m-auto preview" src={fileUrl}>
          Sorry, your browser doesn't support embedded videos.
        </video>
      ),
    }[fileType];
  }

  async function onChange(e) {
    const file = e.target.files[0];
    const mime = file.type;
    setFileType(mime.split("/")[1]);
    setLoadingState("loading");
    try {
      const added = await client.add(file, {
        progress: (prog) => console.log(`received: ${prog}`),
      });
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      setFileUrl(url);
      setLoadingState("loaded");
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  }

  async function createMarket() {
    const { name, description, price } = formInput;
    if (!name || !description || !price || !fileUrl) return;
    /* first, upload to IPFS */
    const data = JSON.stringify({
      name,
      description,
      image: fileUrl,
    });
    try {
      const added = await client.add(data);
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      /* after file is uploaded to IPFS, pass the URL to save it on Polygon */
      createSale(url);
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  }

  async function createSale(url) {
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    const signer = provider.getSigner();

    /* next, create the item */
    let contract = new ethers.Contract(nftaddress, NFT.abi, signer);
    let transaction = await contract.mint(url, coinaddress, 0);
    // let tx = await transaction.wait();
    // let tokenId = parseInt(tx.logs[0].topics[3]);

    // const price = ethers.utils.parseUnits(formInput.price, "ether");

    /* then list the item for sale on the marketplace */
    // contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);
    // let listingPrice = await contract.getListingPrice();
    // listingPrice = listingPrice.toString();

    // transaction = await contract.createMarketItem(nftaddress, tokenId, price, {
    //   value: listingPrice,
    // });
    await transaction.wait();
    router.push("/dashboard");
  }

  return (
    <div className="flex sm:flex-wrap md:flex-wrap justify-center">
      <div className="sm:w-full md:w-full lg:w-1/2 flex flex-col p-12">
        {fileUrl ? (
          fileTypeHandler()
        ) : (
          <div
            className="dropzone rounded px-12 py-24 mt-8"
            style={{
              border: "1px solid lightgray",
              color: "lightgray",
            }}
          >
            {loadingState === "loading" ? (
              <div className="flex justify-center items-center">
                <FontAwesomeIcon icon={faSpinner} pulse size="4x" />
              </div>
            ) : (
              <p>Upload file to preview</p>
            )}
          </div>
        )}
        <div
          {...getRootProps({
            className: "dropzone rounded p-12 mt-4",
            style: {
              border: "2px solid lightgray",
              borderStyle: "dashed",
              color: "lightgray",
            },
          })}
        >
          <input
            {...getInputProps({
              onChange: onChange,
              // style: { display: "none" },
              className: "my-4",
              name: "Asset",
              type: "file",
            })}
          />
          <p className="text-xs mb-12">
            PNG, JPEG, GIF, WEBP, MP4 or MP3. Max 100mb.
          </p>
          <div className="flex justify-center items-center">
            <FontAwesomeIcon icon={faFileUpload} size="6x" />
          </div>
        </div>
      </div>
      <div className="sm:w-full md:w-full lg:w-1/2 flex flex-col p-12">
        <input
          placeholder="Asset Name"
          className="mt-8 border rounded p-4"
          onChange={(e) =>
            updateFormInput({ ...formInput, name: e.target.value })
          }
        />
        <textarea
          placeholder="Asset Description"
          className="mt-4 border rounded p-4"
          onChange={(e) =>
            updateFormInput({ ...formInput, description: e.target.value })
          }
        />
        <input
          placeholder="Asset Price in Eth"
          className="my-4 border rounded p-4"
          onChange={(e) =>
            updateFormInput({ ...formInput, price: e.target.value })
          }
        />
        <button
          onClick={createMarket}
          className="font-bold mt-4 text-white rounded p-4 shadow bg-primary-ac"
        >
          Create
        </button>
      </div>
    </div>
  );
}

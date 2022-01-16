import "../styles/globals.css";
import Link from "next/link";
import { Logo } from "../components/layout";

function Marketplace({ Component, pageProps }) {
  return (
    <div>
      <nav className="border-b p-6 flex justify-between items-center">
        <Logo />
        <div className="flex mt-4 mr-4">
          <Link href="/">
            <a className="mr-4 hover-ac">Home</a>
          </Link>
          <Link href="/dashboard">
            <a className="mr-6 hover-ac">Dashboard</a>
          </Link>
          <Link href="/assets">
            <a className="mr-6 hover-ac">My NFTs</a>
          </Link>
          <Link href="/create">
            <a className="mr-6 hover-ac">Create</a>
          </Link>
        </div>
      </nav>
      <Component {...pageProps} />
    </div>
  );
}

export default Marketplace;

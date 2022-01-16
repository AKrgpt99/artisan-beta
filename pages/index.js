import { assets, accounts, rewards } from "../data";
import {
  Card,
  FeaturedCard,
  CreatorCard,
  RewardCard,
} from "../components/cards";
import {
  ViewMoreButton,
  PillButton,
  PillOutlineButton,
} from "../components/buttons";
import Banner from "../components/banner";
import { GridSection } from "../components/sections";

export default function Home() {
  let featuredArtist = accounts.find((a) => a.featured);
  let featuredAsset = assets.find((a) => a.creator === featuredArtist.address);

  let newReleases = assets.filter((a) => {
    // const createdAt = new Date(a.createdAt * 1000);
    // const yesterday = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
    // if (createdAt >= yesterday) return a;
    return a;
  });
  // newReleases.sort((a, b) => b.createdAt - a.createdAt);
  newReleases = newReleases.slice(0, 8);

  let topCreators = accounts;
  topCreators.sort((a, b) => b.followers.length - a.followers.length);
  topCreators = topCreators.slice(0, 3);

  let mostPopularNFTs = assets;
  mostPopularNFTs.sort((a, b) => b.likes.length - a.likes.length);
  mostPopularNFTs = mostPopularNFTs.slice(0, 5);

  let topRewards = rewards.filter((a) => a.status === "ACTIVE");
  topRewards.sort((a, b) => b.winners.length - a.winners.length);
  topRewards = topRewards.slice(0, 12);

  return (
    <div className="flex flex-col justify-center w-full m-0 p-0">
      <div className="flex justify-center w-full m-0 p-4">
        <Banner
          title="Uniting Artists and Liberating Creativity"
          subtitle="Artisan is Canada's first NFT marketplace where you can receive
            rewards for holding"
          ctaButtons={
            <>
              <PillButton backgroundColor={"var(--primary)"}>Find</PillButton>
              <PillOutlineButton borderColor={"var(--primary)"}>
                Create
              </PillOutlineButton>
            </>
          }
        >
          <FeaturedCard
            image={featuredAsset.image}
            itemId={featuredAsset.id}
            name={featuredAsset.name}
            username={featuredArtist.username}
            price={featuredAsset.price}
            likes={featuredAsset.likes.length}
          />
        </Banner>
      </div>
      <GridSection title="New Releases">
        {newReleases.map((asset) => (
          <Card
            image={asset.image}
            itemId={asset.id}
            name={asset.name}
            username={
              accounts.find((a) => a.address === asset.creator).username
            }
            price={asset.price}
            likes={asset.likes.length}
          />
        ))}
        <div className="columns-1 w-72 h-80 flex flex-col justify-center items-center rounded-lg bg-white text-left">
          <ViewMoreButton />
        </div>
      </GridSection>
      <GridSection title="Top Creators" smCols={1} mdCols={2} lgCols={2}>
        {topCreators.map((creator) => {
          return (
            <CreatorCard
              creator
              image={creator.image}
              username={creator.username}
              first={creator.first}
              last={creator.last}
              followers={creator.followers.length}
            />
          );
        })}
        <div className="columns-1 w-72 h-80 flex flex-col justify-center items-center rounded-lg bg-white text-left relative">
          <ViewMoreButton />
        </div>
      </GridSection>
      <GridSection title="Most Popular NFTs">
        {mostPopularNFTs.map((asset) => (
          <Card
            image={asset.image}
            itemId={asset.id}
            name={asset.name}
            username={
              accounts.find((a) => a.address === asset.creator).username
            }
            price={asset.price}
            likes={asset.likes.length}
          />
        ))}
        <div className="columns-1 w-72 h-80 flex flex-col justify-center items-center rounded-lg bg-white text-left relative">
          <ViewMoreButton />
        </div>
      </GridSection>
      <GridSection title="Top Rewards" lgCols={4}>
        {topRewards.map((reward) => {
          const creator = accounts.find((a) => a.address === reward.creator);

          return (
            <RewardCard
              image={creator.image}
              name={reward.name}
              items={reward.assets.length}
              winners={reward.winners.length}
              rewardType={reward.type}
            />
          );
        })}
      </GridSection>
      <div className="w-full flex justify-center align-center mt-6 mb-12">
        <PillOutlineButton borderColor={"var(--primary)"}>
          View more
        </PillOutlineButton>
      </div>
    </div>
  );
}

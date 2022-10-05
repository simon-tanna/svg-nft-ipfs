import { networkConfig } from "../helper-hardhat-config";
import { storeMonsters, storeMonsterMetadata } from "../utils/uploadToPinata";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import "dotenv/config";
import verify from "../utils/verify";

const FUND_AMOUNT = "1000000000000000000000";
// hardcoded monster URIs from those already uploaded
let monsterUris: any = [
  "ipfs://QmaEuT6nE6K31eNE2P2JzpcHqHyEjWN1UsHozCPrEBj6w5",
  "ipfs://QmNYMNUtjjVCSxdEQUuEEN3TuTArMZUeBDSSHRemiJ5rSV",
  "ipfs://QmfLcLky5ae1CAT7ToroWSxWbTSJaipM4Wr1RJw5m2vAkV",
  "ipfs://QmQDAkMAeSM2pjMrYfeDQ9oYM3Rtw7mMbbWBrK4SzGnb5T",
  "ipfs://QmbKTSMuXMN7BSYqfJm2cnfLAhvdDfB3pYP1Jq8hJrGdJ2",
];

const imagesPath = "./images";

const monsterMetaData = {
  name: "",
  description: "",
  image: "",
  attributes: [
    {
      trait_type: "Power",
      value: 100,
    },
  ],
};

const deploySvgNft: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { deployments, getNamedAccounts, network, ethers } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId!;
  let vrfCoordinatorV2Address, subscriptionId;

  // get IPFS hashes of images
  if (process.env.UPLOAD_TO_PINATA == "true") {
    monsterUris = await handleMonsterUris();
  }

  if (chainId == 31337) {
    const vrfCoordinatorV2Mock = await ethers.getContract(
      "VRFCoordinatorV2Mock"
    );
    vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address;
    const transactionResponse = await vrfCoordinatorV2Mock.createSubscription();
    const transactionReceipt = await transactionResponse.wait();
    subscriptionId = transactionReceipt.events[0].args.subId;
    // This is the mock function that funds the subscription
    await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT);
  } else {
    vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2;
    subscriptionId = networkConfig[chainId].subscriptionId;
  }
  // this commented out function uploads images to IPFS
  await storeMonsters(imagesPath);

//   const args = [
//     vrfCoordinatorV2Address,
//     subscriptionId,
//     networkConfig[chainId]["gasLane"],
//     networkConfig[chainId]["mintFee"],
//     networkConfig[chainId]["callbackGasLimit"],
//     monsterUris,
//   ];
//   await deploy("SvgNft", {
//     from: deployer,
//     args: args,
//     log: true,
//     waitConfirmations: 1,
//   });
};

async function handleMonsterUris() {
  monsterUris = [];

}

export default deploySvgNft;
deploySvgNft.tags = ["all", "randomsvg", "main"];

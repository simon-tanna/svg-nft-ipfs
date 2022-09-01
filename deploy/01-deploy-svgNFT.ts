import {
	developmentChains,
	VERIFICATION_BLOCK_CONFIRMATIONS,
	networkConfig,
} from "../helper-hardhat-config";
import verify from "../utils/verify";
import storeMonsters from "../utils/uploadToPinata";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import "dotenv/config";

const FUND_AMOUNT = "1000000000000000000000";

let monsterUris: any[];

const imagesPath = "./images";

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
		await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT);
	} else {
		vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2;
		subscriptionId = networkConfig[chainId].subscriptionId;
	}

	log("------------------------------");
	await storeMonsters(imagesPath);
	// const args = [
	// 	vrfCoordinatorV2Address,
	// 	subscriptionId,
	// 	networkConfig[chainId].gasLane,
	// 	networkConfig[chainId].mintFee,
	// 	networkConfig[chainId].callbackGasLimit,
	// 	// monterTokenUris
	// 	networkConfig[chainId].mintFee,
	// ];
};

async function handleMonsterUris() {
	monsterUris = [];

	return monsterUris;
}

export default deploySvgNft;
deploySvgNft.tags = ["all", "randomsvg", "main"];

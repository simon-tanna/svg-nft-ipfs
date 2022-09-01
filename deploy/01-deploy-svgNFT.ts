import {
	developmentChains,
	VERIFICATION_BLOCK_CONFIRMATIONS,
	networkConfig,
} from "../helper-hardhat-config";
import verify from "../utils/verify";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const FUND_AMOUNT = "1000000000000000000000";

const deploySvgNft: DeployFunction = async function (
	hre: HardhatRuntimeEnvironment
) {
	const { deployments, getNamedAccounts, network, ethers } = hre;
	const { deploy, log } = deployments;
	const { deployer } = await getNamedAccounts();
	const chainId = network.config.chainId!;
	let vrfCoordinatorV2Address, subscriptionId;

	if (chainId == 31337) {
		const vrfCoordinatorV2Mock = await ethers.getContract(
			"VRFCoordinatorV2Mock"
		);
		vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address;
		const transactionResponse = await vrfCoordinatorV2Mock.createSubscription();
		const transactionReceipt = await transactionResponse.wait();
		subscriptionId = transactionReceipt.events[0].args.subId;
		await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT);
	}
};

export default deploySvgNft;

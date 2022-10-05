export interface networkConfigItem {
	name?: string;
	subscriptionId?: string;
	keepersUpdateInterval?: string;
	raffleEntranceFee?: string;
	callbackGasLimit?: string;
	vrfCoordinatorV2?: string;
	gasLane?: string;
	ethUsdPriceFeed?: string;
	mintFee?: string;
}

const CHAINLINK_SUBSCRIPTION_ID = process.env.CHAINLINK_SUBSCRIPTION_ID;

export interface networkConfigInfo {
	[key: number]: networkConfigItem;
}

export const networkConfig: networkConfigInfo = {
	31337: {
		name: "localhost",
		ethUsdPriceFeed: "0x9326BFA02ADD2366b30bacB125260Af641031331",
		gasLane:
			"0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc", // 30 gwei
		mintFee: "1000", // 0.01 ETH
		callbackGasLimit: "500000", // 500,000 gas
	},
	// 80001: {
	// 	name: "matic",
	// 	vrfCoordinatorV2: "0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed",
	// 	gasLane:
	// 		"0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f",
	// 	callbackGasLimit: "500000",
	// 	mintFee: "10000000000000000",
	// 	subscriptionId: CHAINLINK_SUBSCRIPTION_ID,
	// },
	// Price Feed Address, values can be obtained at https://docs.chain.link/docs/reference-contracts
	// Default one is ETH/USD contract on Kovan
	// },
};

export const DECIMALS = "18";
export const INITIAL_PRICE = "200000000000000000000";
export const developmentChains = ["hardhat", "localhost"];
export const VERIFICATION_BLOCK_CONFIRMATIONS = 6;

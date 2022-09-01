import pinataSDK from "@pinata/sdk";
import path from "path";
import fs from "fs";
import "dotenv/config";

const pinataApiKey = process.env.PINATA_API_KEY || "";
const pinataApiSecret = process.env.PINATA_API_SECRET || "";
const pinata = pinataSDK(pinataApiKey, pinataApiSecret);

async function storeMonsters(imagesFilePath: string) {
	const fullMonsterImagesPath = path.resolve(imagesFilePath);
	const files = fs.readdirSync(fullMonsterImagesPath);
	let responses = [];
	console.log("Uploading to IPFS");
	for (const fileIndex in files) {
		const readableStreamForFile = fs.createReadStream(
			`${fullMonsterImagesPath}/${files[fileIndex]}`
		);
		try {
			const response = await pinata.pinFileToIPFS(readableStreamForFile);
			responses.push(response);
			console.log(response.IpfsHash);
			console.log(response);
		} catch (error) {
			console.log(error);
		}
	}

	return { responses, files };
}

export default storeMonsters;

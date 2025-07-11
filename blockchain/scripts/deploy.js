const fs = require("fs");
const path = require("path");

async function main() {
  const DocumentRegistryFactory = await ethers.getContractFactory("DocumentRegistry");
  const documentRegistry = await DocumentRegistryFactory.deploy();

  console.log("DocumentRegistry deployed to:", documentRegistry.target);

  // ✅ Correct path to your frontend constants file
  const filePath = path.join(__dirname, "../../etherdocs-frontend/src/constants/contractAddress.js");

  fs.writeFileSync(
    filePath,
    `export const CONTRACT_ADDRESS = "${documentRegistry.target}";\n`
  );
  console.log(`✅ Contract address written to ${filePath}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

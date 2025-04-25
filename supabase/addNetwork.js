import fs from "fs";
import yaml from "yaml";

async function addNetwork(path) {
  console.log(`Adding network to ${path}`);

  const file = await fs.promises.readFile(path, "utf8");
  const document = yaml.parseDocument(file);

  document.get("services").items.forEach((item) => {
    const networksNode = document.createNode(["easypanel"]);
    item.value.set("networks", networksNode);
  });

  await fs.promises.writeFile(path, document.toString());
}

await addNetwork("./code/docker-compose.yml");

// export default {
//   addNetwork,
// };

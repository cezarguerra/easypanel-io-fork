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

async function removeDependsOnDb(path) {
  console.log(`Removing db dependency from ${path}`);

  const file = await fs.promises.readFile(path, "utf8");
  const document = yaml.parseDocument(file);

  document.get("services").items.forEach((item) => {
    const dependsOn = item.value.get("depends_on");
    if (dependsOn) {
      // Create a new depends_on object without the db entry
      const newDependsOn = {};
      for (const [key, value] of Object.entries(dependsOn.toJSON())) {
        if (key !== "db") {
          newDependsOn[key] = value;
        }
      }

      if (Object.keys(newDependsOn).length === 0) {
        item.value.delete("depends_on");
      } else {
        item.value.set("depends_on", document.createNode(newDependsOn));
      }
    }
  });

  await fs.promises.writeFile(path, document.toString());
}

async function removeDbService(path) {
  console.log(`Removing db service from ${path}`);

  const file = await fs.promises.readFile(path, "utf8");
  const document = yaml.parseDocument(file);

  const services = document.get("services");
  if (services) {
    const dbIndex = services.items.findIndex((item) => item.key.value === "db");
    if (dbIndex !== -1) {
      services.items.splice(dbIndex, 1);
    }
  }

  await fs.promises.writeFile(path, document.toString());
}

await addNetwork("./code/docker-compose.yml");
await removeDependsOnDb("./code/docker-compose.yml");
await removeDbService("./code/docker-compose.yml");
// export default {
//   addNetwork,
// };

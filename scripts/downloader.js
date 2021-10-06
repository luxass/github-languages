import { get } from "axios";
import { load } from "js-yaml";
import { writeFileSync } from "fs";

(async () => {
    const response = await get("https://raw.githubusercontent.com/github/linguist/master/lib/linguist/languages.yml");
    const loadedYaml = load(response.data);
    writeFileSync(
        "./src/languages.json",
        JSON.stringify(loadedYaml, null, 2)
    );
})();




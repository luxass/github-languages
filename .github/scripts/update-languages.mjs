import fs from "node:fs";

export async function generateOldLanguages({ github, context }) {
  try {
    const languages = JSON.parse(fs.readFileSync("languages-old.json", "utf8"));

    fs.writeFileSync("languages-old.json", JSON.stringify(languages, null, 2));
  } catch (err) {
    console.log("languages-old.json not found");
  }
}

export async function generateDiff({ github, context, core }) {
  const oldLanguages = JSON.parse(fs.readFileSync("languages-old.json", "utf8"));
  const newLanguages = JSON.parse(fs.readFileSync("languages.json", "utf8"));

  console.log("OLD LANGUAGES LENGTH", Object.keys(oldLanguages).length);
  console.log("NEW LANGUAGES LENGTH", Object.keys(newLanguages).length);

  const removedLanguages = {};
  const addedLanguages = {};
  for (const language of Object.keys(newLanguages)) {
    if (oldLanguages[language] == null) {
      addedLanguages[language] = newLanguages[language];
    }
  }

  for (const language of Object.keys(oldLanguages)) {
    if (newLanguages[language] == null) {
      removedLanguages[language] = oldLanguages[language];
    }
  }

  let newLanguagesMarkdown = "";
  let removedLanguagesMarkdown = "";

  if (Object.keys(addedLanguages).length > 0) {
    newLanguagesMarkdown += "<details>\n";
    newLanguagesMarkdown += "  <summary>New Languages</summary><br/>\n\n";
    for (const language of Object.keys(addedLanguages)) {
      newLanguagesMarkdown += `#### ${language}\n\n`;
      newLanguagesMarkdown += "```json\n";
      newLanguagesMarkdown += JSON.stringify(addedLanguages[language], null, 2);
      newLanguagesMarkdown += "\n```\n\n";
    }

    newLanguagesMarkdown += "<br/></details>\n";
  }

  if (Object.keys(removedLanguages).length > 0) {
    removedLanguagesMarkdown += "<details>\n";
    removedLanguagesMarkdown += "  <summary>Removed Languages</summary><br/>\n\n";
    for (const language of Object.keys(removedLanguages)) {
      removedLanguagesMarkdown += `#### ${language}\n\n`;
      removedLanguagesMarkdown += "```json\n";
      removedLanguagesMarkdown += JSON.stringify(removedLanguages[language], null, 2);
      removedLanguagesMarkdown += "\n```\n\n";
    }

    removedLanguagesMarkdown += "<br/></details>\n";
  }

  // we can't just return the markdown, because it will be passed
  // through the String constructor, making the entire content as stringified string.
  core.setOutput("result-new-languages", newLanguagesMarkdown);
  core.setOutput("result-removed-languages", removedLanguagesMarkdown);
}

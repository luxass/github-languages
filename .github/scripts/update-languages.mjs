import fs from "node:fs";

export async function generateOldLanguages({ core }) {
  try {
    const languages = JSON.parse(fs.readFileSync("languages.json", "utf8"));
    fs.writeFileSync("languages-old.json", JSON.stringify(languages, null, 2));
  } catch (err) {
    core.error(`Failed to snapshot languages.json: ${err.message}`);
  }
}

export async function generateDiff({ core }) {
  const oldLanguages = JSON.parse(fs.readFileSync("languages-old.json", "utf8"));
  const newLanguages = JSON.parse(fs.readFileSync("languages.json", "utf8"));

  core.info(`Old language count: ${Object.keys(oldLanguages).length}`);
  core.info(`New language count: ${Object.keys(newLanguages).length}`);

  const added = diffAdded(oldLanguages, newLanguages);
  const removed = diffRemoved(oldLanguages, newLanguages);
  const modified = diffModified(oldLanguages, newLanguages);

  const hasDiff = added.size > 0 || removed.size > 0 || modified.size > 0;

  if (hasDiff) {
    fs.writeFileSync("languages.diff", buildPlainDiff(added, removed, modified));
  }

  core.setOutput("DIFF", hasDiff ? "true" : "");
  core.setOutput("result-new-languages", buildAddedMarkdown(added, newLanguages));
  core.setOutput("result-removed-languages", buildRemovedMarkdown(removed, oldLanguages));
  core.setOutput("result-modified-languages", buildModifiedMarkdown(modified));
}

function diffAdded(oldLanguages, newLanguages) {
  const added = new Set();
  for (const name of Object.keys(newLanguages)) {
    if (oldLanguages[name] == null) added.add(name);
  }
  return added;
}

function diffRemoved(oldLanguages, newLanguages) {
  const removed = new Set();
  for (const name of Object.keys(oldLanguages)) {
    if (newLanguages[name] == null) removed.add(name);
  }
  return removed;
}

function diffModified(oldLanguages, newLanguages) {
  const modified = new Map();
  for (const name of Object.keys(oldLanguages)) {
    if (newLanguages[name] == null) continue;
    if (JSON.stringify(oldLanguages[name]) === JSON.stringify(newLanguages[name])) continue;

    const oldEntry = oldLanguages[name];
    const newEntry = newLanguages[name];
    const allKeys = new Set([...Object.keys(oldEntry), ...Object.keys(newEntry)]);
    const changes = {};

    for (const key of allKeys) {
      if (JSON.stringify(oldEntry[key]) !== JSON.stringify(newEntry[key])) {
        changes[key] = { old: oldEntry[key], new: newEntry[key] };
      }
    }

    modified.set(name, changes);
  }
  return modified;
}

function buildPlainDiff(added, removed, modified) {
  const lines = [];

  if (added.size > 0) {
    lines.push(`Added languages (${added.size}):`);
    for (const name of added) lines.push(`- ${name}`);
  }

  if (removed.size > 0) {
    if (lines.length > 0) lines.push("");
    lines.push(`Removed languages (${removed.size}):`);
    for (const name of removed) lines.push(`- ${name}`);
  }

  if (modified.size > 0) {
    if (lines.length > 0) lines.push("");
    lines.push(`Modified languages (${modified.size}):`);
    for (const [name, changes] of modified) {
      lines.push(`- ${name}: ${Object.keys(changes).join(", ")}`);
    }
  }

  return lines.join("\n") + "\n";
}

function buildAddedMarkdown(added, newLanguages) {
  if (added.size === 0) return "";

  const lines = ["<details>", `  <summary>New Languages (${added.size})</summary><br/>`, ""];

  for (const name of added) {
    lines.push(
      `#### ${name}`,
      "",
      "```json",
      JSON.stringify(newLanguages[name], null, 2),
      "```",
      "",
    );
  }

  lines.push("<br/></details>");
  return lines.join("\n");
}

function buildRemovedMarkdown(removed, oldLanguages) {
  if (removed.size === 0) return "";

  const lines = ["<details>", `  <summary>Removed Languages (${removed.size})</summary><br/>`, ""];

  for (const name of removed) {
    lines.push(
      `#### ${name}`,
      "",
      "```json",
      JSON.stringify(oldLanguages[name], null, 2),
      "```",
      "",
    );
  }

  lines.push("<br/></details>");
  return lines.join("\n");
}

function buildModifiedMarkdown(modified) {
  if (modified.size === 0) return "";

  const lines = [
    "<details>",
    `  <summary>Modified Languages (${modified.size})</summary><br/>`,
    "",
  ];

  for (const [name, changes] of modified) {
    lines.push(`#### ${name}`, "", "| Property | Old | New |", "| --- | --- | --- |");
    for (const [prop, { old: oldVal, new: newVal }] of Object.entries(changes)) {
      const oldStr = oldVal === undefined ? "_(removed)_" : `\`${JSON.stringify(oldVal)}\``;
      const newStr = newVal === undefined ? "_(removed)_" : `\`${JSON.stringify(newVal)}\``;
      lines.push(`| ${prop} | ${oldStr} | ${newStr} |`);
    }
    lines.push("");
  }

  lines.push("<br/></details>");
  return lines.join("\n");
}

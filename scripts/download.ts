import { execSync } from "node:child_process";
import {
  writeFile,
} from "node:fs/promises";
import process from "node:process";
import {
  array,
  boolean,
  number,
  object,
  optional,
  parseAsync,
  record,
  string,
} from "valibot";
import YAML from "yaml";

const LANGUAGES_SCHEMA = record(string(), object({
  type: string(),
  color: optional(string()),
  aliases: optional(array(string())),
  tm_scope: string(),
  ace_mode: string(),
  codemirror_mode: optional(string()),
  codemirror_mime_type: optional(string()),
  wrap: optional(boolean()),
  group: optional(string()),
  language_id: number(),
  extensions: optional(array(string())),
  interpreters: optional(array(string())),
  filenames: optional(array(string())),
  fs_name: optional(string()),
  searchable: optional(boolean()),
}));

async function run() {
  if (!process.env.GITHUB_TOKEN) {
    console.error("GITHUB_TOKEN not set");
    process.exit(1);
  }

  const res = await fetch("https://raw.githubusercontent.com/github/linguist/master/lib/linguist/languages.yml", {
    headers: {
      Authorization: `bearer ${process.env.GITHUB_TOKEN}`,
    },
  });

  if (!res.ok) {
    console.error("Failed to fetch schema");
    process.exit(1);
  }

  const languagesText = await res.text();
  if (!languagesText || typeof languagesText !== "string") {
    console.error("Failed to parse schema");
    process.exit(1);
  }

  const languages = await parseAsync(LANGUAGES_SCHEMA, YAML.parse(languagesText));

  await writeFile("languages.json", JSON.stringify(languages, null, 2));

  let content = `
/**
 * All language definitions from Github's linguist.
 * @module
 */
  `;
  Object.keys(languages).forEach((key) => {
    const lang = languages[key];

    let normalizedKey = key
      .replace(/\s/g, "")
      .replace(/-/g, "_")
      .replace(/\./g, "")
      .replace(/\+/g, "p")
      .replace(/#/g, "sharp")
      .replace(/'/g, "")
      .replace(/\*/g, "star")
      .replace(/\(/g, "")
      .replace(/\)/g, "");

    if (normalizedKey.match(/^\d/)) {
      normalizedKey = `_${normalizedKey}`;
    }

    content += `
/**
 * GitHub's language definition for ${key}.
 */
export const ${normalizedKey} = ${JSON.stringify(lang, null, 2)} as const;\n\n`;
  });

  await writeFile("./src/languages.ts", content);
  await writeFile("./src/index.ts", `
/**
 * All language definitions from Github's linguist.
 * @module
 */

export * from './languages'

/**
 * A language definition.
 */
export interface Language {
  type: string
  tm_scope: string
  ace_mode: string
  language_id: number
  color?: string | undefined
  aliases?: string[] | undefined
  codemirror_mode?: string | undefined
  codemirror_mime_type?: string | undefined
  wrap?: boolean | undefined
  group?: string | undefined
  extensions?: string[] | undefined
  interpreters?: string[] | undefined
  filenames?: string[] | undefined
  fs_name?: string | undefined
  searchable?: boolean | undefined
}`);

  execSync("npx eslint . --fix");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

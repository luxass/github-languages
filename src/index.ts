import languages from "./languages.json";

interface GitHubLanguage {
    type: LanguageType;
    color?: string;
    extensions?: string[];
    tm_scope: string;
    ace_mode: string;
    language_id: number;
    aliases?: string[];
    codemirror_mode?: string;
    codemirror_mime_type?: string;
    interpreters?: string[];
    group?: string;
    filenames?: string[];
    wrap?: boolean;
    fs_name?: string;
    searchable?: boolean;
}

enum LanguageType {
    Data = "data",
    Markup = "markup",
    Programming = "programming",
    Prose = "prose",
}
type LanguageKeys = keyof typeof languages;

class GitHubLanguages {
    languages: Record<LanguageKeys, GitHubLanguage>;

    constructor() {
        this.languages = languages as Record<LanguageKeys, GitHubLanguage>;
    }

    getFromColor(color: string): GitHubLanguage | undefined {
        const found = (
            Object.keys(this.languages) as Array<keyof typeof languages>
        ).find((language) => {
            const lang: GitHubLanguage = this.languages[language];

            if (lang.color === color) {
                return lang;
            }
        });

        return found ? this.languages[found] : undefined;
    }

    getFromLanguage(language: LanguageKeys): GitHubLanguage | undefined {
        const found = this.languages[language];
        return found ? found : undefined;
    }

    getFromExt(ext: string) {
        const found = (
            Object.keys(this.languages) as Array<keyof typeof languages>
        ).find((language) => {
            const lang: GitHubLanguage = this.languages[language];

            if (lang.extensions && lang.extensions.includes(ext)) {
                return lang;
            }
        });
        return found ? this.languages[found] : undefined;
    }
}

const githubLanguages = new GitHubLanguages();
export = githubLanguages;
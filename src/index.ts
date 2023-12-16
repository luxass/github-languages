export * from "./languages";

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
}

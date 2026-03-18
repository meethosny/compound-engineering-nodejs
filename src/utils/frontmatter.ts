import { load } from "js-yaml"

export type FrontmatterResult = {
  data: Record<string, unknown>
  body: string
}

export function parseFrontmatter(raw: string): FrontmatterResult {
  const lines = raw.split(/\r?\n/)
  if (lines.length === 0 || lines[0].trim() !== "---") {
    return { data: {}, body: raw }
  }

  let endIndex = -1
  for (let i = 1; i < lines.length; i += 1) {
    if (lines[i].trim() === "---") {
      endIndex = i
      break
    }
  }

  if (endIndex === -1) {
    return { data: {}, body: raw }
  }

  const rawYaml = lines.slice(1, endIndex).join("\n")
  // Sanitize frontmatter values that break js-yaml:
  // - Literal \n sequences (common in Claude agent descriptions)
  // - Long values with colons that YAML misinterprets as nested mappings
  const yamlText = rawYaml.replace(/^(\w[\w-]*:\s*)(.+)$/gm, (_match, key: string, value: string) => {
    // Skip values already properly quoted
    if (/^["']/.test(value.trim())) return _match
    // Skip simple values (no special chars)
    const needsQuoting = value.includes("\\n") || (value.length > 200 && value.includes(": "))
    if (!needsQuoting) return _match
    const cleaned = value.replace(/\\n/g, " ").replace(/\s+/g, " ").trim()
    const escaped = cleaned.replace(/\\/g, "\\\\").replace(/"/g, '\\"')
    return key + '"' + escaped + '"'
  })
  const body = lines.slice(endIndex + 1).join("\n")
  const parsed = load(yamlText)
  const data = (parsed && typeof parsed === "object") ? (parsed as Record<string, unknown>) : {}
  return { data, body }
}

export function formatFrontmatter(data: Record<string, unknown>, body: string): string {
  const yaml = Object.entries(data)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => formatYamlLine(key, value))
    .join("\n")

  if (yaml.trim().length === 0) {
    return body
  }

  return [`---`, yaml, `---`, "", body].join("\n")
}

function formatYamlLine(key: string, value: unknown): string {
  if (Array.isArray(value)) {
    const items = value.map((item) => `  - ${formatYamlValue(item)}`)
    return [key + ":", ...items].join("\n")
  }
  return `${key}: ${formatYamlValue(value)}`
}

function formatYamlValue(value: unknown): string {
  if (value === null || value === undefined) return ""
  if (typeof value === "number" || typeof value === "boolean") return String(value)
  const raw = String(value)
  if (raw.includes("\n")) {
    return `|\n${raw.split("\n").map((line) => `  ${line}`).join("\n")}`
  }
  if (raw.includes(":") || raw.startsWith("[") || raw.startsWith("{") || raw === "*") {
    return JSON.stringify(raw)
  }
  return raw
}

export default function cleanResponse(text) {
  return text
    .replace(/\*\*/g, "")
    .replace(/```(.*?)```/gs, (match, code) => `\`\`\`\n${code.trim()}\n\`\`\``)
    .trim();
}
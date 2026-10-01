const ALLOWED = new Set([
  "p",
  "br",
  "strong",
  "em",
  "b",
  "i",
  "ul",
  "ol",
  "li",
  "a",
  "h2",
  "h3",
  "blockquote",
]);

/** Keep a small set of article tags. Drop scripts, handlers, and unsafe links. */
export function sanitizeArticleHtml(html: string): string {
  const template = document.createElement("template");
  template.innerHTML = html;
  const root = template.content;

  let changed = true;
  while (changed) {
    changed = false;
    for (const child of [...root.querySelectorAll("*")]) {
      if (!ALLOWED.has(child.tagName.toLowerCase())) {
        child.replaceWith(...child.childNodes);
        changed = true;
        break;
      }
      for (const attr of [...child.attributes]) {
        const safeHref =
          child.tagName === "A" &&
          attr.name === "href" &&
          /^https?:\/\//i.test(attr.value);
        if (!safeHref) child.removeAttribute(attr.name);
      }
      if (child.tagName === "A") {
        child.setAttribute("rel", "noopener noreferrer");
        child.setAttribute("target", "_blank");
      }
    }
  }

  return template.innerHTML;
}

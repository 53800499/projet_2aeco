/**
 * Export PDF via html2pdf.js / html2canvas.
 * Tailwind v4 émet des couleurs oklch : le parseur CSS de html2canvas les rejette.
 * On clone le contenu avec styles inline en RGB/hex et on utilise
 * foreignObjectRendering (rendu navigateur, compatible oklch).
 */

const MODERN_COLOR_RE = /\b(?:oklch|oklab|color-mix|lab|lch)\([^)]*\)/gi;

const INLINE_STYLE_PROPS = [
  "display",
  "position",
  "width",
  "height",
  "max-width",
  "min-width",
  "margin",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "padding",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "flex",
  "flex-direction",
  "flex-wrap",
  "align-items",
  "justify-content",
  "gap",
  "grid-template-columns",
  "color",
  "background-color",
  "background-image",
  "border",
  "border-radius",
  "border-top",
  "border-right",
  "border-bottom",
  "border-left",
  "border-top-color",
  "border-right-color",
  "border-bottom-color",
  "border-left-color",
  "box-shadow",
  "opacity",
  "font-size",
  "font-weight",
  "font-family",
  "line-height",
  "text-align",
  "text-transform",
  "letter-spacing",
  "object-fit",
  "overflow",
  "break-inside",
  "page-break-inside",
] as const;

function toSafeColor(value: string): string {
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return "#000000";
    ctx.fillStyle = "#000000";
    ctx.fillStyle = value.trim();
    return ctx.fillStyle;
  } catch {
    return "#000000";
  }
}

function sanitizeCSSValue(value: string): string {
  if (!value || value === "none" || value === "transparent" || value === "initial") {
    return value;
  }
  if (!MODERN_COLOR_RE.test(value)) return value;
  MODERN_COLOR_RE.lastIndex = 0;
  return value.replace(MODERN_COLOR_RE, (match) => toSafeColor(match));
}

function applySafeInlineStyles(source: Element, target: HTMLElement): void {
  const computed = window.getComputedStyle(source);

  for (const prop of INLINE_STYLE_PROPS) {
    let value = computed.getPropertyValue(prop);
    if (!value) continue;

    if (prop === "background-image" && value.includes("gradient")) {
      value = "none";
    } else {
      value = sanitizeCSSValue(value);
    }

    target.style.setProperty(prop, value);
  }

  if (target instanceof HTMLImageElement && target.src) {
    target.crossOrigin = "anonymous";
  }

  Array.from(source.children).forEach((child, index) => {
    const targetChild = target.children[index];
    if (targetChild instanceof HTMLElement) {
      applySafeInlineStyles(child, targetChild);
    }
  });
}

function sanitizeElementInlineStyles(root: HTMLElement): void {
  root.querySelectorAll("*").forEach((node) => {
    if (!(node instanceof HTMLElement)) return;
    for (let i = node.style.length - 1; i >= 0; i -= 1) {
      const prop = node.style.item(i);
      const value = node.style.getPropertyValue(prop);
      node.style.setProperty(prop, sanitizeCSSValue(value));
    }
  });
}

function buildExportClone(source: HTMLElement): {
  node: HTMLElement;
  cleanup: () => void;
} {
  const wrapper = document.createElement("div");
  wrapper.setAttribute("data-pdf-export", "true");
  wrapper.style.cssText =
    "position:fixed;left:-100000px;top:0;z-index:-1;pointer-events:none;";

  const clone = source.cloneNode(true) as HTMLElement;
  clone.removeAttribute("class");
  clone.querySelectorAll("[class]").forEach((el) => el.removeAttribute("class"));
  clone.style.width = `${source.offsetWidth}px`;
  clone.style.background = "#ffffff";
  clone.style.color = "#13241d";

  applySafeInlineStyles(source, clone);
  sanitizeElementInlineStyles(clone);

  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  return {
    node: clone,
    cleanup: () => wrapper.remove(),
  };
}

export interface ExportPdfOptions {
  filename: string;
  margin?: number;
  orientation?: "portrait" | "landscape";
}

export async function exportElementToPdf(
  element: HTMLElement,
  options: ExportPdfOptions
): Promise<void> {
  const { node, cleanup } = buildExportClone(element);

  try {
    const html2pdf = (await import("html2pdf.js")).default;

    const pdfOptions = {
      margin: options.margin ?? 0.5,
      filename: options.filename,
      image: { type: "jpeg" as const, quality: 0.95 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        foreignObjectRendering: true,
        onclone: (clonedDoc: Document, clonedElement: HTMLElement) => {
          clonedDoc
            .querySelectorAll('link[rel="stylesheet"], style')
            .forEach((el) => el.remove());
          clonedElement.removeAttribute("class");
          clonedElement
            .querySelectorAll("[class]")
            .forEach((el) => el.removeAttribute("class"));
          sanitizeElementInlineStyles(clonedElement);
          clonedDoc.body.style.background = "#ffffff";
        },
      },
      jsPDF: {
        unit: "in",
        format: "a4",
        orientation: options.orientation ?? "portrait",
      },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };

    await html2pdf().set(pdfOptions).from(node).save();
  } finally {
    cleanup();
  }
}

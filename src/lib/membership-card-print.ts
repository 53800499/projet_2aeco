import { toPng } from "html-to-image";

const buildFileName = (options?: { memberName?: string; matricule?: string }) => {
  const matricule = (options?.matricule?.trim() || "carte").replace(/[^\w-]+/g, "-");
  const name = (options?.memberName?.trim() || "membre")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
  return `carte-membre-${matricule}-${name}.png`;
};

const triggerDownload = (dataUrl: string, fileName: string) => {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = fileName;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
};

/** Télécharge la carte en PNG via html-to-image (un clic, fichier direct). */
export async function downloadMembershipCard(
  cardRoot: HTMLElement,
  options?: { memberName?: string; matricule?: string }
) {
  const card = cardRoot.querySelector(".membership-card") as HTMLElement | null;
  if (!card) {
    throw new Error("Carte introuvable.");
  }

  const dataUrl = await toPng(card, {
    cacheBust: true,
    pixelRatio: 3,
    backgroundColor: "#ffffff",
    skipFonts: false,
  });

  triggerDownload(dataUrl, buildFileName(options));
}

import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";

/** Format carte bancaire ISO (paysage). */
const CARD_WIDTH_MM = 85.6;
const CARD_HEIGHT_MM = 54;

const buildFileName = (options?: { memberName?: string; matricule?: string }) => {
  const matricule = (options?.matricule?.trim() || "carte").replace(/[^\w-]+/g, "-");
  const name = (options?.memberName?.trim() || "membre")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
  return `carte-membre-${matricule}-${name}.pdf`;
};

/** Télécharge la carte en PDF (format carte bancaire, un clic). */
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

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: [CARD_WIDTH_MM, CARD_HEIGHT_MM],
    compress: true,
  });

  pdf.addImage(dataUrl, "PNG", 0, 0, CARD_WIDTH_MM, CARD_HEIGHT_MM);
  pdf.save(buildFileName(options));
}

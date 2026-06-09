/** Export plaquette via le moteur d'impression du navigateur (PDF A4 stable). */

export function printPlaquetteDocument(options?: { promoFilter?: string }) {
  const previousTitle = document.title;
  const promo = options?.promoFilter?.trim();
  const date = new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  document.title =
    promo ?
      `Plaquette CEG2 Ouidah - ${promo} - ${date}`
    : `Plaquette CEG2 Ouidah - ${date}`;

  const restoreTitle = () => {
    document.title = previousTitle;
    window.removeEventListener("afterprint", restoreTitle);
  };

  window.addEventListener("afterprint", restoreTitle);
  window.print();
}

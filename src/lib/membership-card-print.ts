/** Export carte de membre via le moteur d'impression du navigateur (PDF / image). */

export function printMembershipCard(options?: { memberName?: string; matricule?: string }) {
  const previousTitle = document.title;
  const name = options?.memberName?.trim() || "Membre";
  const matricule = options?.matricule?.trim();
  const date = new Date().toLocaleDateString("fr-FR");

  document.title = matricule
    ? `Carte membre ${name} - ${matricule} - ${date}`
    : `Carte membre ${name} - ${date}`;

  const restoreTitle = () => {
    document.title = previousTitle;
    window.removeEventListener("afterprint", restoreTitle);
  };

  window.addEventListener("afterprint", restoreTitle);
  window.print();
}

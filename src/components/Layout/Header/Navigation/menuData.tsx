/** @format */
import { HeaderItem } from "@/types/menu";

export const headerData: HeaderItem[] = [
  { label: "Accueil", href: "/" },

  // { label: "Répertoire", href: "/repertoire" },

  /* {
    label: "Anciens élèves",
    href: "/anciens-eleves",
    submenu: [
      { label: "Liste des inscrits", href: "/anciens-eleves" },
      { label: "Promotions", href: "/promotions" },
      { label: "Rechercher un ancien", href: "/recherche" }
    ]
  }, */

  { label: "Plaquette", href: "/plaquette" },
  { label: "Actualités", href: "/blog" },
];

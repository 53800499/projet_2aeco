import ContactForm from "@/components/Contact/Form";
import ContactInfo from "@/components/Contact/ContactInfo";
import Location from "@/components/Contact/OfficeLocation";
import React from "react";
import HeroSub from "@/components/SharedComponent/HeroSub";
import { Metadata } from "next";
export const metadata: Metadata = {
    title: "Contact | 2aeco",
};

const page = () => {
  const breadcrumbLinks = [
    { href: "/", text: "Accuail" },
    { href: "/contact", text: "Contact" },
  ];
  return (
    <>
      <HeroSub
        title="Contact"
        description="Besoin d’aide, d’informations ou d’assistance ? Contactez l’équipe de l’amicale des anciens élèves du CEG 2 Ouidah. Nous sommes disponibles pour répondre à toutes vos demandes."
        breadcrumbLinks={breadcrumbLinks}
      />
      <ContactInfo />
      <ContactForm />
      <Location />
    </>
  );
};

export default page;

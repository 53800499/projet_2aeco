/** @format */

import React from "react";
import Image from "next/image";

const Testimonial = () => {
  return (
    <section
      className="scroll-mt-24 bg-section dark:bg-darklight border-none"
      id="testimonials">
      <div className="container mx-auto max-w-6xl px-4">
        <div>
          {/* IMAGE / ILLUSTRATION */}
          <Image
            src="/images/testimonial/vector-smart.png"
            alt="souvenirs CEG 2 Ouidah"
            width={150}
            height={0}
            quality={100}
            className="w_f w-94! h-52! m-auto"
          />

          {/* TEXTE PRINCIPAL */}
          <div className="pt-16 pb-28">
            <p className="font-medium md:text-xl text-base text-midnight_text dark:text-white text-center max-w-3xl mx-auto">
              “Le CEG 2 de Ouidah a été plus qu’un établissement scolaire. C’est
              là que nous avons appris la discipline, l’amitié et le sens du
              travail. Ces années ont marqué nos vies à jamais.”
            </p>
          </div>

          {/* AUTEUR */}
          <div className="text-center">
            <strong className="text-lg font-bold text-midnight_text dark:text-primary">
              Ancien élève
            </strong>
            <p className="text-base text-gray dark:text-white/50">
              Promotion 2016 – CEG 2 Ouidah
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonial;

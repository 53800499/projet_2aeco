/** @format */

import React from "react";
import Image from "next/image";

const Contactform = () => {
  return (
    <section
      className="overflow-x-hidden bg-darkmode dark:bg-darklight"
      id="inscription">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="grid md:grid-cols-12 grid-cols-1 md:gap-7 gap-0">
          {/* INFORMATIONS */}
          <div
            className="row-start-1 col-start-1 row-end-2 md:col-end-7 col-end-12"
            data-aos="fade-left"
            data-aos-delay="200"
            data-aos-duration="1000">
            <div className="flex gap-2 items-center justify-start">
              <span className="w-3 h-3 rounded-full bg-success"></span>
              <span className="font-medium text-sm text-white">
                communauté CEG 2 Ouidah
              </span>
            </div>

            <h2 className="sm:text-4xl text-[28px] leading-tight font-bold text-white py-12">
              Rejoignez le répertoire des anciens élèves du CEG 2 de Ouidah
            </h2>

            {/* INFOS CONTACT / PROJET */}
            <div className="grid grid-cols-6 pb-12 border-b border-dark_border">
              <div className="col-span-3">
                <span className="text-white/50 text-lg">Téléphone</span>
                <p className="text-white text-lg">+229 00 00 00 00</p>
              </div>

              <div className="col-span-3">
                <span className="text-white/50 text-lg">Email</span>
                <p className="text-white text-lg">contact@ceg2ouidah.com</p>
              </div>

              <div className="col-span-6 pt-8">
                <span className="text-white/50 text-lg">Objectif</span>
                <p className="text-white text-lg">
                  Créer un annuaire des anciens élèves pour renforcer les liens
                  et les opportunités
                </p>
              </div>
            </div>

            {/* MOTIVATION */}
            <div className="pt-12">
              <p className="text-white/50 pb-4 text-base">
                Ensemble, reconnectons les anciens élèves
              </p>

              <div className="flex items-center flex-wrap md:gap-14 gap-7">
                <Image
                  src="/images/contact/google-pay.png"
                  alt="logo"
                  width={100}
                  height={20}
                />
                <Image
                  src="/images/contact/stripe.png"
                  alt="logo"
                  width={100}
                  height={20}
                />
              </div>
            </div>
          </div>

          {/* FORMULAIRE */}
          <div
            data-aos="fade-right"
            data-aos-delay="200"
            data-aos-duration="1000"
            className="relative md:row-start-1 row-start-2 md:col-start-8 col-start-1 col-end-13">
            <div className="lg:mt-0 mt-8 bg-white dark:bg-darkmode max-w-[50rem] m-auto pt-[2.1875rem] pb-8 px-[2.375rem] rounded-md relative z-10">
              <h2 className="sm:text-3xl text-lg font-bold text-midnight_text mb-3 dark:text-white">
                Inscription au répertoire
              </h2>

              <form className="flex w-full m-auto justify-between flex-wrap gap-4">
                {/* NOM */}
                <div className="flex gap-4 w-full">
                  <input
                    className="w-full px-4 py-3 border rounded-lg"
                    type="text"
                    placeholder="Nom"
                  />
                  <input
                    className="w-full px-4 py-3 border rounded-lg"
                    type="text"
                    placeholder="Prénom"
                  />
                </div>

                {/* EMAIL */}
                <input
                  type="email"
                  className="w-full px-4 py-3 border rounded-lg"
                  placeholder="email@gmail.com"
                />

                {/* PROMOTION */}
                <input
                  type="text"
                  className="w-full px-4 py-3 border rounded-lg"
                  placeholder="Promotion (ex: 2018)"
                />

                {/* PROFESSION */}
                <input
                  type="text"
                  className="w-full px-4 py-3 border rounded-lg"
                  placeholder="Profession actuelle"
                />

                {/* MESSAGE */}
                <textarea
                  className="w-full h-40 px-4 py-3 border rounded-lg"
                  placeholder="Parlez-nous de votre parcours depuis le CEG 2..."
                />

                {/* CONSENTEMENT */}
                <div className="flex items-start gap-2">
                  <input type="checkbox" />
                  <p className="text-gray dark:text-white/50">
                    J’accepte de rejoindre le répertoire des anciens élèves du
                    CEG 2 de Ouidah
                  </p>
                </div>

                {/* BUTTON */}
                <button
                  className="w-full bg-primary text-white py-3 rounded-lg hover:bg-blue-700"
                  type="submit">
                  Rejoindre le répertoire
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contactform;

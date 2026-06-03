/** @format */

import React from "react";
import Link from "next/link";
import Image from "next/image";

const ContactForm = () => {
  return (
    <>
      <section className="dark:bg-darkmode md:pb-24 pb-16">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid md:grid-cols-12 grid-cols-1 gap-8">
            {/* FORM */}
            <div className="col-span-6">
              <h2 className="max-w-96 text-[40px] leading-tight font-bold mb-9 text-midnight_text dark:text-white">
                Nous contacter
              </h2>

              <form className="flex flex-wrap w-full m-auto justify-between">
                {/* NOM / PRENOM */}
                <div className="sm:flex gap-3 w-full">
                  <div className="mx-0 my-2.5 flex-1">
                    <label className="pb-3 inline-block text-base">
                      Prénom*
                    </label>
                    <input
                      className="w-full text-base px-4 rounded-lg py-2.5 border-border dark:border-dark_border border-solid dark:text-white dark:bg-darkmode border transition-all duration-500 focus:border-primary dark:focus:border-primary focus:outline-0"
                      type="text"
                    />
                  </div>

                  <div className="mx-0 my-2.5 flex-1">
                    <label className="pb-3 inline-block text-base">Nom*</label>
                    <input
                      className="w-full text-base px-4 py-2.5 rounded-lg border-border dark:border-dark_border border-solid dark:text-white dark:bg-darkmode border transition-all duration-500 focus:border-primary dark:focus:border-primary focus:outline-0"
                      type="text"
                    />
                  </div>
                </div>

                {/* EMAIL / SUJET */}
                <div className="sm:flex gap-3 w-full">
                  <div className="mx-0 my-2.5 flex-1">
                    <label className="pb-3 inline-block text-base">
                      Adresse email*
                    </label>
                    <input
                      type="email"
                      className="w-full text-base px-4 py-2.5 rounded-lg border-border dark:border-dark_border border-solid dark:text-white dark:bg-darkmode border transition-all duration-500 focus:border-primary dark:focus:border-primary focus:outline-0"
                    />
                  </div>

                  <div className="mx-0 my-2.5 flex-1">
                    <label className="pb-3 inline-block text-base">
                      Sujet*
                    </label>
                    <select className="w-full text-base px-4 py-2.5 rounded-lg border-border dark:text-white border-solid dark:bg-darkmode border transition-all duration-500 focus:border-primary dark:focus:border-primary dark:border-dark_border focus:outline-0">
                      <option value="">Choisir un sujet</option>
                      <option value="information">Demande d’information</option>
                      <option value="support">Support technique</option>
                      <option value="adhesion">Adhésion à l’amicale</option>
                      <option value="partenariat">Partenariat</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>
                </div>

                {/* MESSAGE */}
                <div className="mx-0 my-2.5 w-full">
                  <label className="pb-3 inline-block text-base">
                    Message*
                  </label>
                  <textarea
                    rows={5}
                    className="w-full text-base px-4 py-2.5 rounded-lg border-border dark:border-dark_border border-solid dark:text-white dark:bg-darkmode border transition-all duration-500 focus:border-primary dark:focus:border-primary focus:outline-0"
                    placeholder="Écrivez votre message ici..."
                  />
                </div>

                {/* BUTTON */}
                <div className="mx-0 my-2.5 w-full">
                  <button
                    type="submit"
                    className="bg-primary rounded-lg text-white py-4 px-8 mt-4 inline-block hover:bg-green-700">
                    Envoyer le message
                  </button>
                </div>
              </form>
            </div>

            {/* IMAGE */}
            <div className="col-span-6">
              <Image
                src="/images/contact-page/contact.jpg"
                alt="Contact"
                width={1300}
                height={0}
                quality={100}
                style={{ width: "100%", height: "auto" }}
                className="bg-no-repeat bg-contain"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ContactForm;

/** @format */

import React from "react";
import Link from "next/link";

const Location = () => {
  return (
    <>
      <section className="bg-primary md:py-24 py-16">
        <div className="container mx-auto max-w-6xl px-4">
          {/* SECTION 1 */}
          <div className="grid md:grid-cols-6 lg:grid-cols-9 grid-cols-1 gap-7 border-b border-solid border-white border-opacity-50 pb-11">
            <div className="col-span-3">
              <h2 className="text-white max-w-56 text-[40px] leading-tight font-bold">
                Siège de l’Amicale
              </h2>
            </div>

            <div className="col-span-3">
              <p className="sm:text-2xl text-xl text-white/50 font-normal max-w-64 leading-7">
                CEG 2 Ouidah, Littoral, Bénin
              </p>
            </div>

            <div className="col-span-3">
              <Link
                href="mailto:contact@amicale-ceg2ouidah.org"
                className="sm:text-2xl text-xl text-white font-medium underline">
                contact@amicale-ceg2ouidah.org
              </Link>

              <Link
                href="tel:+22900000000"
                className="sm:text-2xl text-white/80 text-xl flex items-center gap-2 hover:text-opacity-100 w-fit">
                <span className="text-white/40">Appeler :</span>
                +229 00 00 00 00
              </Link>
            </div>
          </div>

          {/* SECTION 2 */}
          <div className="grid md:grid-cols-6 lg:grid-cols-9 grid-cols-1 gap-7 pt-12">
            <div className="col-span-3">
              <h2 className="text-white max-w-52 text-[40px] leading-tight font-bold">
                Bureau de coordination
              </h2>
            </div>

            <div className="col-span-3">
              <p className="sm:text-2xl text-xl text-white/50 font-normal max-w-64 leading-7">
                Ouidah, Bénin — Gestion des anciens élèves et activités de
                l’amicale
              </p>
            </div>

            <div className="col-span-3">
              <Link
                href="mailto:support@amicale-ceg2ouidah.org"
                className="sm:text-2xl text-xl text-white font-medium underline">
                support@amicale-ceg2ouidah.org
              </Link>

              <Link
                href="tel:+22900000000"
                className="sm:text-2xl text-white/80 text-xl flex items-center gap-2 hover:text-opacity-100 w-fit">
                <span className="text-white/40">Appeler :</span>
                +229 00 00 00 00
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Location;

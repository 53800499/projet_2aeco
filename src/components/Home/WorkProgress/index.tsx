/** @format */

"use client";
import React from "react";
import Image from "next/image";

const memories = [
  {
    title: "Les récréations inoubliables",
    description:
      "Les moments passés dans la cour, entre amis, rires et jeux après les cours."
  },
  {
    title: "Les cours marquants",
    description:
      "Les enseignants, les leçons importantes et les souvenirs de classes qui ont forgé nos parcours."
  },
  {
    title: "Les événements scolaires",
    description:
      "Les fêtes, compétitions sportives et activités culturelles qui animaient le CEG 2."
  },
  {
    title: "Les amitiés durables",
    description:
      "Des liens créés sur les bancs de l’école et qui perdurent encore aujourd’hui."
  }
];

const Progresswork = ({ isColorMode }: { isColorMode: Boolean }) => {
  return (
    <section
      className={`scroll-mt-25 ${
        isColorMode ?
          "dark:bg-darklight bg-section"
        : "dark:bg-darkmode bg-white"
      }`}
      id="memories">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="grid md:grid-cols-12 items-center gap-7">
          {/* IMAGE */}
          <div className="md:col-span-6">
            <Image
              src="/images/work-progress/image.jpg"
              alt="souvenirs CEG 2 Ouidah"
              width={375}
              height={300}
              style={{ width: "100%", height: "100%" }}
              className="md:block hidden"
            />
          </div>

          {/* CONTENT */}
          <div
            className="md:col-span-6"
            data-aos="fade-left"
            data-aos-delay="200"
            data-aos-duration="1000">
            <div className="flex gap-2 items-center">
              <span className="w-3 h-3 rounded-full bg-success"></span>
              <span className="font-medium text-midnight_text text-sm dark:text-white/50">
                souvenirs du CEG 2 de Ouidah
              </span>
            </div>

            <h2 className="pt-9 pb-8 text-midnight_text font-bold dark:text-white text-4xl">
              Les bons moments passés sur les bancs de l’école
            </h2>

            <p className="text-gray dark:text-white/70 text-base font-semibold">
              Chaque ancien élève garde en mémoire des instants uniques vécus au
              CEG 2 de Ouidah, qui ont forgé des amitiés et des parcours de vie.
            </p>

            {/* MEMORIES LIST */}
            <div className="pt-12 space-y-8">
              {memories.map((item, index) => (
                <div key={index} className="border-l-2 border-primary pl-4">
                  <h3 className="text-lg font-bold text-midnight_text dark:text-white">
                    {item.title}
                  </h3>

                  <p className="text-sm text-gray dark:text-white/60 mt-1">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Progresswork;

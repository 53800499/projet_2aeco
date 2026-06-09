/** @format */

"use client";
import { useAuthProfile } from "@/app/context/AuthProfileContext";
import Image from "next/image";
import Link from "next/link";
import { associationObjectives } from "@/app/api/data";

const Hero = () => {
  const { user } = useAuthProfile();

  return (
    <section className="relative md:pt-44 pt-28 bg-white dark:bg-darklight bg-cover text-white">
      <div className="container mx-auto max-w-6xl px-4 grid grid-cols-12 gap-4 relative z-10">
        {/* LEFT CONTENT */}
        <div
          className="md:col-span-6 col-span-12 p-4 md:px-4 px-0 space-y-4 flex flex-col items-start justify-center"
          data-aos="fade-right"
          data-aos-delay="200"
          data-aos-duration="1000">
          <div className="flex gap-2 items-center">
            <span className="w-3 h-3 rounded-full bg-success"></span>
            <span className="font-medium text-midnight_text text-sm dark:text-white/50">
              CEG 2 Ouidah • Réseau des anciens élèves
            </span>
          </div>

          <h1 className="text-midnight_text font-bold dark:text-white text-3xl md:leading-[1.15]">
            Reconnecter les anciens élèves du CEG 2 de Ouidah
          </h1>

          <p className="text-gray-600 dark:text-white/70 text-base md:text-lg leading-relaxed">
            L’Amicale des Anciens Élèves du CEG 2 de Ouidah{" "}
            <span className="font-semibold text-primary">(2AECO)</span> est un
            réseau dynamique qui rassemble les anciens élèves autour des valeurs
            de solidarité, de partage et de développement communautaire.
          </p>

          <p className="text-gray-600 dark:text-white/70 text-sm md:text-base leading-relaxed">
            Elle vise à renforcer les liens entre anciens camarades, soutenir
            les initiatives éducatives du collège et contribuer activement à la
            réussite des générations futures.
          </p>
          <div className="flex items-center gap-4 mt-4">
            {user ? null : (
              <Link
                href="#inscription"
                className="py-3 bg-primary text-white rounded-md hover:bg-green-700 transition duration-300 px-8">
                Rejoindre le répertoire
              </Link>
            )}
            <Link
              href="#objectifs"
              type="button"
              className="hidden lg:block bg-transparent border border-primary text-primary px-4 py-3 rounded-lg hover:bg-primary hover:text-white">
              Nos objectifs
            </Link>
          </div>

          <div className="flex items-center mt-2 gap-4">
            <div className="flex items-center">
              <Image
                src="/images/hero/hero-profile-1.jpg"
                alt="ancien élève"
                width={50}
                height={80}
                className="w-10! h-10! rounded-full border border-solid border-white -ml-0"
              />
              <Image
                src="/images/hero/hero-profile-2.jpg"
                alt="ancien élève"
                width={40}
                height={40}
                className="w-10! h-10! rounded-full border border-solid border-white -ml-3"
              />
              <Image
                src="/images/hero/hero-profile-3.jpg"
                alt="ancien élève"
                width={40}
                height={40}
                className="w-10! h-10! rounded-full border border-solid border-white -ml-3"
              />
            </div>

            {user ?
              <p className="text-sm font-normal text-gray-500 max-w-56">
                Bienvenue, {user.user_metadata.full_name} ! Explorez votre
                profil et connectez-vous avec d'autres anciens élèves.
              </p>
            : <p className="text-sm font-normal text-gray-500 max-w-56">
                Vous êtes ancien élève ?{" "}
                <Link
                  href="#inscription"
                  className="text-primary hover:text-green-500">
                  Inscrivez-vous ici
                </Link>{" "}
                et rejoignez la communauté.
              </p>
            }
          </div>
        </div>

        {/* RIGHT IMAGE */}
        <div
          className="
  md:col-span-6 col-span-12
  relative
  min-h-[280px]
  sm:min-h-[350px]
  md:min-h-[500px]

  before:absolute before:content-['']
  before:bg-[url('/images/hero/line-leyar.svg')]
  before:bg-no-repeat
  before:left-1/2 before:top-0
  before:h-24 before:w-52
  before:-z-10
  before:translate-x-[70%]
  before:-translate-y-[40%]
  before:brightness-0
  before:saturate-100
  before:[filter:invert(28%)_sepia(76%)_saturate(570%)_hue-rotate(74deg)_brightness(92%)_contrast(91%)]
  lg:before:inline-block before:hidden

  after:absolute after:content-['']
  after:bg-[url('/images/hero/round-leyar.svg')]
  after:bg-no-repeat
  after:left-0 after:bottom-0
  after:h-6.25 after:w-6.25
  after:-z-10
  after:-translate-x-1/2
  after:translate-y-1/2
  after:brightness-0
  after:saturate-100
  after:[filter:invert(28%)_sepia(76%)_saturate(570%)_hue-rotate(74deg)_brightness(92%)_contrast(91%)]
  xl:after:inline-block after:hidden
">
          <Image
            src="/images/hero/herop.jpeg"
            alt="Communauté anciens élèves CEG 2 Ouidah"
            fill
            priority
            className="rounded-xl object-cover"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;

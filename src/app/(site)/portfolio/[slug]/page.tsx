'use client'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Portfolio from '@/components/SharedComponent/portfollio'
import { PlaquetteMember, getMemberDisplayName } from '@/lib/plaquette'
import { useParams } from 'next/navigation'
import SpinnerScreen from '@/components/Common/spinner/spinner-screen'

const Portfolios = () => {
  const { slug } = useParams()
  const [item, setItem] = useState<PlaquetteMember | null>(null)

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/plaquette/members')
      const data = await res.json()
      if (!res.ok) return
      const found = (data.members || []).find((m: PlaquetteMember) => m.id === slug)
      setItem(found || null)
    }
    void load()
  }, [slug])

  if (!item) {
    return <div> <SpinnerScreen /></div>
  }
  return (
    <>
      <section className='md:pt-44 pt-36 md:py-24 py-16 dark:bg-darkmode'>
        <div className='container mx-auto max-w-6xl'>
          <div className='branding_heading'>
            <h2
              className='text-4xl font-bold text-midnight_text pb-5 dark:text-white'
              data-aos='fade-right'
              data-aos-delay='200'
              data-aos-duration='1000'>
              {getMemberDisplayName(item)}
            </h2>
            <div className='pb-[3.6875rem]'>
              <p
                className='text-secondary text-xl max-w-[38.6875rem] dark:text-white/50'
                data-aos='fade-Up'
                data-aos-delay='300'
                data-aos-duration='1000'>
                {item.profession || item.fonction_actuelle || 'Membre actif de la communaute alumni.'}
              </p>
            </div>
          </div>
          <div className='max-w-3xl'>
            <Image
              src={item.photo || '/images/alumni/antoine.jpg'}
              alt={getMemberDisplayName(item)}
              width={1200}
              height={800}
              className='rounded-lg'
            />
          </div>
        </div>
      </section>
      <section className='md:pb-24 pb-16 dark:bg-darkmode'>
        <div className='container mx-auto max-w-6xl'>
          <div className='rounded-2xl border border-slate-200 p-6 dark:border-dark_border'>
            <h3 className='text-2xl font-semibold text-midnight_text dark:text-white'>Profil</h3>
            <p className='mt-3 text-secondary dark:text-white/70'>Nom: {getMemberDisplayName(item)}</p>
            <p className='mt-2 text-secondary dark:text-white/70'>Promotion: {item.promo || 'Non renseignee'}</p>
            <p className='mt-2 text-secondary dark:text-white/70'>Ville: {item.ville_residence || '-'}</p>
            <p className='mt-2 text-secondary dark:text-white/70'>Pays: {item.pays_residence || '-'}</p>
          </div>
        </div>
      </section>
      <Portfolio />
    </>
  )
}

export default Portfolios

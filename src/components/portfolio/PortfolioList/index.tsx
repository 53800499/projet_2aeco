"use client"
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { PlaquetteMember, getMemberDisplayName } from '@/lib/plaquette'

const PortfolioList = () => {
  const [members, setMembers] = useState<PlaquetteMember[]>([])

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/plaquette/members')
      const data = await res.json()
      if (!res.ok) return
      setMembers(data.members || [])
    }
    void load()
  }, [])

  return (
    <section id='portfolio' className='md:pb-24 pb-16 pt-8 dark:bg-darkmode'>
      <div className='flex flex-wrap gap-[2.125rem] lg:px-[2.125rem] px-0 max-w-[120rem] w-full justify-center m-auto'>
        {members.map((item, index) => (
          <Link key={item.id} href={`/portfolio/${item.id}`} passHref>
            <div className={`w-[18rem] group ${index % 2 ? 'md:mt-24' : 'md:mt-0'}`}>
              <div className='relative overflow-hidden rounded-lg group-hover:scale-[1.1] group-hover:cursor-pointer transition-all duration-500'>
                <Image
                  src={item.photo || '/images/alumni/antoine.jpg'}
                  alt={getMemberDisplayName(item)}
                  width={1200}
                  height={800}
                  style={{ width: '100%', height: 'auto' }}
                />
              </div>
              <h4 className='pb-[0.3125rem] pt-[2.1875rem] group-hover:text-primary group-hover:cursor-pointer text-2xl text-midnight_text font-bold dark:text-white'>
                {getMemberDisplayName(item)}
              </h4>
              <p className='text-secondary font-normal text-lg group-hover:text-primary group-hover:cursor-pointer dark:text-white/50'>
                {item.profession || item.fonction_actuelle || `Promotion ${item.promo || 'N/A'}`}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default PortfolioList

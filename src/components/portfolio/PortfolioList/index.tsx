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
    <section id="portfolio" className="md:pb-24 pb-16 pt-8 dark:bg-darkmode">
      <div className="flex flex-wrap gap-[2.125rem] lg:px-[2.125rem] px-0 max-w-[120rem] w-full justify-center m-auto">
        {members.map((item, index) => (
          <Link key={item.id} href={`/portfolio/${item.id}`}>
            <div
              className={`w-[18rem] flex flex-col group  ${
                index % 2 ? "md:mt-24" : "md:mt-0"
              }`}>
              {/* IMAGE */}
              <div className="relative w-[18rem] h-[18rem] overflow-hidden rounded-lg">
                <Image
                  src={item.photo || "/images/alumni/antoine.jpg"}
                  alt={getMemberDisplayName(item)}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-110"
                  sizes="288px"
                />
              </div>

              {/* CONTENT */}
              <div className="flex flex-col flex-1 pt-8">
                <h4 className="text-2xl font-bold text-midnight_text dark:text-white group-hover:text-primary line-clamp-2 min-h-[64px]">
                  {getMemberDisplayName(item)}
                </h4>

                <p className="text-secondary text-lg dark:text-white/50 group-hover:text-primary line-clamp-2">
                  {item.profession ||
                    item.fonction_actuelle ||
                    `Promotion ${item.promo || "N/A"}`}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default PortfolioList

'use client'

import React, { useEffect, useState } from 'react'
import Slider from 'react-slick'
import Image from 'next/image'
import Link from 'next/link'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

import { PlaquetteMember, getMemberDisplayName } from '@/lib/plaquette'

const PortfolioCard = () => {
  const [members, setMembers] = useState<PlaquetteMember[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/plaquette/members')
        const data = await res.json()

        if (!res.ok) return

        setMembers((data.members || []).slice(0, 12))
      } catch (error) {
        console.error('Erreur chargement membres :', error)
      }
    }

    void load()
  }, [])

  const settings = {
    autoplay: members.length > 1,
    dots: false,
    arrows: false,
    infinite: members.length > 5,
    speed: 500,
    slidesToShow: Math.min(members.length, 5),
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1320,
        settings: {
          slidesToShow: Math.min(members.length, 4),
        },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: Math.min(members.length, 3),
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: Math.min(members.length, 2),
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  }

  const MemberCard = ({
    item,
    index,
  }: {
    item: PlaquetteMember
    index: number
  }) => (
    <Link href={`/portfolio/${item.id}`} className="block">
      <div
        className={`px-3 group ${
          index % 2 !== 0 ? 'lg:mt-24' : ''
        }`}
      >
        <div className="relative overflow-hidden rounded-lg">
          <Image
            src={item.photo || '/images/alumni/antoine.jpg'}
            alt={getMemberDisplayName(item)}
            width={1200}
            height={800}
            style={{ width: '100%', height: 'auto' }}
            className="group-hover:scale-110 transition-all duration-500"
          />
        </div>

        <h4 className="pb-1 pt-9 text-2xl font-bold text-midnight_text dark:text-white group-hover:text-primary">
          {getMemberDisplayName(item)}
        </h4>

        <p className="text-secondary text-lg dark:text-white/50 group-hover:text-primary">
          {item.profession ||
            item.fonction_actuelle ||
            `Promotion ${item.promo || 'N/A'}`}
        </p>
      </div>
    </Link>
  )

  return (
    <div id="portfolio" className="dark:bg-darkmode">
      <div
        className={`mx-auto px-4 lg:px-9 slider-container ${
          members.length < 5 ? 'max-w-6xl' : 'max-w-[1600px]'
        }`}
      >
        {members.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-gray-500">
              Aucun membre disponible.
            </p>
          </div>
        ) : members.length < 5 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {members.map((item, index) => (
              <MemberCard
                key={item.id}
                item={item}
                index={index}
              />
            ))}
          </div>
        ) : (
          <Slider {...settings}>
            {members.map((item, index) => (
              <div key={item.id}>
                <MemberCard
                  item={item}
                  index={index}
                />
              </div>
            ))}
          </Slider>
        )}
      </div>
    </div>
  )
}

export default PortfolioCard
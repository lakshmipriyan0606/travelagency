'use client';

import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { footerData } from './constant';
import { Link } from 'react-router-dom';
import { navbarList } from '../navbar/constant';
import { WANumber } from '@/lib/utils';
import AnimatedButton from '@/components/Button/AnimatedButton/AnimatedButton';
import EnquiryModal from '../herosection/EnquiryModal';
import { useState } from 'react';
type IconComponent = React.FC<React.SVGProps<SVGSVGElement>>;

const iconMap: Record<string, IconComponent> = {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  X: (props) => (
    <svg
      {...props}
      className="w-4 h-4"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
};

export default function Footer() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <footer className="bg-custom-black text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-10">

        {/* CTA BANNER */}
        <section
          className="relative max-w-7xl mx-auto rounded-lg overflow-hidden shadow-2xl h-[400px] sm:h-[400px]"
          style={{
            backgroundImage: `url(${footerData.cta.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute top-0 left-0 w-full h-full bg-black/60" />
          <div className="relative z-10 w-full h-full flex items-center px-6 sm:px-12 md:px-20 lg:px-28">
            <div className="flex flex-col items-start text-left gap-6">
              <h3 className="text-white text-3xl sm:text-4xl lg:text-3xl leading-tight font-semibold">
                {footerData.cta.title}
              </h3>
              <p className="text-gray-200 text-sm sm:text-base max-w-xl leading-relaxed">
                {footerData.cta.description}
              </p>
              <AnimatedButton
                buttonText={footerData.cta.buttonText}
                onClick={() => setIsModalOpen(true)}
                className="bg-[#FBB03B] hover:bg-yellow-500 text-black font-bold py-3 px-8 rounded-md shadow-lg transition duration-300 text-sm tracking-widest uppercase mt-4 !border-none"
              />
            </div>
          </div>
        </section>

        {/* LINK COLUMNS */}
        <section className="rounded-2xl">
          <h4 className="text-gray-300 text-sm tracking-wide uppercase mb-6">Top links to find your dream home!</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {footerData.linkColumns.map((col) => (
              <div key={col.title}>
                <h5 className="text-white font-semibold mb-3 uppercase">{col.title}</h5>
                <ul className="space-y-2 text-gray-400">
                  {col.items.map((item) => (
                    <li key={item.label}>
                      <a href={item.href} className="hover:text-primary transition-colors">
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <h5 className="text-white font-semibold mb-3 uppercase">Quick Links</h5>
              <ul className="space-y-2 text-gray-400">
                {navbarList.map((item) => (
                  <li key={item.key}>
                    <Link to={item.path} className="hover:text-primary transition-colors">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <div className="bg-gray-500 h-[0.1px] w-full mt-8" />

        {/* CONTACT + SOCIAL ROW */}
        <div className="flex flex-col gap-6 mt-8">
          {/* <h2 className="text-[#FBB03B] text-2xl font-bold tracking-widest font-accent">
            C o n t a c t &nbsp; U s
          </h2> */}
          <section className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 md:gap-12 w-full">
            <div className="w-full md:w-1/3">
              <h3 className="text-white font-semibold mb-2 uppercase tracking-wide">
                Whats App Us
              </h3>
              <a
                href={`https://wa.me/${WANumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-primary transition-colors text-sm"
              >
                {footerData.whatsapp}
              </a>
            </div>

            <div className="w-full md:w-1/3 text-left">
              <h3 className="text-white font-semibold mb-2 uppercase tracking-wide">
                Email Us
              </h3>
              <a
                href={`mailto:${footerData.email}`}
                className="flex items-center gap-2 hover:text-primary transition-colors text-sm"
              >
                {footerData.email}
              </a>
            </div>

            <div className="w-full md:w-1/3">
              <h3 className="text-white font-semibold mb-2 uppercase tracking-wide text-left md:text-right">
                Follow Us
              </h3>
              <div className="flex gap-3 justify-start md:justify-end">
                {footerData.social.map((item) => {
                  const Icon = iconMap[item.icon];
                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 bg-white text-custom-black rounded-full flex items-center justify-center hover:bg-primary transition-colors"
                    >
                      {Icon && <Icon className="w-4 h-4" />}
                    </a>
                  );
                })}
              </div>
            </div>
          </section>
        </div>

        {/* BOTTOM LINKS + COPYRIGHT */}
        <section className="pt-6 text-center">
          <div className="text-sm">

            <div className="flex flex-wrap justify-center">
              {footerData.links.map((link, i) => (
                <span key={link.name} className=''>
                  <a
                    href={link.href}
                    className="hover:text-primary transition-colors"
                  >
                    {link.name}
                  </a>
                  {i < footerData.links.length - 1 && (
                    <span className="inline mx-2">
                      |
                    </span>
                  )}
                </span>
              ))}
            </div>

            <p className="mt-5">{footerData.copyright}</p>
          </div>
        </section>
      </div>
      <EnquiryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </footer>
  );
}

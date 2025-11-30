'use client';

import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { footerData } from './constant';
import companyLogo from '@/assets/image/logo/companyLogo.png'
import { Link } from 'react-router-dom';
import { navbarList } from '../navbar/constant';
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
  return (
    <footer className="bg-custom-black text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-10">

        {/* ---------- LOGO & ABOUT ---------- */}
        <section>
          <div className='flex gap-2 items-center'>
            <img src={companyLogo} alt="Company Logo" className='company-logo' />
            <span className="text-white text-2xl font-bold">   <span className='text-4xl'>S</span>ASTIKA <span className='text-4xl'>T</span>RAVELS</span>
          </div>
          <p className="text-sm md:text-base text-justify leading-relaxed">
            {footerData.about}
          </p>
        </section>

        {/* ---------- CONTACT & SOCIAL ---------- */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-8 ">

          {/* WhatsApp */}
          <h1 className='text-primary text-4xl sm:hidden'>Contact us </h1>
          <div className=''>
            <h3 className="text-white font-semibold mb-2 uppercase">
              WhatsApp Us
            </h3>
            <a
              href={`https://wa.me/91${footerData.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-primary transition-colors font-roboto"
            >
              {footerData.whatsapp}
            </a>
          </div>

          {/* Email */}
          <div>
            <h3 className="text-white font-semibold mb-2 uppercase">
              Email Us
            </h3>
            <a
              href={`mailto:${footerData.email}`}
              className="flex items-center gap-2 hover:text-primary transition-colors"
            >
              {footerData.email}
            </a>
          </div>

          <div>
            <h1>Links</h1>
            <h3 className="text-white flex gap-4 text-lg font-semibold mb-2">
              {
                navbarList?.map((item) => {
                  return (
                    <Link key={item.name} to={item.path} className="hover:text-primary transition-colors">
                      {item.name}
                    </Link>
                  )
                })
              }
            </h3>


          </div>

          {/* Social */}
          <div>
            <h3 className="text-white font-semibold mb-2 uppercase">
              Follow Us
            </h3>
            <div className="flex gap-3">
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

        {/* ---------- FOOTER BOTTOM ---------- */}
        <section className="border-t border-gray-800 pt-6 text-center">
          <div className="text-lg">

            {/* Footer Links */}
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

            {/* Copyright */}
            <p className="mt-5">{footerData.copyright}</p>
          </div>
        </section>
      </div>
    </footer>
  );
}

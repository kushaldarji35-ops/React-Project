import React from "react";
import { Link } from "react-router-dom";
import {
  IoLogoTwitter,
  IoLogoFacebook,
  IoLogoInstagram,
  IoLogoGithub,
} from "react-icons/io5";
import visaImg from "../../assets/footer/visa.png";
import mastercardImg from "../../assets/footer/mastercard.png";
import paypalImg from "../../assets/footer/paypal.png";
import applePayImg from "../../assets/footer/apple-pay.png";
import googlePayImg from "../../assets/footer/google-pay.png";
import "./Footer.css";

const footerLinks = [
  {
    title: "Company",
    links: [
      { name: "About", path: "/about" },
      { name: "Features", path: "/features" },
      { name: "Works", path: "/works" },
      { name: "Career", path: "/career" },
    ],
  },
  {
    title: "Help",
    links: [
      { name: "Customer Support", path: "/customer-support" },
      { name: "Delivery Details", path: "/delivery-details" },
      { name: "Terms & Conditions", path: "/terms" },
      { name: "Privacy Policy", path: "/privacy-policy" },
    ],
  },
  {
    title: "FAQ",
    links: [
      { name: "Account", path: "/account" },
      { name: "Manage Deliveries", path: "/manage-deliveries" },
      { name: "Orders", path: "/orders" },
      { name: "Payments", path: "/payments" },
    ],
  },
  {
    title: "Resources",
    links: [
      { name: "Free eBooks", path: "/free-ebooks" },
      { name: "Development Tutorial", path: "/development-tutorial" },
      { name: "How to - Blog", path: "/blog" },
      { name: "Youtube Playlist", path: "/youtube-playlist" },
    ],
  },
];

const socialLinks = [
  { icon: IoLogoTwitter, label: "Twitter" },
  { icon: IoLogoFacebook, label: "Facebook" },
  { icon: IoLogoInstagram, label: "Instagram" },
  { icon: IoLogoGithub, label: "Github" },
];

const paymentBadges = [
  { name: "Visa",       src: visaImg },
  { name: "Mastercard", src: mastercardImg },
  { name: "PayPal",     src: paypalImg },
  { name: "Apple Pay",  src: applePayImg },
  { name: "Google Pay", src: googlePayImg },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__grid">
          <div className="footer__brand">
            <Link to="/" className="footer__logo">SHOP.CO</Link>
            <p className="footer__tagline">
              We have clothes that suits your style and which you're proud to
              wear. From women to men.
            </p>
            <div className="footer__social">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href="/"
                    aria-label={social.label}
                    className="footer__social-link"
                    onClick={(e) => e.preventDefault()}
                  >
                    <Icon size={16} />
                  </a>
                );
              })}
            </div>
          </div>
          {footerLinks.map((col) => (
            <div key={col.title}>
              <h4 className="footer__col-title">{col.title}</h4>
              <ul className="footer__col-links">
                {col.links.map((linkItem) => (
                  <li key={linkItem.name}>
                    <Link to={linkItem.path} className="footer__col-link">
                      {linkItem.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="footer__bottom">
          <p className="footer__copyright">
            Shop.co © 2026, All Rights Reserved
          </p>
          <div className="footer__payments">
            {paymentBadges.map((badge) => (
              <div key={badge.name} className="footer__payment-badge" title={badge.name}>
                <img
                  src={badge.src}
                  alt={badge.name}
                  className="footer__payment-img"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

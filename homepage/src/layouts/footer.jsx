import Link from 'next/link';
import Social from '../components/social';
import Logo from '../components/logo';

const Footer = ({ siteData }) => (
  <div className="site-footer" id="footer">
    <div className="container footer-main">
      <div className="flex flex-row gap">
        {siteData.footerLinks.map((link) => (
          <Link
            href={link.link}
            key={link.text}
            target="_blank"
            rel="noopener noreferrer"
          >
            {link.text}
          </Link>
        ))}
      </div>
      <span>{siteData.title}</span>
      <Social />
      <div className="flex flex-row flex-justify-center logos margin-2-percent">
        <Logo text="Initiator" src="/images/campaignpage/logo__OCF.png" />
        <Logo text="Sponsor" src="/images/campaignpage/logo__FNF.png" />
      </div>
    </div>
  </div>
);

export default Footer;

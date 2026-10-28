import Link from 'next/link';

type DorahLogoProps = {
  href?: string;
  light?: boolean;
  className?: string;
};

/** The shared Dorah mark used across public and authenticated surfaces. */
export default function DorahLogo({ href = '/', light = false, className = '' }: DorahLogoProps) {
  const content = <>
    <span className="dorah-logo-mark" aria-hidden="true"><span /><span /><span /></span>
    <span>Dorah</span>
  </>;

  if (href.startsWith('/')) {
    return <Link href={href} className={`dorah-logo ${light ? 'dorah-logo-light' : ''} ${className}`.trim()} aria-label="Dorah home">{content}</Link>;
  }

  return <a href={href} className={`dorah-logo ${light ? 'dorah-logo-light' : ''} ${className}`.trim()} aria-label="Dorah home">{content}</a>;
}

import { IconFacebook } from '@/public/svgs';

export default function Facebook() {
  const shareOnFacebook = () => {
    const shareUrl =
      'https://www.facebook.com/sharer/sharer.php?u=https://your-website.com';
    window.open(shareUrl, '_blank');
  };

  return (
    <button
      className='h-18 w-18 tablet:h-22 tablet:w-22'
      onClick={shareOnFacebook}
    >
      <IconFacebook width='100%' height='100%' viewBox='0 0 22 22' />
    </button>
  );
}

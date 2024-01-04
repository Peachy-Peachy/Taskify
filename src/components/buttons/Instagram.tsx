import { IconInstagram } from '@/public/svgs';

export default function Instagram() {
  const shareOnInstagram = () => {
    const instagramUrl = 'instagram://app';
    window.location.href = instagramUrl;
  };

  return (
    <button
      className='h-18 w-18 tablet:h-22 tablet:w-22'
      onClick={shareOnInstagram}
    >
      <IconInstagram width='100%' height='100%' viewBox='0 0 22 22' />
    </button>
  );
}

import Image from 'next/image';
import { generateColor } from '@/utils/generateColor';
import { MembersProps } from '@/pages/api/mock';

const INDEX_POSITION = [
  'right-0 flex',
  'right-28 flex',
  'right-56 flex',
  'right-84 hidden pc:flex',
  'right-112 hidden pc:flex',
];

const CONTAINER_SIZE = [
  'w-40',
  'w-70',
  'w-100',
  'w-100 pc:w-130',
  'w-100 pc:w-160',
];

function Members({ members, totalCount }: MembersProps) {
  const extraCount = {
    pc: totalCount > 5 ? totalCount - 4 : 0,
    tablet: totalCount > 3 ? totalCount - 2 : 0,
  };
  const slicedMembers = members.slice(0, 5);
  const containerSize = CONTAINER_SIZE[slicedMembers.length - 1];

  return (
    <ul
      className={`relative flex h-42 items-center justify-end ${containerSize}`}
    >
      {slicedMembers.map((member, index) => (
        <li key={member.id} className='h-38'>
          {member.profileImageUrl ? (
            <ImageMember
              profileImageUrl={member.profileImageUrl}
              index={slicedMembers.length - index - 1}
            />
          ) : (
            <DefaultMember
              key={member.id}
              nickname={member.nickname}
              index={slicedMembers.length - index - 1}
            />
          )}
        </li>
      ))}
      {extraCount.pc > 0 && (
        <li className='border-solid-white subheading-normal absolute right-0 hidden h-38 w-38 items-center justify-center rounded-full bg-pink-light text-pink pc:flex'>
          {`+${extraCount.pc}`}
        </li>
      )}
      {extraCount.tablet > 0 && (
        <li className='border-solid-white subheading-normal absolute right-0 flex h-38 w-38 items-center justify-center rounded-full bg-pink-light text-pink pc:hidden'>
          {`+${extraCount.tablet}`}
        </li>
      )}
    </ul>
  );
}

export default Members;

interface ImageMember {
  index: number;
  profileImageUrl: string;
}

function ImageMember({ profileImageUrl, index }: ImageMember) {
  return (
    <div
      className={`border-solid-white absolute h-38 w-38 items-center justify-center overflow-hidden rounded-full ${INDEX_POSITION[index]}`}
    >
      <Image
        src={profileImageUrl}
        fill
        style={{
          objectFit: 'cover',
        }}
        alt='멤버 프로필 이미지'
      />
    </div>
  );
}

export const DEFAULT_PROFILE_COLOR = {
  green: 'bg-[#5be352]',
  purple: 'bg-[#bc57ff]',
  orange: 'bg-[#FFC85A]',
  blue: 'bg-[#9DD7ED]',
  pink: 'bg-[#ff6ee0]',
};

interface DefaultMember {
  index: number;
  nickname: string;
}

function DefaultMember({ nickname, index }: DefaultMember) {
  const initial = nickname[0].toUpperCase();
  const color = DEFAULT_PROFILE_COLOR[generateColor(initial)];

  return (
    <div
      className={`border-solid-white subheading-normal absolute h-38 w-38 items-center justify-center overflow-hidden rounded-full text-WHITE ${color} ${INDEX_POSITION[index]}`}
    >
      {initial}
    </div>
  );
}

import axios from 'axios';
import { useAtom, useAtomValue } from 'jotai';
import { useEffect } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import useRequest from '@/hooks/useRequest';
import { ImageUrlAtom } from '@/store/imageUrlAtom';
import { loginAtom } from '@/store/loginAtom';
import { ERROR_MESSAGES, REG_EXP } from '@/containers/Auth/validation';
import { Button } from '@/components/buttons';
import ImageDrop from '@/components/image-drop/ImageDrop';
import InputContainer from '@/components/inputs/InputContainer';

function ProfileManageBox() {
  return (
    <div className='box'>
      <div className='heading1-bold pb-32'>프로필</div>
      <Form />
    </div>
  );
}
export default ProfileManageBox;

interface FormValues {
  nickname?: string;
}

function Form() {
  const { profileImageUrl } = useAtomValue(ImageUrlAtom);
  const [loginInfo, setLoginInfo] = useAtom(loginAtom);
  const { handleSubmit, control, reset } = useForm<FormValues>({
    defaultValues: {
      nickname: loginInfo.nickname,
    },
    mode: 'onBlur',
  });

  const { fetch } = useRequest({
    skip: true,
    options: {
      url: 'users/me',
      method: 'put',
    },
  });

  const changeProfile: SubmitHandler<FormValues> = async (formData) => {
    const newProfile = {
      nickname: formData.nickname ?? '',
      ...(loginInfo.profileImageUrl !== profileImageUrl && {
        profileImageUrl,
      }),
    };

    const { error } = await fetch({
      data: newProfile,
    });

    if (error) {
      return;
    }

    setLoginInfo(newProfile);
  };

  useEffect(() => {
    reset({ nickname: loginInfo.nickname });
  }, [loginInfo]);

  return (
    <form noValidate onSubmit={handleSubmit(changeProfile)}>
      <div className='flex flex-col gap-24 pb-16 tablet:flex-row tablet:gap-16 tablet:pb-24'>
        <ImageDrop type='profile' initialImageUrl={loginInfo.profileImageUrl} />
        <div className='flex w-full flex-col gap-10'>
          <label htmlFor='email'>이메일</label>
          <input
            id='email'
            className='input mb-10'
            placeholder={loginInfo.email}
            disabled
          />
          <InputContainer<FormValues>
            control={control}
            name='nickname'
            placeholder={loginInfo.nickname}
            rules={{
              required: ERROR_MESSAGES.nickname.nicknameField,
              pattern: {
                value: REG_EXP.CHECK_NICKNAME,
                message: ERROR_MESSAGES.nickname.nicknamePattern,
              },
            }}
          >
            닉네임
          </InputContainer>
        </div>
      </div>
      <div className='flex justify-end'>
        <Button>변경</Button>
      </div>
    </form>
  );
}

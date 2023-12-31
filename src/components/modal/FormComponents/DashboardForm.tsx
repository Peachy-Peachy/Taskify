import { useAtom, useSetAtom } from 'jotai';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { DashboardProps } from 'src/types';
import useRequest from '@/hooks/useRequest';
import { dashboardUpdateAtom } from '@/store/dashboardUpdateAtom';
import { closeAllModals } from '@/store/modalAtom';
import { Button } from '@/components/buttons';
import ColorChip from '@/components/chips/ColorChip';
import InputContainer from '@/components/inputs/InputContainer';

interface Props {
  fetch?: () => void;
}

interface FormValues {
  dashboardName: string;
  selectedColor: string;
}

function DashboardForm({ fetch }: Props) {
  const setDashboardUpdateAtom = useSetAtom(dashboardUpdateAtom);
  const [, closeAll] = useAtom(closeAllModals);

  const { handleSubmit, control, formState } = useForm<FormValues>({
    defaultValues: {
      dashboardName: '',
      selectedColor: '',
    },
    mode: 'onBlur',
  });

  const { fetch: postData } = useRequest<DashboardProps>({
    skip: true,
    options: {
      url: 'dashboards/',
      method: 'post',
    },
  });

  const makeNewDashboard: SubmitHandler<FormValues> = async (formData) => {
    const { error } = await postData({
      data: {
        title: formData.dashboardName,
        color: formData.selectedColor,
      },
    });

    if (error) {
      console.error(error);
      return;
    }

    closeAll();
    fetch?.();
    setDashboardUpdateAtom(true);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    closeAll();
  };

  return (
    <form
      onSubmit={handleSubmit(makeNewDashboard)}
      className='mb-70 flex flex-col gap-30'
    >
      <h1 className='heading1-bold'>새로운 대시보드</h1>
      <div>
        <InputContainer<FormValues>
          control={control}
          name='dashboardName'
          placeholder='이름을 입력해 주세요'
          rules={{ required: '이름을 입력해 주세요' }}
        >
          대시보드 이름
        </InputContainer>
        <div className='my-20 text-14 text-red'>
          <Controller
            name='selectedColor'
            control={control}
            render={({ field }) => (
              <ColorChip
                onSelectColor={(color: string) => field.onChange(color)}
              />
            )}
            rules={{ required: '색상을 선택해주세요' }}
          />
        </div>
      </div>
      <div className='absolute bottom-0 flex gap-10 tablet:right-0'>
        <Button.Secondary size='lg' onClick={handleClick}>
          취소
        </Button.Secondary>
        <Button size='lg' type='submit' disabled={!formState.isValid}>
          생성
        </Button>
      </div>
    </form>
  );
}

export default DashboardForm;

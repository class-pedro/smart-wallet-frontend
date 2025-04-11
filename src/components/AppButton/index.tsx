interface IAppButtonProps {
  children: string;
  variant?: 'primary' | 'secondary' | 'next' | 'destructive';
  onClick: () => void;
}

export function AppButton({ children, variant, onClick }: IAppButtonProps) {
  switch (variant) {
    case 'primary':
      return (
        <button
          className='bg-swGreen500 px-6 pt-2 pb-3 rounded-xl buttonShadow shadow-swGreen700 hover:cursor-pointer hover:saturate-130'
          style={{
            boxShadow: '0px 5px 0px #377d02',
          }}
          onClick={onClick}
        >
          <span className='text-white'>{children}</span>
        </button>
      );

    case 'secondary':
      return (
        <button
          className='px-6 pt-2 pb-3 rounded-xl border-3 border-slate-600 hover:cursor-pointer hover:opacity-85'
          style={{
            boxShadow: '0px 5px 0px #475569',
          }}
          onClick={onClick}
        >
          <span className='text-slate-600'>{children}</span>
        </button>
      );

    case 'next':
      return (
        <button
          className='bg-[#00AEFF] px-6 pt-2 pb-3 rounded-xl font-semibold border-slate-600 hover:cursor-pointer hover:saturate-130'
          style={{
            boxShadow: '0px 5px 0px #006392',
          }}
          onClick={onClick}
        >
          <span className='text-white'>{children}</span>
        </button>
      );

    default:
      return (
        <button
          className='bg-swGreen500 px-6 pt-2 pb-3 rounded-xl buttonShadow hover:cursor-pointer hover:saturate-130'
          style={{
            boxShadow: '0px 5px 0px #377d02',
          }}
          onClick={onClick}
        >
          <span className='text-white'>{children}</span>
        </button>
      );
  }
}

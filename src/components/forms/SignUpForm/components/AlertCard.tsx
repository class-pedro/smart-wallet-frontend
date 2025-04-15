import { FaCircleCheck } from 'react-icons/fa6';
import { MdError } from 'react-icons/md';
import { MdCancel } from 'react-icons/md';

interface IAlertCard {
  type: 'success' | 'error' | 'warning';
  title?: string;
  message?: string;
}

export function AlertCard({ type, title, message }: IAlertCard) {
  const titleColor =
    type === 'warning'
      ? 'text-yellow-500'
      : type === 'error'
      ? 'text-red-400'
      : 'text-swBlue500';

  return (
    <div className='flex flex-col items-center gap-4 my-4'>
      {type === 'warning' ? (
        <MdError className='text-yellow-500 animate-pulse' size={52} />
      ) : type === 'error' ? (
        <MdCancel className='text-red-400 animate-pulse' size={52} />
      ) : (
        <FaCircleCheck className='text-swBlue500 animate-float' size={52} />
      )}
      {title && (
        <h1 className={`${titleColor} text-xl font-bold text-center`}>
          {title ?? ''}
        </h1>
      )}
      {message && <p className='text-center'>{message ?? ''}</p>}
    </div>
  );
}

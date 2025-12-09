'use client';

type MonthCarouselProps = {
  handleChangeMonth(operation: 'next' | 'prev'): void;
  year: number;
  offset: number;
  left: string;
  center: string;
  right: string;
};

export function MonthCarousel({
  handleChangeMonth,
  year,
  offset,
  left,
  center,
  right,
}: MonthCarouselProps) {
  return (
    <div className='w-full flex items-center justify-center gap-4'>
      <button
        className='bg-transparent p-2 w-10 h-10 rounded cursor-pointer hover:opacity-70'
        onClick={() => handleChangeMonth('prev')}
      >
        ❮
      </button>

      <div className='w-56 h-14 overflow-hidden flex flex-col items-center relative'>
        <div className='text-xs font mb-1'>{year}</div>

        <div
          className={`
            flex items-center justify-center gap-4 transition-transform duration-150
            ${offset === 1 ? '-translate-x-4 opacity-0' : ''}
            ${offset === -1 ? 'translate-x-4 opacity-0' : ''}
          `}
        >
          <span className='text-center text-xl bg-linear-to-l from-[#ffffffb6] to-[#ffffff19] text-transparent bg-clip-text'>
            {left}
          </span>

          <span className='w-16 text-center text-xl font-bold'>{center}</span>

          <span className='text-center text-xl bg-linear-to-r from-[#ffffffb6] to-[#ffffff19] text-transparent bg-clip-text'>
            {right}
          </span>
        </div>
      </div>

      <button
        className='bg-transparent p-2 w-10 h-10 rounded cursor-pointer hover:opacity-70'
        onClick={() => handleChangeMonth('next')}
      >
        ❯
      </button>
    </div>
  );
}

import React from 'react';

const TextoHrmsLogo = () => {
  return (
    <div className='flex items-center gap-2'>
      <div className='h-2 w-2 rounded-full bg-zinc-700 shadow-[0_0_10px_rgba(255,255,255,0.8)] animate-pulse ' />
      <span className='text-sm font-medium tracking-tighter text-zinc-700'>
        texto<span className='text-zinc-800 font-light'>HRMS</span>
      </span>
    </div>
  );
};

export default TextoHrmsLogo;

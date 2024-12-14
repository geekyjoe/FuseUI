import React, { useState } from 'react';
import { BulbOutlined, BulbFilled } from '@ant-design/icons';

function HoverButton() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      className="h-fit w-[170px] md:w-fit text-nowrap text-left p-2 rounded-full border-solid border hover:text-neutral-50 dark:border-2 dark:border-neutral-600 hover:bg-zinc-100 dark:hover:bg-zinc-700"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered ? (
        <BulbFilled className="text-amber-500 inline-flex p-0.5 h-5 w-5" />
      ) : (
        <BulbOutlined className="text-amber-500 inline-flex p-0.5 h-5 w-5" />
      )}
      <span className="text-sm p-1 inline-flex">Make a Plan</span>
    </button>
  );
}

export default HoverButton;

'use client';

import Image from 'next/image';
import { type ReactNode, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';

type tileProps = {
  img: string;
  imgAlt: string;
  width: number;
  height: number;
  reverce?: boolean;
  children?: ReactNode;
  delay?: number;
};
type TileChildProps = {
  btn: string | ReactNode;
  link: string;
  children?: ReactNode;
  linkProps?: {
    [key: string]: string | number | boolean;
  };
};

const Tile = ({ img, imgAlt, reverce, children, delay = 0 }: tileProps) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const style = reverce
    ? {
        clipPath: isMobile
          ? 'polygon(0 0, 100% 0, calc(100% - 5rem) 100%, 0 100%)'
          : 'polygon(0 0, 100% 0, calc(100% - 20rem) 100%, 0 100%)',
      }
    : {
        clipPath: isMobile
          ? 'polygon(5rem 0, 100% 0, 100% 100%, 0 100%)'
          : 'polygon(20rem 0, 100% 0, 100% 100%, 0 100%)',
      };

  return (
    <motion.div
      initial={{ x: -1000, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: 100,
        damping: 20,
        delay: delay,
      }}
      className={`flex h-60 w-full bg-gray-500 sm:h-80 ${reverce ? 'flex-row' : 'flex-row-reverse'}`}
    >
      <motion.div
        className="w-[70%] max-w-[70vw] bg-white sm:w-[65%] sm:max-w-[65vw]"
        style={style}
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ delay: delay + 0.2, duration: 0.5 }}
      >
        <Image
          src={img || '/placeholder.svg'}
          alt={imgAlt}
          width={300}
          height={100}
          className={`m-auto h-full w-full object-cover`}
        />
      </motion.div>
      <motion.div
        className="m-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.4, duration: 0.5 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

const TileChild = ({ btn, link, children, linkProps }: TileChildProps) => {
  return (
    <div className="m-2 text-center text-lg text-white sm:text-2xl">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.div>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        whileHover={{ scale: 1.05 }}
      >
        <Button className="mt-2 text-base sm:text-xl">
          <Link href={link} {...linkProps}>
            {btn}
          </Link>
        </Button>
      </motion.div>
    </div>
  );
};

const Top = () => {
  return (
    <>
      <Tile img="/1037680.jpg" imgAlt="" width={200} height={100} delay={0.2}>
        <TileChild btn="投稿する" link="/post">
          <p className="text-sm sm:text-xl md:text-2xl">あなたの作品を 世界中に広げよう</p>
        </TileChild>
      </Tile>
      <Tile img="/ssjs.png" imgAlt="" width={200} height={100} reverce={true} delay={0.8}>
        <TileChild
          btn={
            <>
              <Image
                src="/ssjs.svg"
                alt="ssjs"
                width={36}
                height={18}
                className="inline-block sm:h-[24px] sm:w-[48px]"
              />
              <span className="text-sm sm:text-xl">を導入する</span>
            </>
          }
          link="https://github.com/SketchShifter/sketchshifter_compiler"
          linkProps={{ rel: 'noopener noreferrer', target: '_blank' }}
        >
          <p className="text-sm sm:text-xl md:text-2xl">自分のWebで Processing</p>
        </TileChild>
      </Tile>
    </>
  );
};

export default Top;

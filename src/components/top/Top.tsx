'use client';

import Image from 'next/image';
import type { ReactNode } from 'react';
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
  const style = reverce
    ? {
        clipPath: 'polygon(0 0, 100% 0, calc(100% - 20rem) 100%, 0 100%)',
      }
    : {
        clipPath: 'polygon(20rem 0, 100% 0, 100% 100%, 0 100%)',
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
      className={`flex h-80 w-full bg-gray-500 ${reverce ? 'flex-row' : 'flex-row-reverse'}`}
    >
      <motion.div
        className="w-[65%] max-w-[65vw] bg-white"
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
    <div className="m-2 text-center text-2xl text-white">
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
        <Button className="mt-2 text-xl">
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
          <p>
            あなたの作品を
            <br />
            世界中に広げよう
          </p>
        </TileChild>
      </Tile>
      <Tile img="/ssjs.png" imgAlt="" width={200} height={100} reverce={true} delay={0.6}>
        <TileChild
          btn={
            <>
              <Image src="/ssjs.svg" alt="ssjs" width={48} height={24} className="inline-block" />
              を導入する
            </>
          }
          link="https://github.com/SketchShifter/sketchshifter_compiler"
          linkProps={{ rel: 'noopener noreferrer', target: '_blank' }}
        >
          <p>
            自分のWebで
            <br />
            Processing
          </p>
        </TileChild>
      </Tile>
    </>
  );
};

export default Top;

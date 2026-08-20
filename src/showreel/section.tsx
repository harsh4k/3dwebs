import { Zen_Kaku_Gothic_New } from 'next/font/google';
import { ShowreelStage } from './ShowreelStage';

const zen = Zen_Kaku_Gothic_New({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
});

export function ShowreelSection() {
  return <ShowreelStage className={zen.className} />;
}

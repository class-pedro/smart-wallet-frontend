import { ImageResponse } from 'next/og';
import { walletMark } from './icon-mark';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(walletMark(size.width), { ...size });
}

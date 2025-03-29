/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */
export namespace Block {
  export enum Type {
    download = 'download',
    image = 'image',
    text = 'text',
    video = 'video',
    youtube = 'youtube',
    vimeo = 'vimeo',
    location = 'location',
    audio = 'audio',
    link = 'link',
    tiktok = 'tiktok',
    instagram = 'instagram',
    facebook = 'facebook',
    twitter = 'twitter',
  }

  export interface Interface {
    type: Type,
    value: any,
    label: string,
    width?: number,
    height?: number,
  }
}

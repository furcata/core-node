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
  }

  export interface Interface {
    type: Type,
    value: any,
    label: string,
  }
}

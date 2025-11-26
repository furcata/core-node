/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */
export declare namespace Block {
    enum Type {
        download = "download",
        image = "image",
        text = "text",
        video = "video",
        youtube = "youtube",
        vimeo = "vimeo",
        location = "location",
        audio = "audio",
        link = "link",
        tiktok = "tiktok",
        instagram = "instagram",
        facebook = "facebook",
        twitter = "twitter"
    }
    interface Interface {
        type: Type;
        value: any;
        label: string;
        width?: number;
        height?: number;
    }
}

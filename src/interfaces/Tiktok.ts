export interface IPost {
  id: string;
  description: string;
  createdAt: string;
  height: number;
  width: number;
  duration: number;
  resolution: string;
  shareCount: number;
  likesCount: number;
  commentCount: number;
  playCount: number;
  downloadURL: string;
  cover?: string;
  dynamicCover?: string;
  playURL?: string;
  format?: string;
  author?: string;
  directVideoUrl?: string;
}

export interface IAuthor {
  uniqueId: string;
  id: number;
  avatar: string;
  signature?: string;
  user_created?: string;
  verified?: boolean;
}

export interface DataType {
  index: number;
  usernameAndId: {
    username: string,
    id: string
  };
  createdAt: string;
  image: string | undefined;
  views: number;
  likesCount: number;
  commentCount: number;
  desc: string;
}

export interface ICustomDownload {
  username: string,
  videoId: string
}
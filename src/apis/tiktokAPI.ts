import { apis, hostURL } from "../constants";
import { ICustomDownload } from "../interfaces/Tiktok";
import { post } from "../services/http.service";

export const getDataFromURL = (url: string) => {
  const body = { url };
  return post(apis.getDataFromURL, body);
}

export const getVideosFromUser = (username: string) => {
  if (username && username.charAt(0) === '@') {
    username = username.substring(1);
  }
  const body = { username };
  return post(apis.getVideosFromUser, body);
}

export const downloadVideoAPI = (username: string, id: string) => {
  if (username && username.charAt(0) !== '@') {
    username = `@${username}`;
  }
  const body = { username, id }
  return post(apis.download, body);
}

export const downloadAllAPI = (username: string, idList: String[]) => {
  if (username && username.charAt(0) !== '@') {
    username = `@${username}`;
  }
  const body = { username, idList }
  return post(apis.downloadAll, body);
}

export const customDownloadAPI = (body: ICustomDownload[]) => {
  return post(apis.customDownload, body);
}
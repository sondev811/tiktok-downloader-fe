import axios, { AxiosError, AxiosResponse } from "axios"
import { hostURL, status } from "../constants";

const getUrl = (endpoint: string) => {
  return `${hostURL}${endpoint}`;
}

const getHeaders = () => {
 const headers = {
    'Content-Type': 'application/json',
  };
  return headers;
}

const success = (response: AxiosResponse) => {
  return {
    status: status.success,
    result: response.data.result,
    message: ''
  }
}

export const post = async (endpoint: string, body: any) => {
  try {
    const options = {
      headers: getHeaders()
    };
    const bodyParse = JSON.stringify(body)
    const url = getUrl(endpoint);
    const response = await axios.post(url, bodyParse, options);
    return success(response);
  } catch (error: any) {
    return {
      status: status.failed,
      result: null,
      message: error?.response?.data?.message || 'Không thể kết nối tới server!!!'
    }
  }
}

export const downloadFile = async (url: string, username: string, videoId: string) => {
  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'blob',
    });
    const fileName = `${username}-${videoId}`;
    const blob = new Blob([response.data], { type: response.headers['content-type'] });
    const urlDownload = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = urlDownload;
    a.download = `${fileName}.mp4`;
    a.click();
    window.URL.revokeObjectURL(url);
    return status.success;
  } catch (error) {
    return status.failed;
    console.error('Error downloading content:', error);
  }
};
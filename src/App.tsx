import { DownloadOutlined } from '@ant-design/icons';
import { Button, Input, InputRef } from 'antd';
import { Ref, useRef, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import { downloadAllAPI, getDataFromURL, getVideosFromUser } from './apis/tiktokAPI';
import LinkDownload from './components/LinkDownload';
import TableList from './components/TableList';
import { searchTypes, status } from './constants';
import { downloadFile } from './services/http.service';
import { isValidURL } from './utils';
interface IPost {
  id: string;
  createTime: string;
  desc: string,
  music?: any,
  video: any,
  statistics?: any
  users: any
}

interface DataType {
  index: number;
  usernameAndId: {
    username: string,
    id: string
  };
  createTime: string;
  image: string;
  likeCount: number;
  commentCount: number;
  desc: string;
}

function App() {

  const [searching, setSearching] = useState<boolean>(false);
  const [searched, setSearched] = useState<boolean>(false);
  const [posts, setPosts] = useState<DataType[]>([]);
  const [searchType, setSearchType] = useState<string>('');
  const [downloading, setDownloading] = useState<boolean>(false);
  const [searchLinkData, setSearchLinkData] = useState('');

  const handlePost = (posts: IPost[], username: string) => {
    return posts.map((post: IPost, index: number) => {
      return {
        index: index + 1,
        usernameAndId: {
          username,
          id: post.id
        },
        createTime: post.createTime,
        desc: post.desc,
        image: post.video.cover,
        likeCount: post.statistics.likeCount,
        commentCount: post.statistics.commentCount
      }
    });
  }

  const search = async (keyword: string) => {
    if (!keyword || searching) return;
    const inputElement = document.querySelector('.ant-input-search input') as HTMLInputElement;
    if (inputElement) {
      inputElement.blur();
    }
    
    setPosts([]);
    setSearched(false);
    setSearching(true);
    const isURL = isValidURL(keyword);
    if (isURL) {
      const res = await getDataFromURL(keyword);
      setSearchType(searchTypes.videoLink);
      setSearching(false);
      setSearched(true);
      if (res.status === status.failed) {
        toast.error(res.message);
        return;
      }
      console.log(res.result);
      setSearchLinkData(res.result);
      return;
    }

    const res = await getVideosFromUser(keyword);
    setSearching(false);
    setSearchType(searchTypes.username);
    setSearched(true);
    if (res.status === status.failed) {
      toast.error(res.message);
      return;
    }
    const handledPost = handlePost(res.result.posts, res.result.users.username);
    setPosts(handledPost);
  }

  const downloadAll = async () => {
    try {
      setDownloading(true);
      const username = posts[0].usernameAndId.username;
      const idList = posts.map(post => post.usernameAndId.id);
      const response = await downloadAllAPI(username, idList);
      if (!response || response.status !== status.success || !response.result || !response.result.length) {
        throw Error();
      }
      for (const data of response.result) {
        await downloadFile(data.url, username, data.id);
      }
      setDownloading(false);
      toast.success(`Tải xuống thành công!!!`);
    } catch (error) {
      toast.error('Tải xuống tất cả không thành công');
      console.log(error);
    }
  }
 
  const { Search } = Input;

  return (
    <>
    <div className="App">
      <h2>Tiktok downloader</h2>
      <div className='search-container'>
        <Search 
          placeholder="Video link(https://www.tiktok.com/username/video/...) hoặc username(@username)" 
          onSearch={search}
          enterButton
          className={`${searching ? 'disabled' : ''}`}
          loading={searching}
        />
      </div>
    </div>
    {
      posts.length && !searching && searchType === searchTypes.username ?
      <div className='table-container'>
        <div className='download-all'>
          <p>Kết quả tìm được: {posts.length}</p>
          {
            searchType === searchTypes.username && posts.length ?
              <Button 
                onClick={() => downloadAll()} 
                type="primary" 
                className='button-download' 
                icon={<DownloadOutlined />} 
                loading={downloading}
                size='large'
              >
                { downloading ? `Đang tải xuống` : `Tải tất cả` }
              </Button> 
            : null
          }
        </div> 
        <TableList posts={posts}></TableList>
      </div>
      : null
    }
    {
      !searching && searchType === searchTypes.videoLink && searchLinkData ?
      <LinkDownload data={searchLinkData}/>
      : null
    }
    {
    searching ? 
      <div>
        <p className='not-exist-video'>Đang tìm kiếm...</p>
        <div className="stage">
          <div className="dot-flashing"></div>
        </div>
      </div>
    : null
    }
    {
    searched && !posts.length && !searchLinkData ? 
    <p className='not-exist-video'>Không tìm thấy người dùng hoặc video</p> : null
    }
   
    <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
    />
    </>
  );
}

export default App;

import { DownloadOutlined } from '@ant-design/icons';
import { Button, Input, InputRef, message } from 'antd';
import { Ref, useRef, useState } from 'react';
import './App.css';
import { downloadAllAPI, getDataFromURL, getVideosFromUser } from './apis/tiktokAPI';
import LinkDownload from './components/LinkDownload';
import TableList from './components/TableList';
import { searchTypes, status } from './constants';
import { downloadFile } from './services/http.service';
import { isValidURL } from './utils';
import { DataType, ICustomDownload, IPost } from './interfaces/Tiktok';
import InputAndTag from './components/InputAndTag';

function App() {

  const [searching, setSearching] = useState<boolean>(false);
  const [searched, setSearched] = useState<boolean>(false);
  const [posts, setPosts] = useState<DataType[]>([]);
  const [searchType, setSearchType] = useState<string>('');
  const [downloading, setDownloading] = useState<boolean>(false);
  const [searchLinkData, setSearchLinkData] = useState('');
  const [customDownLoad, setCustomDownload] = useState(false);
  const [listVideo, setListVideo] = useState<ICustomDownload[]>([]);


  const handlePost = (data: IPost[], username: string): DataType[] => {
    const handled = data.map((post: IPost, index: number) => {
      return {
        index: index + 1,
        usernameAndId: {
          username,
          id: post.id
        },
        createdAt: post.createdAt,
        desc: post.description,
        image: post.cover,
        views: post.playCount,
        likesCount: post.likesCount,
        commentCount: post.commentCount
      }
    });
    return handled;
  }

  const search = async (keyword: string) => {
    if (!keyword || searching) return;
    const inputElement = document.querySelector('.ant-input-search input') as HTMLInputElement;
    if (inputElement) {
      inputElement.blur();
    }
    setCustomDownload(false);
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
        message.error(res.message);
        return;
      }
      setSearchLinkData(res.result);
      return;
    }

    const res = await getVideosFromUser(keyword);
    setSearching(false);
    setSearchType(searchTypes.username);
    setSearched(true);
    if (res.status === status.failed) {
      message.error(res.message);
      return;
    }
    const handledPost = handlePost(res.result.posts, res.result.username);
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
      message.success(`Tải xuống thành công!!!`);
    } catch (error) {
      message.error('Tải xuống tất cả không thành công');
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
          placeholder="Video link hoặc username(@username)" 
          onSearch={search}
          enterButton
          className={`search-box ${searching ? 'disabled' : ''}`}
          loading={searching}
        />
        <Button 
          onClick={() => setCustomDownload(true)} 
          type="primary" 
          className='button-custom-dl' 
          icon={<DownloadOutlined />} 
          size='large'
        >
          Tải tùy chọn
        </Button> 
      </div>
    </div>
    {
      posts.length && !searching && searchType === searchTypes.username && !customDownLoad ?
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
      !searching && searchType === searchTypes.videoLink && searchLinkData && !customDownLoad ?
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
    
    {
      customDownLoad ? <InputAndTag data={listVideo} updateListVideo={setListVideo} /> : null
    }
    </>
  );
}

export default App;

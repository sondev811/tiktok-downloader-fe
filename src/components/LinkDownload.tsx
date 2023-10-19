import { DownloadOutlined, HeartOutlined, CommentOutlined, ShareAltOutlined } from '@ant-design/icons';
import { Button, message } from 'antd';
import { useState } from 'react';
import { status } from '../constants';
import { downloadFile } from '../services/http.service';

interface Props {
  data: any
}

const LinkDownload: React.FC<Props> = ({ data }) => {
  const [ downloading, setDownloading] = useState<boolean>(false);

  const download = async () => {
    try {
      if (!data || !data.video || !data.video.length 
        || !data.author.username || !data.id) {
        throw Error();
      }
      setDownloading(true);
      const progress = await downloadFile(data.video[0], data.author.username, data.id);
      if (progress !== status.success) {
        throw Error();
      }
      setDownloading(false);
      message.success(`Tải video thành công!!!`);
    } catch (error) {
      console.log(error);
      message.error('Tải video không thành công!!!');
    }
  }
  return (
    <div className='link-download-container'>
      <div className='info'>
        <img src={data?.author?.avatarThumb[0]} alt='avatar'/>
        <div>
          <h3>{data?.author?.nickname}</h3>
          <p>{data?.description}</p>
        </div>
      </div>
      <div className='download'>
          <Button 
            type="primary" 
            className='button-download' 
            icon={<DownloadOutlined />} 
            size='large'
            loading={downloading}
            onClick={download}
          >
            { downloading ? `Đang tải xuống` : `Tải video` }
          </Button> 
          <div className='stat'>
            <p>
              <HeartOutlined />
              { data?.statistics?.likeCount}
            </p>
            <p>
              <CommentOutlined />
              { data?.statistics?.commentCount}
            </p>
            <p>
              <ShareAltOutlined />
              { data?.statistics?.shareCount}
            </p>
          </div>
      </div>
    </div>
  );
};

export default LinkDownload;
import React, { ClipboardEvent, ClipboardEventHandler, useRef, useState } from 'react';
import { Tag, Input, Button, message } from 'antd';
import { ICustomDownload } from '../interfaces/Tiktok';
import { CloseCircleOutlined } from '@ant-design/icons';
import { customDownloadAPI } from '../apis/tiktokAPI';
import { status } from '../constants';
import { downloadFile } from '../services/http.service';

interface Props {
  data: ICustomDownload[];
  updateListVideo: React.Dispatch<React.SetStateAction<ICustomDownload[]>>
}

const InputAndTag: React.FC<Props> = (props) => {
  const { data, updateListVideo } = props;
  const inputRef = useRef<any>(null);
  const [content, setContent] = useState<string>('');
  const [downloading, setDownloading] = useState<boolean>(false);

  const onDeleteId = (videoId: string) => {
    const newList = data.filter(item => item.videoId !== videoId);
    updateListVideo(newList);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value);
  }

  const update = () => {
    if (!content) return;
    const multiLink = isMultiLink();
    if (multiLink && multiLink.length) {
      multiLink.forEach(item => {
        handleUpdate(item);
      })
      setContent('');
      return;
    }
    handleUpdate(content);
    setContent('');
  }

  const handleUpdate = (videoLink: string) => {
    const { username, videoId } = extractUsernameAndId(videoLink);
    if (!username || !videoId) return;
    if (checkIdExist(videoId)) {
      message.warning(`[id: ${videoId}] đã tồn tại`);
      return;
    }
    updateListVideo((prev) => {
      return [...prev, { username, videoId }];
    })
  }

  const isMultiLink = () => {
    if (!content) return;
    const multiLink = content.split(' ');
    const filterDuplicate = multiLink.filter((item, pos) => multiLink.indexOf(item) === pos);
    return filterDuplicate;
  }

  const checkIdExist = (videoId: string) => {
    return data.find(item => item.videoId === videoId);
  }

  const handleBlur = () => {
    update();
  }

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter' ) return;
    update();
  }

  const extractUsernameAndId = (videoLink: string) => {
    if (!videoLink) return {};
    const regexPattern = /@([^/]+)\/video\/(\d+)/;
    const match = videoLink.match(regexPattern);
    if (!match) return {};
    const username = match[1];
    const videoId = match[2];
    return { username, videoId };
  }

  const download = async() => {
    try {
      setDownloading(true);
      const res = await customDownloadAPI(data)
      if (!res || !res.result || res.status === status.failed) throw Error(res.message);
      for (const data of res.result) {
        await downloadFile(data.url, data.username, data.id);
      }
      setDownloading(false);
      message.success(`Tải xuống thành công!!!`);
    } catch (error: any) {
      message.error(error && error.message ? error.message : 'Lỗi server');
    }
  }

  return (
    <>
      <div className={`input-tag ${downloading ? 'block-change' : ''}`} onClick={() => inputRef.current.focus()}>
        {
          data.length ? data.map(item => {
            return (
              <Tag closable onClose={() => onDeleteId(item.videoId)} key={item.videoId} >
                <a href={`https://www.tiktok.com/@${item.username}/video/${item.videoId}`} target='_blank'>{ item.videoId }</a>
              </Tag>
            )
          }) : null
        }
        <Input 
          ref={inputRef} 
          placeholder='Nhập link video'
          value={content}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyUp={handleKeyUp}
        />
        { data.length ?
          <span onClick={() => updateListVideo([])} className='remove-custom-download'> <CloseCircleOutlined /></span>
          : null
        }
      </div>
      <div className='input-tag-download'>
        <Button 
          type="primary" 
          className='button-custom-dl' 
          size='large'
          disabled={!data.length}
          loading={downloading}
          onClick={download}
        >
          Tải tất cả
        </Button> 
      </div>
    </>
  );
}

export default InputAndTag;
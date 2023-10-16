import { CopyOutlined, DownloadOutlined, LoadingOutlined } from '@ant-design/icons';
import { Button, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { formatTime } from '../utils';
import { downloadFile } from '../services/http.service';
import { downloadVideoAPI } from '../apis/tiktokAPI';
import { status } from '../constants';
import { DataType } from '../interfaces/Tiktok';

interface LoadingState {
  [key: string]: boolean;
}


interface props {
  posts: DataType[];
}

const TableList: React.FC<props> = (props) => {
  const { posts } = props;
  const [loadingState, setLoadingState] = useState<LoadingState>({});

  const download = async (downloadInfo: { username: string, id: string, url: string }) => {
    try {
      const { username, id } = downloadInfo;

      setLoadingState((prevState) => ({ ...prevState, [id]: true }));

      const response = await downloadVideoAPI(username, id);
      if (response.status !== status.success || !response.result || !response.result.url || !response.result.url.no_wm) {
        toast.error(response.message);
        return;
      }
      const urlNoWaterMark = response.result.url.no_wm
      const progress = await downloadFile(urlNoWaterMark, username, id);

      setLoadingState((prevState) => ({ ...prevState, [id]: false }));
      if (progress !== status.success) {
        throw Error();
      }
      toast.success(`Tải video ${id} thành công!!!`);
    } catch (error) {
      console.log(error);
      setLoadingState((prevState) => ({ ...prevState, [downloadInfo.id]: false }));
      toast.error('Tải video không thành công!!!');
    }
  } 
  
  const columns: ColumnsType<DataType> = [
    {
      title: 'STT',
      dataIndex: 'index',
      render: (index) => {
        return(<p key={index}>{index}</p>)
      }
    },
    {
      title: 'id',
      dataIndex: 'usernameAndId',
      render: (data) => {
        return(<a key={data.id} className='link-to-tt' href={`https://www.tiktok.com/@${data.username}/video/${data.id}`} target="__blank">{data.id}</a>)
      }
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      render: (date: string) => {
        return(<p key={date}>{date}</p>)
      }
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'image',
      render: (url: string) => {
        return(<img style={{ width: '30px'}} src={url} />)
      }
    },
    {
      title: 'Số view',
      dataIndex: 'views',
    },
    {
      title: 'Số tim',
      dataIndex: 'likesCount',
    },
    {
      title: 'Số comment',
      dataIndex: 'commentCount',
    },
    {
      title: 'Miêu tả',
      dataIndex: 'desc',
      render: (desc: string) => {
        return(
          <p 
            style={{ 
              width: '300px', 
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              overflow: 'hidden'
            }}
          >
            {desc}
          </p>
        )
      }
    },
    {
      title: 'Hành động',
      dataIndex: "usernameAndId",
      render: (usernameAndId) => {
        return (
          <Button
            className='button-download'
            type="primary"
            icon={<DownloadOutlined />}
            loading={loadingState[usernameAndId.id]}
            size='large'
            onClick={(e) => download(usernameAndId)}
          />
        )
      }
    }
  ];
  

  return (
    <Table
      columns={columns}
      dataSource={posts}
    />
  );
};


export default TableList;
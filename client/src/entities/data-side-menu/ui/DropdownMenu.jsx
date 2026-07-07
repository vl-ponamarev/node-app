import { Dropdown, Space } from 'antd';
import React from 'react';
import {
  EditOutlined,
  ArrowRightOutlined,
  CopyOutlined,
  DeleteOutlined,
  DownloadOutlined,
  FolderAddOutlined,
  UploadOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import { handleMenuClick } from 'shared/lib';

const DropdownMenu = ({
  id,
  setSelectedMenuActionInfo,
  type,
  setOpen,
  isRenameButton,
  sideMenu,
  name,
  canModify = true,
}) => {
  const onClick = ({ key }) => {
    key && handleMenuClick({ key }, setSelectedMenuActionInfo, setOpen);
  };

  const items = [
    {
      key: `${id} new ${type} ${name}`,
      label: sideMenu && (
        <div key={`${id} new ${type}`} onClick={onClick}>
          <Space>
            <FolderAddOutlined />
            <span>New directory</span>
          </Space>
        </div>
      ),
    },
    {
      key: `${id} upload ${type} ${name}`,
      label: sideMenu && (
        <div key={`${id} upload ${type} ${name}`} onClick={onClick}>
          <Space>
            <UploadOutlined />
            <span>Upload files</span>
          </Space>
        </div>
      ),
    },
    {
      key: `${id} rename ${type} ${name}`,
      label: isRenameButton && canModify && (
        <div key={`${id} rename ${type} ${name}`} onClick={onClick}>
          <Space>
            <EditOutlined />
            <span>Rename</span>
          </Space>
        </div>
      ),
    },
    {
      key: `${id} move ${type} ${name}`,
      label: canModify && (
        <div key={`${id} move ${type} ${name}`} onClick={onClick}>
          <Space>
            <ArrowRightOutlined />
            <span>Move to</span>
          </Space>
        </div>
      ),
    },
    {
      key: `${id} copy ${type} ${name}`,
      label: canModify && (
        <div key={`${id} copy ${type} ${name}`} onClick={onClick}>
          <Space>
            <CopyOutlined />
            <span>Copy to </span>
          </Space>
        </div>
      ),
    },
    {
      key: `${id} download ${type} ${name}`,
      label: (
        <div key={`${id} download ${type} ${name}`} onClick={onClick}>
          <Space>
            <DownloadOutlined />
            <span>Download</span>
          </Space>
        </div>
      ),
    },
    {
      key: `${id} delete ${type} ${name}`,
      label: canModify && (
        <div key={`${id} delete ${type} ${name}`} onClick={onClick}>
          <Space>
            <DeleteOutlined />
            <span>Delete</span>
          </Space>
        </div>
      ),
    },
  ];

  return (
    <Dropdown menu={{ items, onClick }} trigger={['hover']}>
      <MoreOutlined className="action-button" style={{ fontSize: '20px' }} />
    </Dropdown>
  );
};

export default DropdownMenu;

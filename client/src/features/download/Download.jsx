import { Button } from 'antd';
import React, { useCallback, useEffect, useMemo } from 'react';
import { CloudDownloadOutlined, LoadingOutlined } from '@ant-design/icons';
import { FilesContext } from 'index';
import { observer } from 'mobx-react-lite';
import { useContext } from 'react';
import { useDownload } from 'shared/hooks/useDownload';

const Download = ({ selectedMenuActionInfo, setSelectedMenuActionInfo = () => {} }) => {
  const { filesStore } = useContext(FilesContext);
  const selectedKeys = filesStore.selectedRowKeysStore;

  const selectedFilesAndFolders = useMemo(
    () =>
      selectedKeys?.reduce(
        (acc, item) => {
          const currentItem = filesStore.files.find(file => file._id === item);
          if (currentItem) {
            acc.files.push(item);
          } else {
            acc.folders.push(item);
          }
          return acc;
        },
        { files: [], folders: [] },
      ),
    [selectedKeys, filesStore.files],
  );

  const downloadFiles = useDownload();
  const handleClick = useCallback(
    (selectedMenuActionInfo, setSelectedMenuActionInfo) => {
      selectedMenuActionInfo?.action === 'download' && downloadFiles(selectedFilesAndFolders);
      setSelectedMenuActionInfo(prev => {
        return { ...prev, action: '' };
      });
    },
    [downloadFiles, selectedFilesAndFolders],
  );

  useEffect(() => {
    handleClick(selectedMenuActionInfo, setSelectedMenuActionInfo);
  }, [selectedMenuActionInfo, handleClick, setSelectedMenuActionInfo]);

  return selectedMenuActionInfo?.action === 'download' ? null : (
    <Button
      style={{
        backgroundColor: '#1976d2',
        borderColor: '#1976d2',
        color: 'white',
      }}
      icon={<CloudDownloadOutlined />}
      onClick={() => downloadFiles(selectedFilesAndFolders)}
    >
      DOWNLOAD
      {filesStore.isLoading && <LoadingOutlined />}
    </Button>
  );
};

export default observer(Download);

import React, { useContext, useEffect, useState } from 'react';
import { FilesContext } from 'index';
import dayjs from 'dayjs';
import { observer } from 'mobx-react-lite';
import { DataTableView } from 'entities/index';
import { DataListView } from 'entities/index';

const DataViewComponent = ({ param, levelUp, setLevelUp }) => {
  const [initialData, setInitialData] = useState(null);
  const { filesStore } = useContext(FilesContext);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const rootFolder = filesStore.openFolder;
  const rootKey = filesStore.rootKey;

  useEffect(() => {
    filesStore.setSelectedRowKeysStore(selectedRowKeys);
  }, [selectedRowKeys, filesStore]);

  useEffect(() => {
    setSelectedRowKeys([]);
  }, [filesStore.openFolder]);

  useEffect(() => {
    if (filesStore && filesStore.folders && filesStore.files) {
      if (param) {
        const rootFolders = filesStore.folders
          .filter(item => item.rootFolderId === rootFolder)
          .map(item => {
            return {
              dataName: item.foldername,
              dataModified: dayjs(item.creationDate).format('DD.MM.YYYY HH:mm'),
              fileSize: '',
              id: item._id,
              type: 'folder',
              owner: item.owner,
            };
          });

        const rootFiles = filesStore.files
          .filter(item => item.folderId === rootFolder)
          .map(item => {
            return {
              dataName: item.originalname,
              dataModified: dayjs(item.dateModified).format('DD.MM.YYYY HH:mm'),
              fileSize: item.size,
              id: item._id,
              type: 'file',
              mimetype: item.mimetype,
              owner: item.owner,
            };
          });
        if (rootFolder === rootKey) {
          setInitialData([...rootFolders, ...rootFiles]);
        } else {
          setInitialData([
            { dataName: '...', id: 'back', type: 'back' },
            ...rootFolders,
            ...rootFiles,
          ]);
        }
      } else {
        const rootFolders = filesStore.folders
          .filter(item => item.rootFolderId === rootFolder)
          //   .sort((a, b) => a.foldername.localeCompare(b.foldername))
          .map(item => {
            return {
              dataName: item.foldername,
              dataModified: dayjs(item.creationDate).format('DD.MM.YYYY HH:mm'),
              fileSize: '',
              id: item._id,
              type: 'folder',
              owner: item.owner,
            };
          });

        const rootFiles = filesStore.files
          .filter(item => item.folderId === rootFolder)
          .map(item => {
            return {
              dataName: item.originalname,
              dataModified: dayjs(item.dateModified).format('DD.MM.YYYY HH:mm'),
              fileSize: item.size,
              id: item._id,
              type: 'file',
              mimetype: item.mimetype,
              owner: item.owner,
            };
          });
        if (rootFolder === '6799ec01536a01175c1ad097') {
          setInitialData([...rootFolders, ...rootFiles]);
        } else {
          setInitialData([
            { dataName: '...', id: 'back', type: 'back' },
            ...rootFolders,
            ...rootFiles,
          ]);
        }
      }
    }
  }, [
    filesStore,
    filesStore.folders,
    param,
    filesStore.selectedKeys,
    filesStore.files,
    filesStore.openFolder,
    rootFolder,
    rootKey,
  ]);

  useEffect(() => {
    setTimeout(() => {
      setSelectedRowKeys([]);
    }, 200);
  }, [filesStore.clearSelectedRowKeysButtonState]);

  useEffect(() => {
    if (filesStore && filesStore.folders) {
      const openFolderItem = filesStore.folders.find(item => item._id === filesStore.openFolder);

      if (openFolderItem) {
        const { rootFolderId } = openFolderItem;
        const parentFolder = filesStore.folders.find(item => item._id === rootFolderId);

        if (parentFolder) {
          filesStore.setOpenFolder(parentFolder._id);
        }
      }
    }
  }, [levelUp, filesStore]);

  return param ? (
    <DataListView
      initialData={initialData}
      setLevelUp={setLevelUp}
      selectedRowKeys={selectedRowKeys}
      setSelectedRowKeys={setSelectedRowKeys}
    />
  ) : (
    <DataTableView
      initialData={initialData}
      setLevelUp={setLevelUp}
      selectedRowKeys={selectedRowKeys}
      setSelectedRowKeys={setSelectedRowKeys}
    />
  );
};

export default observer(DataViewComponent);

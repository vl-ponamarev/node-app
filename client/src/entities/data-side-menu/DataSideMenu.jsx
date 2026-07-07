import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { FolderOutlined, FileOutlined } from '@ant-design/icons';
import { Menu } from 'antd';
import { FilesContext } from 'index';
import './DataMenu.css';
import DropdownMenu from './ui/DropdownMenu';
import { handleDeleteOk } from 'shared/lib';
import DeleteModal from 'shared/ui/modal/delete-modal/DeleteModal';
import { EditNameModal, MoveToCopyToModal } from 'entities/folder/ui';
import Download from 'features/download/Download';
import UploadFiles from 'features/uploadFile/UploadFiles';
import CreateDirectory from 'features/create-directory/CreateDirectory';

const DataSideMenu = () => {
  const { filesStore } = useContext(FilesContext);
  const canModify = useCallback(() => true, []);
  const [items, setItems] = useState([]);
  const [filesIds, setFilesIds] = useState([]);
  const rootKey = filesStore.rootKey;
  const [openStateKeys, setOpenStateKeys] = useState([rootKey]);
  const rootFolder = filesStore?.folders?.find(item => item.foldername === 'Folders');
  const refOpenKeysLength = useRef(0);
  const refOpenKeys = useRef(null);
  const [selectedMenuActionInfo, setSelectedMenuActionInfo] = useState({
    id: '',
    action: '',
    type: '',
  });
  const [open, setOpen] = useState(false);
  const [modalData, setModalData] = useState({
    method: '',
    dataToMove: [],
  });

  useEffect(() => {
    filesStore.getFolders();
    filesStore.getFiles();
  }, [filesStore]);

  useEffect(() => {
    if (filesStore.folders) {
      const map = {};
      const roots = [];

      filesStore.folders.forEach(item => {
        map[item._id] = { ...item, children: [] };
      });

      filesStore.folders.forEach(item => {
        if (item.rootFolderId !== rootFolder?._id) {
          const obj = map[item._id];
          map[item.rootFolderId]?.children.push({
            children: obj.children.length > 0 ? obj.children : null,
            key: obj._id,
            icon: <FolderOutlined />,
            label: (
              <div className="menu-item-wrapper">
                {obj.foldername}
                <div className="menu-item-dropdown">
                  <DropdownMenu
                    id={item._id}
                    setSelectedMenuActionInfo={setSelectedMenuActionInfo}
                    type={'folder'}
                    setOpen={setOpen}
                    isRenameButton={true}
                    sideMenu={true}
                    name={obj.foldername}
                    canModify={canModify(item)}
                  />
                </div>
              </div>
            ),
          });
        } else {
          const obj = map[item._id];
          roots.push({
            children: obj.children.length > 0 ? obj.children : null,
            key: obj._id,
            label: (
              <div className="menu-item-wrapper">
                {obj.foldername}
                <div className="menu-item-dropdown">
                  <DropdownMenu
                    id={item._id}
                    setSelectedMenuActionInfo={setSelectedMenuActionInfo}
                    type={'folder'}
                    setOpen={setOpen}
                    isRenameButton={true}
                    sideMenu={true}
                    name={obj.foldername}
                    canModify={canModify(item)}
                  />
                </div>
              </div>
            ),
            icon: <FolderOutlined />,
          });
        }
      });

      const files = filesStore.files
        .filter(item => item.folderId === rootFolder?._id)
        .map(item => {
          return {
            key: item._id,
            label: (
              <div className="menu-item-wrapper">
                {item.originalname}
                <div className="menu-item-dropdown">
                  <DropdownMenu
                    id={item._id}
                    setSelectedMenuActionInfo={setSelectedMenuActionInfo}
                    type={'file'}
                    setOpen={setOpen}
                    isRenameButton={true}
                    sideMenu={true}
                    name={item.filename}
                    canModify={canModify(item)}
                  />
                </div>
              </div>
            ),
            icon: <FileOutlined />,
          };
        });

      const filesId = filesStore.files.map(item => item._id);

      setFilesIds(filesId);

      const rootWithFiles = [...roots, ...files];

      const rootFolderPrepared = {
        key: rootFolder?._id,
        label: rootFolder?.foldername,
        icon: <FolderOutlined />,
        children: rootWithFiles,
      };

      setItems([rootFolderPrepared]);
      filesStore.setDataTree([{ ...rootFolderPrepared, children: [...roots] }]);
      if (filesStore.saveOpenKeys.status) {
        setOpenStateKeys(refOpenKeys.current);
        filesStore.setOpenFolder(filesStore.saveOpenKeys.folderId);
        filesStore.setSaveOpenKeys({
          status: false,
          folderId: null,
        });
      }
    }
  }, [
    filesStore,
    filesStore.folders,
    filesStore.files,
    rootFolder?._id,
    rootFolder?.foldername,
    canModify,
  ]);

  useEffect(() => {
    if (filesStore?.selectedKeys?.length === 0) {
      filesStore.setOpenFolder(rootKey);
    }
  }, [filesStore, filesStore.selectedKeys, rootKey]);

  useEffect(() => {
    const parentFolders = [];
    const getParentFolderId = (data, id) => {
      const foundItem = data?.find(item => item._id === id);
      if (foundItem) {
        return foundItem.rootFolderId;
      }
      return null;
    };
    const getParentFolderIds = (data, id) => {
      const folder = getParentFolderId(data, id);
      if (folder) {
        parentFolders.push(folder);
        getParentFolderIds(data, folder);
      }
    };
    getParentFolderIds(filesStore.folders, filesStore.openFolder);

    const result = parentFolders.filter(folder => folder !== 'null');
    if (result.length > 0) {
      setOpenStateKeys([filesStore.openFolder, ...result]);
      filesStore.setOpenFolderParentsList(result);
    }
  }, [filesStore, filesStore.openFolder]);

  const onOpenChange = openKeys => {
    if (openKeys.length >= refOpenKeysLength.current) {
      filesStore.setOpenFolder(openKeys[openKeys.length - 1]);
      filesStore.setSelectedKeys(openKeys);
      refOpenKeysLength.current = openKeys.length;
      refOpenKeys.current = openKeys;
      setOpenStateKeys(openKeys);
    } else if (openKeys.length < refOpenKeysLength.current) {
      let deselectedFolder;
      refOpenKeys.current.forEach(key => {
        if (!openKeys.includes(key)) {
          deselectedFolder = key;
        }
      });
      if (deselectedFolder !== rootKey) {
        const deselectedItem = filesStore.folders.find(item => item._id === deselectedFolder);
        if (!deselectedItem) return;
        const { rootFolderId, _id } = deselectedItem;

        const childFolders = [];

        const getChildFolderId = (data, id) => {
          return data.find(item => item.rootFolderId === id);
        };
        const getChildFolderIds = (data, id) => {
          const folder = getChildFolderId(data, id);
          if (folder) {
            childFolders.push(folder._id);
            getChildFolderIds(data, folder._id);
          }
        };
        getChildFolderIds(filesStore.folders, _id);

        if (childFolders.length > 0) {
          const newOpenStateKeys = [...openStateKeys]
            .filter(key => key !== deselectedFolder)
            .reduce((array, current) => {
              if (!childFolders.includes(current)) {
                return [...array, current];
              }
              return array;
            }, []);
          setOpenStateKeys(newOpenStateKeys);
          refOpenKeysLength.current = newOpenStateKeys.length;
          refOpenKeys.current = newOpenStateKeys;
        }

        filesStore.setOpenFolder(rootFolderId);
      } else {
        setOpenStateKeys([rootKey]);
        filesStore.setOpenFolder(rootKey);
        refOpenKeysLength.current = 0;
        refOpenKeys.current = null;
      }
    }
  };
  const onSelect = (openKeys, data) => {
    if (filesIds.includes(openKeys.key)) return;
    filesStore.setOpenFolder(openKeys.key);
    refOpenKeys.current = openKeys.keyPath;
    refOpenKeysLength.current = openKeys.keyPath.length;
  };

  const onDeselect = openKeys => {
    if (openKeys.key !== rootKey) {
      const deselectedItem = filesStore.folders.find(item => item._id === openKeys.key);
      if (!deselectedItem) return;
      filesStore.setOpenFolder(deselectedItem.rootFolderId);
      refOpenKeys.current = openKeys.keyPath.filter(key => key !== openKeys.key);
      refOpenKeysLength.current = refOpenKeys.current.length;
    }
  };

  useEffect(() => {
    setModalData({
      method: selectedMenuActionInfo?.action === 'move' ? 'move' : 'copy',
      dataToMove: [selectedMenuActionInfo.id],
    });
  }, [selectedMenuActionInfo.action, selectedMenuActionInfo.id]);

  const dataToRename = {
    type: selectedMenuActionInfo.type,
    id: selectedMenuActionInfo.id,
    name: selectedMenuActionInfo.name,
  };

  return (
    <>
      <Menu
        onOpenChange={onOpenChange}
        onSelect={onSelect}
        onDeselect={onDeselect}
        openKeys={openStateKeys}
        defaultOpenKeys={[rootKey]}
        style={{
          width: 400,
        }}
        selectedKeys={[filesStore.openFolder] ?? [rootKey]}
        mode="inline"
        items={items}
        selectable={true}
        danger={true}
      />
      {selectedMenuActionInfo?.action === 'new' && (
        <CreateDirectory isActionPanel={true} selectedMenuActionInfo={selectedMenuActionInfo} />
      )}
      {selectedMenuActionInfo?.action === 'upload' && (
        <UploadFiles
          isActionPanel={true}
          selectedMenuActionInfo={selectedMenuActionInfo}
          setSelectedMenuActionInfo={setSelectedMenuActionInfo}
        />
      )}
      {selectedMenuActionInfo?.action === 'delete' && (
        <DeleteModal
          selectedMenuActionInfo={selectedMenuActionInfo}
          setSelectedMenuActionInfo={setSelectedMenuActionInfo}
          handleDeleteOk={handleDeleteOk}
        />
      )}
      {selectedMenuActionInfo?.action === 'move' && (
        <MoveToCopyToModal
          open={open}
          setOpen={setOpen}
          data={modalData}
          setSelectedMenuActionInfo={setSelectedMenuActionInfo}
        />
      )}
      {selectedMenuActionInfo?.action === 'copy' && (
        <MoveToCopyToModal
          open={open}
          setOpen={setOpen}
          data={modalData}
          setSelectedMenuActionInfo={setSelectedMenuActionInfo}
        />
      )}
      {selectedMenuActionInfo?.action === 'rename' && (
        <EditNameModal
          open={open}
          setOpen={setOpen}
          method="edit"
          dataToRename={dataToRename}
          setSelectedMenuActionInfo={setSelectedMenuActionInfo}
        />
      )}
      {selectedMenuActionInfo?.action === 'download' && (
        <Download
          selectedMenuActionInfo={selectedMenuActionInfo}
          setSelectedMenuActionInfo={setSelectedMenuActionInfo}
        />
      )}
    </>
  );
};
export default observer(DataSideMenu);

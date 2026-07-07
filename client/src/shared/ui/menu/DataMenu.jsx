import { Menu } from 'antd';
import { observer } from 'mobx-react-lite';
import React, { useContext, useEffect, useState } from 'react';
import { FilesContext } from 'index';
import { FolderOutlined } from '@ant-design/icons';

const DataMenu = ({ setMenuValue, folders, method }) => {
  const { filesStore } = useContext(FilesContext);
  const [menu, setMenu] = useState([]);
  const [selectedKey, setSelectedKey] = useState(null);
  const [openKeys, setOpenKeys] = useState([]);
  const rootKey = filesStore.rootKey;
  const rootFolder = filesStore.folders.find(item => item.foldername === 'Folders');

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
            label: <div className="menu-item-wrapper">{obj.foldername}</div>,
            disabled: folders.includes(obj._id) && method === 'move',
          });
        } else {
          const obj = map[item._id];
          roots.push({
            children: obj.children.length > 0 ? obj.children : null,
            key: obj._id,
            label: <div className="menu-item-wrapper">{obj.foldername}</div>,
            icon: <FolderOutlined />,
            disabled: folders.includes(obj._id) && method === 'move',
          });
        }
      });

      const rootFolderPrepared = {
        key: rootFolder?._id,
        label: rootFolder?.foldername,
        icon: <FolderOutlined />,
        children: roots,
      };

      setMenu([{ ...rootFolderPrepared, children: [...roots] }]);
      setOpenKeys([rootKey]);
      setSelectedKey(rootKey);
    }
  }, [folders, filesStore.folders, method, rootFolder?._id, rootFolder?.foldername, rootKey]);

  const handleSelect = ({ key }) => {
    setSelectedKey(key);
    setMenuValue(key);
  };

  const handleOpenChange = keys => {
    setOpenKeys(keys);
    const latestOpenKey = keys.find(key => openKeys.indexOf(key) === -1);
    if (latestOpenKey) {
      setSelectedKey(latestOpenKey);
      setMenuValue(latestOpenKey);
    }
  };

  return (
    <Menu
      onSelect={handleSelect}
      onOpenChange={handleOpenChange}
      selectedKeys={[selectedKey]}
      openKeys={openKeys}
      mode="inline"
      style={{
        width: 400,
      }}
      items={menu}
      selectable={true}
    />
  );
};

export default observer(DataMenu);

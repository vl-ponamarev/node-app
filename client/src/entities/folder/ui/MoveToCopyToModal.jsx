import React, { useContext, useEffect, useRef, useState } from 'react';
import { Modal } from 'antd';
import Draggable from 'react-draggable';
import { observer } from 'mobx-react-lite';
import { FilesContext } from 'index';
import DataMenu from 'shared/ui/menu/DataMenu';
const MoveToCopyToModal = ({ open, setOpen, data, setSelectedMenuActionInfo = () => {} }) => {
  const [disabled, setDisabled] = useState(true);
  const [bounds, setBounds] = useState({
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
  });
  const [menuValue, setMenuValue] = useState('6799ec01536a01175c1ad097');
  const { filesStore } = useContext(FilesContext);
  const draggleRef = useRef(null);
  const [folders, setFolders] = useState([]);

  useEffect(() => {
    const folders = data?.dataToMove
      .map(item => {
        const currentItem = filesStore.folders.find(folder => folder?._id === item);
        return currentItem?._id;
      })
      .filter(folder => (folder ? folder : null));
    setFolders(folders);
  }, [data?.dataToMove, filesStore.folders]);

  const files = data?.dataToMove.filter(item => !folders.includes(item));
  const handleOk = e => {
    if (data?.method === 'move' && menuValue) {
      const items = { folders, files };
      const dataToMove = { rootFolderId: menuValue, items };

      filesStore.moveData(dataToMove);
    } else if (data?.method === 'copy' && menuValue) {
      const items = { folders, files };
      const dataToMove = { rootFolderId: menuValue, items };
      filesStore.copyData(dataToMove);
    }
    setSelectedMenuActionInfo(prev => {
      return { ...prev, action: '' };
    });
    setOpen(false);
    filesStore.setSelectedRowKeysStore([]);
  };
  const handleCancel = e => {
    setOpen(false);
    setSelectedMenuActionInfo(prev => {
      return { ...prev, action: '' };
    });
  };
  const onStart = (_event, uiData) => {
    const { clientWidth, clientHeight } = window.document.documentElement;
    const targetRect = draggleRef.current?.getBoundingClientRect();
    if (!targetRect) {
      return;
    }
    setBounds({
      left: -targetRect.left + uiData.x,
      right: clientWidth - (targetRect.right - uiData.x),
      top: -targetRect.top + uiData.y,
      bottom: clientHeight - (targetRect.bottom - uiData.y),
    });
  };

  return (
    <>
      <Modal
        title={
          <div
            style={{
              width: '100%',
              height: '100%',
              cursor: 'move',
            }}
            onMouseOver={() => {
              if (disabled) {
                setDisabled(false);
              }
            }}
            onMouseOut={() => {
              setDisabled(true);
            }}
            onFocus={() => {}}
            onBlur={() => {}}
          >
            Move or Copy
          </div>
        }
        open={open}
        onOk={handleOk}
        onCancel={handleCancel}
        modalRender={modal => (
          <Draggable
            disabled={disabled}
            bounds={bounds}
            nodeRef={draggleRef}
            onStart={(event, uiData) => onStart(event, uiData)}
          >
            <div ref={draggleRef}>{modal}</div>
          </Draggable>
        )}
      >
        <DataMenu setMenuValue={setMenuValue} folders={folders} method={data.method} />
      </Modal>
    </>
  );
};

export default observer(MoveToCopyToModal);

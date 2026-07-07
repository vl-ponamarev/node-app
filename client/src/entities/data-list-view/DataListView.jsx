import React, { useCallback, useContext, useEffect, useState } from 'react';
import './DataListView.css';
import MemoOneItem from './ui/OneItem';
import { FilesContext } from 'index';
import { Dropdown } from 'antd';
import DataAdditionalMenu from 'shared/ui/menu/DataAdditionalMenu';
import { handleDeleteOk } from 'shared/lib';
import DeleteModal from 'shared/ui/modal/delete-modal/DeleteModal';
import { EditNameModal, MoveToCopyToModal } from 'entities/folder/ui';
import Download from 'features/download/Download';

const DataListView = ({ initialData, setLevelUp, selectedRowKeys, setSelectedRowKeys }) => {
  const { filesStore } = useContext(FilesContext);
  const [clickTimeout, setClickTimeout] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedMenuActionInfo, setSelectedMenuActionInfo] = useState({
    id: '',
    action: '',
    type: '',
  });
  const [open, setOpen] = useState(false);
  const selectedKeys = filesStore.selectedRowKeysStore;
  const [modalData, setModalData] = useState({
    method: '',
    dataToMove: [],
  });
  const isRenameButton =
    selectedKeys.length > 0 && selectedKeys.length < 2 && selectedKeys[0] !== 'back';

  const handleCardClick = useCallback(
    (event, cardData) => {
      const { id } = cardData;
      event.preventDefault();
      if (event.type === 'contextmenu') {
        setContextMenu({
          mouseX: event.clientX,
          mouseY: event.clientY,
          record: cardData,
        });
        selectedRowKeys.includes(id) ? event.preventDefault() : setSelectedRowKeys([id]);
      }

      if (clickTimeout) {
        clearTimeout(clickTimeout);
        setClickTimeout(null);
        if (id !== 'back' && cardData.type === 'folder') {
          setSelectedRowKeys([]);
          filesStore.setOpenFolder(id);
          filesStore.setSelectedKeys([id]);
        } else if (cardData.type === 'file') {
          return;
        } else {
          setLevelUp(prev => !prev);
        }
      } else {
        const timeout = setTimeout(() => {
          setClickTimeout(null);
          if (event.ctrlKey) {
            setSelectedRowKeys(prevSelectedRowKeys => {
              if (prevSelectedRowKeys.includes(id)) {
                return prevSelectedRowKeys.filter(key => key !== id);
              }
              return [...prevSelectedRowKeys, id];
            });
          } else if (event.type === 'click') {
            setSelectedRowKeys([id]);
          }
        }, 200);
        setClickTimeout(timeout);
      }
    },
    [clickTimeout, setSelectedRowKeys, filesStore, selectedRowKeys, setLevelUp],
  );
  useEffect(() => {
    setModalData({
      method: selectedMenuActionInfo?.action === 'move' ? 'move' : 'copy',
      dataToMove: selectedKeys,
    });
  }, [selectedMenuActionInfo.action, selectedKeys]);

  const dataToRename = {
    type: selectedMenuActionInfo.type,
    id: selectedMenuActionInfo.id,
    name: contextMenu?.record?.dataName,
  };

  return (
    <div className="data-list-view">
      {initialData?.map(item => {
        return (
          <MemoOneItem
            key={item.id}
            cardData={item}
            handleCardClick={handleCardClick}
            selectedCards={selectedRowKeys}
          />
        );
      })}

      {contextMenu && (
        <Dropdown
          overlay={() =>
            DataAdditionalMenu(
              contextMenu?.record?.id,
              setSelectedMenuActionInfo,
              contextMenu?.record?.type,
              setOpen,
              isRenameButton,
              false,
              true,
            )
          }
          trigger={['click']}
          visible
          onVisibleChange={visible => !visible && setContextMenu(null)}
          getPopupContainer={triggerNode => triggerNode.parentNode}
        >
          <div
            style={{
              position: 'absolute',
              top: contextMenu.mouseY,
              left: contextMenu.mouseX,
              zIndex: 10000,
              backgroundColor: 'white',
              border: '1px solid #ccc',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            }}
          />
        </Dropdown>
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
    </div>
  );
};

export default DataListView;

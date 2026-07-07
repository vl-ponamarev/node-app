import React, { useContext, useEffect, useState } from 'react';
import { Table, Dropdown, Flex } from 'antd';
import './DataTable.css';
import { FilesContext } from 'index';
import dayjs from 'dayjs';
import { observer } from 'mobx-react-lite';
import { FolderOutlined, MoreOutlined, FileOutlined, ArrowUpOutlined } from '@ant-design/icons';
import DataAdditionalMenu from 'shared/ui/menu/DataAdditionalMenu';
import { handleDeleteOk } from 'shared/lib';
import DeleteModal from 'shared/ui/modal/delete-modal/DeleteModal';
import { EditNameModal, MoveToCopyToModal } from 'entities/folder/ui';
import Download from 'features/download/Download';

const DataTable = ({ initialData, setLevelUp, selectedRowKeys, setSelectedRowKeys }) => {
  const { filesStore } = useContext(FilesContext);
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedMenuActionInfo, setSelectedMenuActionInfo] = useState({
    id: '',
    action: '',
    type: '',
  });
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const selectedKeys = filesStore.selectedRowKeysStore;
  const [modalData, setModalData] = useState({
    method: '',
    dataToMove: [],
  });
  const isRenameButton =
    selectedKeys.length > 0 && selectedKeys.length < 2 && selectedKeys[0] !== 'back';

  const columns = [
    {
      title: '',
      dataIndex: 'icon',
      key: 'icon',
      render: (text, record) => {
        if (record.type === 'folder') {
          return <FolderOutlined />;
        } else if (record.type === 'file') {
          return <FileOutlined />;
        } else if (record.type === 'back') {
          return <ArrowUpOutlined />;
        }
        return null;
      },
      width: '2%',
    },
    {
      title: 'Name',
      dataIndex: 'dataName',
      key: 'dataName',
      sorter: (a, b) => a.dataName.localeCompare(b.dataName),
    },
    {
      title: 'Data Modified',
      dataIndex: 'dataModified',
      key: 'dataModified',
      sorter: (a, b) => (dayjs(a.dataModified).isBefore(dayjs(b.dataModified)) ? -1 : 1),
      width: '20%',
    },
    {
      title: 'File Size',
      dataIndex: 'fileSize',
      key: 'fileSize',
      sorter: (a, b) => a.fileSize - b.fileSize,
      width: '15%',
    },
    {
      title: 'File Type',
      dataIndex: 'mimetype',
      key: 'mimetype',
      // sorter: (a, b) => a.mimetype.localeCompare(b.mimetype),
      width: '10%',
    },

    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => {
        if (record.type === 'folder' || record.type === 'file') {
          const handleActionClick = () => {
            selectedRowKeys.includes(record.id)
              ? setSelectedRowKeys(prev => [...prev])
              : setSelectedRowKeys([record.id]);
            setItemName(record.dataName);
          };
          return (
            <Dropdown
              // disabled
              overlay={DataAdditionalMenu(
                record?.id,
                setSelectedMenuActionInfo,
                record?.type,
                setOpen,
                isRenameButton,
                false,
                true,
              )}
              trigger={['click']}
            >
              <span onClick={handleActionClick}>
                <MoreOutlined className="action-button" style={{ fontSize: '20px' }} />
              </span>
            </Dropdown>
          );
        } else if (record.type === 'back') {
          return null;
        }
        onclick = record => {
          setSelectedRowKeys([record.id]);
        };
      },
      width: '2%',
    },
  ];

  const handleRowContextMenu = (event, record) => {
    const { id } = record;
    event.preventDefault();
    if (event.type === 'contextmenu') {
      setContextMenu({
        mouseX: event.clientX,
        mouseY: event.clientY,
        record,
      });
      selectedRowKeys.includes(id) ? event.preventDefault() : setSelectedRowKeys([id]);
    }
  };

  const onSelectChange = newSelectedRowKeys => {
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    onSelect: (record, selected, selectedRows) => {
      const newSelectedRowObjects = [...filesStore.selectedRowObjects];
      if (selectedRowKeys.includes(record.id)) {
        filesStore.setSelectedRowObjects(newSelectedRowObjects.filter(obj => obj.id !== record.id));
      } else {
        newSelectedRowObjects.push({ record });
        filesStore.setSelectedRowObjects(newSelectedRowObjects);
      }
    },
    onSelectAll: (selected, selectedRows, changeRows) => {
      if (selected) {
        filesStore.setSelectedRowObjects([...filesStore.selectedRowObjects, ...changeRows]);
      } else {
        filesStore.setSelectedRowObjects([]);
      }
    },
    getCheckboxProps: record => ({
      disabled: record.type === 'back',
    }),
  };
  const hasSelected = selectedRowKeys.length > 0;

  useEffect(() => {
    setModalData({
      method: selectedMenuActionInfo?.action === 'move' ? 'move' : 'copy',
      dataToMove: selectedKeys,
    });
  }, [selectedMenuActionInfo.action, selectedKeys]);

  const dataToRename = {
    type: selectedMenuActionInfo.type,
    id: selectedMenuActionInfo.id,
    name: itemName,
  };

  return (
    <Flex gap="middle" vertical>
      <Flex align="center" gap="middle">
        {hasSelected ? `Selected ${selectedRowKeys.length} items` : null}
      </Flex>
      <Table
        rowKey="id"
        rowSelection={rowSelection}
        columns={columns}
        dataSource={initialData}
        onRow={(record, index) => {
          return {
            onContextMenu: event => handleRowContextMenu(event, record),
            onDoubleClick: () => {
              const { id } = record;
              if (id !== 'back' && record.type === 'folder') {
                setSelectedRowKeys([]);
                filesStore.setOpenFolder(id);
                filesStore.setSelectedKeys([id]);
              } else if (record.type === 'file') {
                return;
              } else {
                setLevelUp(prev => !prev);
              }
            },
          };
        }}
      />
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
    </Flex>
  );
};

export default observer(DataTable);

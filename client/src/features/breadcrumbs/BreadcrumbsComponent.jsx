import { Breadcrumb } from 'antd'
import React, { useContext, useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { FilesContext } from 'index'

const BreadcrumbsComponent = () => {
  const { filesStore } = useContext(FilesContext)
  const rootFolderId = '6799ec01536a01175c1ad097';
  const [foldersList, setFoldersList] = useState([
    { foldername: 'Folders', id: rootFolderId },
  ])

  const handleBreadcrumbClick = e => {
    if (e.target.dataset.id === rootFolderId) {
      setFoldersList([{ foldername: 'Folders', id: rootFolderId }]);
    }
    filesStore.setOpenFolder(e.target.dataset.id);
  };

  useEffect(() => {
    const data = []

    filesStore.openFolderParentsList.forEach((item) => {
      if (item) {
        const currentFolder = filesStore.folders.find(
          (folder) => folder._id === item,
        )
        data.push({
          foldername: currentFolder?.foldername,
          id: currentFolder?._id,
        })
      }
    })
    if (filesStore.openFolder !== rootFolderId) {
      const folder = filesStore.folders.find(
        (item) => item._id === filesStore.openFolder,
      )
      data.unshift({ foldername: folder?.foldername, id: folder?._id })
      setFoldersList(data)
    } else {
      setFoldersList([{ foldername: 'Folders', id: rootFolderId }])
    }
  }, [filesStore.openFolderParentsList, filesStore.openFolder, filesStore.folders])

  return (
    <Breadcrumb
      style={{
        margin: '20px 0',
        cursor: 'pointer',
      }}
      onClick={handleBreadcrumbClick}
    >
      {foldersList.reverse().map((item) => (
        <Breadcrumb.Item key={item.id} data-id={item.id}>
          {item.foldername}
        </Breadcrumb.Item>
      ))}
    </Breadcrumb>
  )
}

export default observer(BreadcrumbsComponent)

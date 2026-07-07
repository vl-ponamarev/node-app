import React from 'react'
import { CloudUploadOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { UserContext, FilesContext } from 'index'
import { useEffect } from 'react'
import { observer } from 'mobx-react-lite'

const UploadFiles = ({ isActionPanel = false, selectedMenuActionInfo }) => {
  const { userStore } = React.useContext(UserContext);
  const { filesStore } = React.useContext(FilesContext);
  const [files, setFiles] = React.useState(null);
  const fileInputRef = React.useRef(null);
  const rootKey = filesStore.rootKey;
  const fileFolder = filesStore.openFolder;

  const handleFileChange = event => {
    setFiles(event.target.files);
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  useEffect(() => {
    isActionPanel && handleClick();
  }, [selectedMenuActionInfo, isActionPanel]);

  useEffect(() => {
    const handleSave = async () => {
      if (files && files.length > 0) {
        const formData = new FormData();
        formData.append('owner', userStore?.user?.id);
        formData.append('folder', fileFolder);
        for (let i = 0; i < files.length; i++) {
          formData.append('mediacontent', files[i]);
        }

        try {
          const response = await filesStore.saveFiles(formData);
          if (response.status === 200 && response.data) {
            filesStore.setSaveOpenKeys({
              status: true,
              folderId: response.data[0].folderId,
            });
          }
        } catch (error) {
          console.error('Error uploading files:', error);
        }
      }
    };
    handleSave();
  }, [files, userStore?.user?.id, fileFolder, filesStore]);

  return (
    <>
      {!isActionPanel && (
        <Button
          style={{
            backgroundColor: filesStore.openFolder === rootKey ? 'gray' : '#1976d2',
            borderColor: '#1976d2',
            color: 'white',
          }}
          disabled={filesStore.openFolder === rootKey}
          icon={<CloudUploadOutlined />}
          onClick={handleClick}
        >
          UPLOAD FILES
        </Button>
      )}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        style={{
          display: 'none',
        }}
        onChange={handleFileChange}
      />
    </>
  );
};

export default observer(UploadFiles);

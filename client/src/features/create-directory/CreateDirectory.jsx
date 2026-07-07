import { Button } from 'antd'
import React, { useState, useEffect } from 'react';
import { FolderAddOutlined } from '@ant-design/icons';
import { EditNameModal } from 'entities/folder/ui';

const CreateDirectory = ({ isActionPanel = false, selectedMenuActionInfo }) => {
  const [open, setOpen] = useState(false);

  const onClick = () => {
    setOpen(true);
  };
  useEffect(() => {
    isActionPanel && onClick();
  }, [selectedMenuActionInfo, isActionPanel]);

  return (
    <>
      {!isActionPanel && (
        <Button
          style={{
            backgroundColor: '#1976d2',
            borderColor: '#1976d2',
            color: 'white',
          }}
          icon={<FolderAddOutlined />}
          onClick={onClick}
        >
          NEW FOLDER
        </Button>
      )}
      {open && <EditNameModal open={open} setOpen={setOpen} method="create" />}
    </>
  );
};

export default CreateDirectory

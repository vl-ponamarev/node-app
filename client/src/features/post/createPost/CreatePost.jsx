import React, { useContext, useState } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField
} from '@material-ui/core';
import { Button } from '@mui/material';
import { Context, PostContext } from 'index';

import '../../../app/styles/styles.css';

export function CreatePost({ open, setOpen }) {
  const { store } = useContext(Context);
  const { postStore } = useContext(PostContext);
  const [formData, setFormData] = useState({
    author: store.user.id,
    title: '',
    content: '',
    mediacontent: null
  });
  const [selectedFileName, setSelectedFileName] = useState('');

  const handleClose = () => setOpen(false);
  const handleSave = async () => {
    await postStore.createOne(formData);
    postStore.getPosts();
    handleClose();
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = e => {
    const file = e.target.files[0];
    setSelectedFileName(file.name);
    setFormData(prev => ({ ...prev, mediacontent: file }));
  };

  const handleClick = () => {
    setSelectedFileName('');
    setFormData(prev => ({ ...prev, mediacontent: null }));
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title">Добавить пост</DialogTitle>
      <DialogContent>
        <TextField
          value={formData.title}
          onChange={handleChange}
          id="title"
          name="title"
          label="Title"
          type="text"
          fullWidth
        />

        <TextField
          value={formData.text}
          onChange={handleChange}
          id="content"
          name="content"
          label="Text"
          type="text"
          fullWidth
        />
        {selectedFileName ? (
          <>
            <label htmlFor="fileUpload" className="fileUploadLabel">
              Выберете файл
            </label>{' '}
            <div className="container">
              <p>Файл для загрузки: {selectedFileName}</p>
              <img
                onClick={handleClick}
                src="system-solid-29-cross.gif"
                alt="img"
                className="cencelBtn"
              />
            </div>
          </>
        ) : (
          <label htmlFor="fileUpload" className="fileUploadLabel">
            Выберете файл
          </label>
        )}
        <input
          id="fileUpload"
          type="file"
          accept="image/*, video/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSave}>Accept</Button>
        <Button onClick={handleClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}

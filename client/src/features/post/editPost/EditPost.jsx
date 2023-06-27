import * as React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';
import { TextField } from '@mui/material';
import { PostContext } from 'index';
import '../../../app/styles/styles.css';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const EditPost = observer(() => {
  const { postStore } = React.useContext(PostContext);
  const navigate = useNavigate();

  const location = useLocation();
  const { prop1, prop2, prop3 } = location.state;

  const [formData, setFormData] = React.useState({
    title: prop1,
    content: prop2,
    mediacontent: null
  });

  const [selectedFileName, setSelectedFileName] = React.useState(null);

  const handleClose = () => {
    postStore.setEditButtonClicked(false);
    navigate('/');
  };

  const handleFileChange = e => {
    const file = e.target.files[0];
    setSelectedFileName(file.name);
    setFormData(prev => ({ ...prev, mediacontent: file }));
  };

  const handleSave = async () => {
    await postStore.editOne(prop3, formData);
    postStore.getPosts();
    postStore.setEditButtonClicked(false);
    navigate('/');
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClick = () => {
    setSelectedFileName('');
    setFormData(prev => ({ ...prev, mediacontent: null }));
  };

  return (
    <div>
      <Dialog
        fullScreen
        open={postStore.isEditButtonClicked}
        onClose={handleClose}
        TransitionComponent={Transition}
      >
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography
              sx={{ ml: 2, flex: 1 }}
              variant="h6"
              component="div"
            ></Typography>
            <Button autoFocus color="inherit" onClick={handleSave}>
              Сохранить
            </Button>
          </Toolbar>
        </AppBar>

        <TextField
          sx={{ m: 6, width: '55ch' }}
          label="Title"
          name="title"
          multiline
          rows={4}
          value={formData.title}
          defaultValue={prop1}
          onChange={handleChange}
        />
        <TextField
          sx={{ m: 6, width: '55ch' }}
          label="Text"
          name="content"
          multiline
          rows={4}
          value={formData.text}
          defaultValue={prop2}
          onChange={handleChange}
        />
        {selectedFileName ? (
          <>
            <label htmlFor="fileUpload" className="fileUploadLabelEdit">
              Выберете файл
            </label>{' '}
            <div className="containerEdit">
              <p>Файл для загрузки: {selectedFileName}</p>
              <img
                onClick={handleClick}
                src={'/system-solid-29-cross.gif'}
                alt="X"
                className="cencelBtn"
              />
            </div>
          </>
        ) : (
          <label htmlFor="fileUpload" className="fileUploadLabelEdit">
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
      </Dialog>
    </div>
  );
});

export default EditPost;

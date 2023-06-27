import React, { useContext, useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { PostContext } from 'index';
import CardItem from 'shared/ui/card/Card';
import '../../app/styles/styles.css';
import { CreatePost } from 'features/post/createPost';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';
import { Button } from '@mui/material';
import PaginationOutlined from 'features/post/pagination/ui/Pagination';
import countPages from 'features/post/pagination/lib/countPages';
import elementsToRender from 'features/post/pagination/lib/elementsToRender';

function MainPage() {
  const { postStore } = useContext(PostContext);
  useEffect(() => {
    const getPosts = async () => {
      await postStore.getPosts();
    };
    getPosts();
  }, [postStore]);

  const [page, setPage] = useState(1);
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const [open, setOpen] = useState(false);
  const handleClickOpen = () => {
    setOpen(true);
  };

  const [isOpen, setIsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageClick = image => {
    setSelectedImage(image);
    setIsOpen(true);
  };
  const pages = countPages(postStore.post.length);

  const posts = useMemo(
    () => elementsToRender(postStore.post, page),
    [page, postStore.post]
  );

  return (
    <div className="main">
      <div className="topContainer">
        <div className="buttonContainer">
          <Button variant="outlined" size="medium" onClick={handleClickOpen}>
            Добавить пост
          </Button>
          {open && <CreatePost {...{ open, setOpen }} />}
        </div>
        <PaginationOutlined
          count={pages}
          page={page}
          onChange={handlePageChange}
        />
        {isOpen && (
          <Lightbox
            mainSrc={selectedImage}
            onCloseRequest={() => setIsOpen(false)}
          />
        )}
        <div className=" gridContainer">
          {posts.map(el => (
            <CardItem
              key={el._id}
              id={el._id}
              title={el.title}
              content={el.content}
              user={el.user}
              file={el.file}
              date={new Date(el.publicationDate)}
              handleImageClick={handleImageClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default observer(MainPage);

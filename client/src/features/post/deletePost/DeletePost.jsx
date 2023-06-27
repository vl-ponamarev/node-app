import { Button, CardActions } from '@mui/material';
import { PostContext } from 'index';
import React, { useContext } from 'react';

export default function DeletePost({ postId }) {
  const { postStore } = useContext(PostContext);

  const deleteHandler = async postId => {
    await postStore.deleteOne(postId);
    postStore.getPosts();
  };

  return (
    <CardActions>
      <Button
        variant="outlined"
        color="error"
        onClick={() => deleteHandler(postId)}
      >
        Удалить
      </Button>
    </CardActions>
  );
}

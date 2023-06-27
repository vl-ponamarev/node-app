import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import DeletePost from 'features/post/deletePost/DeletePost';
import { Context, PostContext } from 'index';
import { Button, CardActions } from '@mui/material';

const CardItem = observer(props => {
  const { postStore } = React.useContext(PostContext);
  const navigate = useNavigate();
  const { store } = React.useContext(Context);
  const { id, date, title, content, user } = props;
  const formattedDate = date.toLocaleString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  });

  const handleClickEdit = () => {
    postStore.setEditButtonClicked(true);
    navigate(`/posts/${props.id}`, {
      state: {
        prop1: title,
        prop2: content,
        prop3: id
      }
    });
  };

  return (
    <Card sx={{ width: 345, height: 450 }}>
      <CardMedia
        sx={{ height: 140, cursor: 'pointer' }}
        image={`/upload/${props.file}`}
        title="green iguana"
        onClick={() => props.handleImageClick(`/upload/${props.file}`)}
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {title}
        </Typography>

        <Typography
          sx={{ height: 100, overflow: 'auto' }}
          variant="body2"
          color="text.secondary"
        >
          {content}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          {user}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {formattedDate}
        </Typography>
      </CardContent>
      {store.user.email === user && (
        <CardActions>
          <Button variant="outlined" size="medium" onClick={handleClickEdit}>
            Редактировать
          </Button>
          <DeletePost postId={props.id} />
        </CardActions>
      )}
    </Card>
  );
});

export default CardItem;

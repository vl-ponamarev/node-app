import React, { useContext, useState } from 'react';
import { CssVarsProvider } from '@mui/joy/styles';
import Sheet from '@mui/joy/Sheet';
import Typography from '@mui/joy/Typography';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import Button from '@mui/joy/Button';
import { NavLink } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Context } from '../../index';
import { ModeToggle } from 'shared/lib/modeToggle';

function SignupForm() {
  const [input, setInput] = useState({});
  const { store } = useContext(Context);

  const inputHandler = e => {
    setInput(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const submitHandler = () => {
    store.registration(input);
  };

  return (
    <CssVarsProvider>
      <main>
        <ModeToggle />
        <Sheet
          sx={{
            width: 300,
            mx: 'auto', // margin left & right
            my: 4, // margin top & botom
            py: 3, // padding top & bottom
            px: 2, // padding left & right
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            borderRadius: 'sm',
            boxShadow: 'md'
          }}
          variant="outlined"
        >
          <div>
            <Typography level="h4" component="h1">
              <b>Welcome!</b>
            </Typography>
            <Typography level="body2">Sign up to start.</Typography>
          </div>
          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input
              // html input attribute
              name="email"
              type="email"
              placeholder="johndoe@email.com"
              value={input.email || ''}
              onChange={inputHandler}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Password</FormLabel>
            <Input
              // html input attribute
              name="password"
              type="password"
              placeholder="password"
              value={input.password || ''}
              onChange={inputHandler}
            />
          </FormControl>

          <Button
            type="submit"
            onClick={submitHandler}
            sx={{ mt: 1 /* margin top */ }}
          >
            Sign up
          </Button>

          <Typography
            endDecorator={<NavLink to="/login">Login</NavLink>}
            fontSize="sm"
            sx={{ alignSelf: 'center' }}
          >
            Have an account?
          </Typography>
        </Sheet>
      </main>
    </CssVarsProvider>
  );
}

export default observer(SignupForm);

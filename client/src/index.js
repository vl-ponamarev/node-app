import React, { createContext } from 'react';
import { createRoot } from 'react-dom/client';
import './app/styles/index.css';
import App from './app/index';
import Store from './app/store/userStore';
import PostStore from 'app/store/postsStore/postsStore';

export const store = new Store();
export const Context = createContext(store);

export const postStore = new PostStore();
export const PostContext = createContext(postStore);

createRoot(document.getElementById('root')).render(
  <Context.Provider value={{ store }}>
    <PostContext.Provider value={{ postStore }}>
      <App />
    </PostContext.Provider>
  </Context.Provider>
);

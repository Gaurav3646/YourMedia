import { createSlice } from "@reduxjs/toolkit";
import io from "socket.io-client";

const initialState = {
  mode: "light",
  user: null,
  token: null,
  posts: [],
  selectedChat: null,
  notification: null,
  chats: [],
  messages: [],
  // socket: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setMode: (state) => {
      state.mode = state.mode === "light" ? "dark" : "light";
    },
    setLogin: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    setLogout: (state) => {
      state.user = null;
      state.token = null;
    },
    setFriends: (state, action) => {
      if (state.user) {
        state.user.friends = action.payload.friends;
      } else {
        console.error("user friends non-existent :(");
      }
    },
    setPosts: (state, action) => {
      state.posts = action.payload.posts;
    },
    setPost: (state, action) => {
      const updatedPosts = state.posts.map((post) => {
        if (post._id === action.payload.post._id) return action.payload.post;
        return post;
      });
      state.posts = updatedPosts;
    },
    setSelectedChat: (state, action) => {
      state.selectedChat = action.payload.selectedChat;
    },
    setNotification: (state, action) => {},
    setChats: (state, action) => {
      state.chats = action.payload.chats;
    },
    setMessage: (state, action) => {
      state.messages = [action.messages, ...state.payload.messages];
    },
    setMessages: (state, action) => {
      state.messages = [...action.payload.messages];
    },
    // initializeSocket: (state, action) => {
    //   console.log(action.payload);
    //   state.socket = { ...action.payload.socket };
    //   console.log("Ho gaya connect-2");
    // },
  },
});

export const {
  setMode,
  setLogin,
  setLogout,
  setFriends,
  setPosts,
  setMessage,
  setPost,
  setSelectedChat,
  setNotification,
  setMessages,
  setChats,
  // initializeSocket,
} = authSlice.actions;
export default authSlice.reducer;

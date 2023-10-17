import React, { useEffect, useState } from "react";
import { Avatar, Tooltip, Paper, useTheme } from "@mui/material";
import ScrollableFeed from "react-scrollable-feed";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../Config/ChatLogics.jsx";
import { useDispatch, useSelector } from "react-redux";
import { setMessage, setMessages } from "state/index.js";
import { socket } from "scenes/ChatPage/index.jsx";
// import io from "socket.io-client";
// const ENDPOINT = "http://localhost:3001";
// "https://talk-a-tive.herokuapp.com"; -> After deployment
// var socket, selectedChatCompare;
// import { selectedChatCompare } from "./SingleChat.jsx";

const ScrollableChat = ({ socket }) => {
  // console.log(props);
  // const socket = props.socket;
  const theme = useTheme();

  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const messages = useSelector((state) => state.messages);
  // const socket = useSelector((state) => state.socket);
  const [loading, setLoading] = useState(false);
  // const [newMessage, setNewMessage] = useState("");
  // const [socketConnected, setSocketConnected] = useState(false);
  const selectedChat = useSelector((state) => state.selectedChat);
  // console.log(selectedChat);
  // const [typing, setTyping] = useState(false);
  // const [istyping, setIsTyping] = useState(false);
  const dispatch = useDispatch();
  // console.log(selectedChat, "Hello");
  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const response = await fetch(
        `http://localhost:3001/messages/${selectedChat._id}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      console.log(data);
      dispatch(setMessages({ messages: data || [] }));
      // setLoading(false);

      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      console.log("fetch error", error);
    }
  };
  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line
    // selectedChatCompare = selectedChat;
  }, [selectedChat]);

  // console.log(socket);
  useEffect(() => {
    // console.log("message aaya hai");
    socket.on("message received", (newMessageRecieved) => {
      if (
        !selectedChat || // if chat is not selected or doesn't match current chat
        selectedChat._id !== newMessageRecieved.chat._id
      ) {
        // if (!notification.includes(newMessageRecieved)) {
        //   setNotification([newMessageRecieved, ...notification]);
        //   setFetchAgain(!fetchAgain);
        // }
      } else {
        console.log("message aaya hai");
        // if (user._id === newMessageRecieved.sender._id) return;
        dispatch(setMessages({ messages: [...messages, newMessageRecieved] }));
        // setMessages();
      }
    });
  });

  // console.log(messages, "message");
  return (
    <ScrollableFeed>
      {messages &&
        messages.map((m, i) => (
          <div
            style={{
              display: "flex",
              // position: "relative",
              margin: "0 5px",
            }}
            key={m._id}
          >
            {(isSameSender(messages, m, i, user._id) ||
              isLastMessage(messages, i, user._id)) && (
              <Tooltip
                title={m.sender?.firstName}
                placement="bottom-start"
                arrow
              >
                <Avatar
                  sx={{
                    top: "45px",
                    // marginRight: "10px",
                    // marginTop: "7px",
                    // position: "absolute",
                    // marginRight: "1",
                    // size: "sm",
                    // // Use theme.spacing to specify the size
                    cursor: "pointer",
                  }}
                  alt={m.sender?.firstName}
                  src={`${m.sender?.picturePath}`}
                />
              </Tooltip>
            )}
            <Paper
              sx={{
                // padding: "8px",
                backgroundColor: (theme) =>
                  m.sender?._id !== user?._id
                    ? theme.palette.primary.main
                    : theme.palette.secondary.main,
                marginLeft: isSameSenderMargin(messages, m, i, user._id),
                marginTop: isSameUser(messages, m, i) ? 1 : 3,

                borderRadius: "20px",
                padding: "5px 15px",
                maxWidth: "75%",
              }}
            >
              {m.content}
            </Paper>
          </div>
        ))}
    </ScrollableFeed>
  );
};

export default ScrollableChat;

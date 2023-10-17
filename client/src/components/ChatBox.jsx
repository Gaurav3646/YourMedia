import React from "react";
import { Box, Typography, useMediaQuery } from "@mui/material";
import WidgetWrapper from "./WidgetWrapper";
import SingleChat from "./SingleChat";
import { useTheme } from "@mui/material";
import ScrollableChat from "./ScrollableChat";
import { useDispatch, useSelector } from "react-redux";
import { getSender } from "Config/ChatLogics";
// import SingleChat from './SingleChat';
// import { ChatState } from '../Context/ChatProvider';

const ChatBox = ({ socket, istyping, isOnline }) => {
  //   const { selectedChat } = ChatState();
  const selectedChat = useSelector((state) => state.selectedChat);
  const user = useSelector((state) => state.user);
  console.log(isOnline);
  const { palette } = useTheme();
  return (
    <WidgetWrapper height="60vh">
      <Typography
        color={palette.neutral.dark}
        variant="h5"
        fontWeight="500"
        sx={{ mb: "1.2rem" }}
      >
        {selectedChat &&
          `${getSender(user, selectedChat?.users).firstName} ${
            getSender(user, selectedChat?.users).lastName
          }`}
        {!selectedChat && "Please select user"}
        {selectedChat &&
          (istyping
            ? " is typing...."
            : isOnline.includes(getSender(user, selectedChat?.users)._id)
            ? " is online"
            : " is offline")}
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          // alignItems: "center",
          padding: "3",

          backgroundColor: palette.neutral.light,
          width: "100%",
          height: "88%",
          borderRadius: "lg",
          overflowY: "auto",

          scrollBehavior: "smooth",
        }}
      >
        <ScrollableChat socket={socket} />
      </Box>
    </WidgetWrapper>
  );
};

export default ChatBox;

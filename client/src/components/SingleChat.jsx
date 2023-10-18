import React, { useEffect, useState } from "react";

import {
  Box,
  Divider,
  Typography,
  InputBase,
  useTheme,
  Button,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import FlexBetween from "components/FlexBetween";
import UserImage from "./UserImage";

import WidgetWrapper from "./WidgetWrapper";
import {
  EditOutlined,
  DeleteOutlined,
  MicOutlined,
  MoreHorizOutlined,
  AttachFileOutlined,
  GifBoxOutlined,
  ImageOutlined,
} from "@mui/icons-material";
import Dropzone from "react-dropzone";
import { useDispatch, useSelector } from "react-redux";
import { setMessage, setMessages } from "state";
// import { socket } from "scenes/ChatPage";
// import io from "socket.io-client";
// const ENDPOINT = "http://localhost:3001"; // "https://talk-a-tive.herokuapp.com"; -> After deployment
// export var socket;
// export var selectedChatCompare;

const SingleChat = ({ socket, istyping }) => {
  // console.log(props);
  const dispatch = useDispatch();
  const [isImage, setIsImage] = useState(false);
  const [image, setImage] = useState(null);
  // const { palette } = useTheme();
  const user = useSelector((state) => state.user);
  const selectedChat = useSelector((state) => state.selectedChat);
  const messages = useSelector((state) => state.messages);
  const token = useSelector((state) => state.token);
  const [typing, setTyping] = useState(false);
  // const socket = useSelector((state) => state.socket);
  // const [messages, setMessages] = useState([]);
  // const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");

  const sendMessage = async (event) => {
    // console.log(newMessage);

    if (newMessage) {
      console.log(newMessage);
      setTyping(false);
      socket.emit("stop typing", selectedChat._id, user._id);
      try {
        // const config = {};

        const response = await fetch(
          "https://social-5zzn.onrender.com/messages",
          {
            method: "POST",
            headers: {
              "Content-type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              content: newMessage,
              chatId: selectedChat._id,
            }),
          }
        );

        const data = await response.json();
        // setMessages();
        console.log(data, "Hello From Messages");
        socket.emit("new message", data);
        dispatch(setMessages({ messages: [...messages, data] }));
        setNewMessage("");
      } catch (error) {
        console.log("error", error);
      }
    }
  };

  // if (istyping) {
  //   setTyping(false);
  // }

  const { palette } = useTheme();
  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");
  const mediumMain = palette.neutral.mediumMain;
  const medium = palette.neutral.medium;
  // console.log("From the online", socket.has(user._id));
  return (
    <WidgetWrapper marginTop="20px">
      <FlexBetween>
        <UserImage image={user?.picturePath} />

        <InputBase
          placeholder="What's on your mind..."
          onChange={(e) => {
            setNewMessage(e.target.value);
            if (!typing) {
              setTyping(() => true);
              socket.emit("typing", selectedChat._id, user._id);
            }
            let lastTypingTime = new Date().getTime();
            var timerLength = 3000;
            setTimeout(() => {
              var timeNow = new Date().getTime();
              var timeDiff = timeNow - lastTypingTime;
              if (timeDiff >= timerLength && typing) {
                socket.emit("stop typing", selectedChat._id, user._id);
                setTyping(() => false);
              }
            }, timerLength);
          }}
          value={newMessage}
          sx={{
            width: "100%",
            backgroundColor: palette.neutral.light,
            borderRadius: "2rem",
            marginLeft: "1rem",
            padding: "1rem 2rem",
          }}
        />
      </FlexBetween>
      {isImage && (
        <Box
          border={`1px solid ${medium}`}
          borderRadius="5px"
          mt="1rem"
          p="1rem"
        >
          <Dropzone
            acceptedFiles=".jpg,.jpeg,.png"
            multiple={false}
            onDrop={(acceptedFiles) => setImage(acceptedFiles[0])}
          >
            {({ getRootProps, getInputProps }) => (
              <FlexBetween>
                <Box
                  {...getRootProps()}
                  border={`2px dashed ${palette.primary.main}`}
                  p="1rem"
                  width="100%"
                  sx={{ "&:hover": { cursor: "pointer" } }}
                >
                  <input {...getInputProps()} />
                  {!image ? (
                    <p>Add Image Here</p>
                  ) : (
                    <FlexBetween>
                      <Typography>{image.name}</Typography>
                      <EditOutlined />
                    </FlexBetween>
                  )}
                </Box>
                {image && (
                  <IconButton
                    onClick={() => setImage(null)}
                    sx={{ width: "15%" }}
                  >
                    <DeleteOutlined />
                  </IconButton>
                )}
              </FlexBetween>
            )}
          </Dropzone>
        </Box>
      )}
      <Divider sx={{ margin: "1.25rem 0" }} />

      <FlexBetween>
        <FlexBetween gap="0.25rem" onClick={() => setIsImage(!isImage)}>
          <ImageOutlined sx={{ color: mediumMain }} />
          <Typography
            color={mediumMain}
            sx={{ "&:hover": { cursor: "pointer", color: medium } }}
          >
            Image
          </Typography>
        </FlexBetween>

        {isNonMobileScreens ? (
          <>
            <FlexBetween gap="0.25rem">
              <GifBoxOutlined sx={{ color: mediumMain }} />
              <Typography color={mediumMain}>Clip</Typography>
            </FlexBetween>

            <FlexBetween gap="0.25rem">
              <AttachFileOutlined sx={{ color: mediumMain }} />
              <Typography color={mediumMain}>Attachment</Typography>
            </FlexBetween>

            <FlexBetween gap="0.25rem">
              <MicOutlined sx={{ color: mediumMain }} />
              <Typography color={mediumMain}>Audio</Typography>
            </FlexBetween>
          </>
        ) : (
          <FlexBetween gap="0.25rem">
            <MoreHorizOutlined sx={{ color: mediumMain }} />
          </FlexBetween>
        )}

        <Button
          disabled={!newMessage}
          onClick={sendMessage}
          sx={{
            color: palette.background.alt,
            backgroundColor: palette.primary.main,
            borderRadius: "3rem",
          }}
        >
          SEND
        </Button>
      </FlexBetween>
    </WidgetWrapper>

    // <>
    // <Typography variant="h4" component="div" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', fontFamily: 'Work Sans' }}>
    //   <IconButton
    //     style={{ display: 'flex', [theme.breakpoints.down('sm')]: { display: 'flex' } }}
    //     // onClick={() => setSelectedChat('')}
    //   >
    //     <ArrowBackIcon />
    //   </IconButton>
    //   {true &&
    //     (true ? (
    //       <>
    //         {getSender(user, selectedChat.users)}
    //         <ProfileModal
    //           user={getSenderFull(user, selectedChat.users)}
    //         />
    //       </>
    //     ) : (
    //       <>
    //         {selectedChat.chatName.toUpperCase()}
    //         <UpdateGroupChatModal
    //           fetchMessages={fetchMessages}
    //           fetchAgain={fetchAgain}
    //           setFetchAgain={setFetchAgain}
    //         />
    //       </>
    //     ))}
    // </Typography>
    // <Box
    //   className={classes.chatBox}
    // >
    //   {loading ? (
    //     <CircularProgress
    //       size={70}
    //       style={{ alignSelf: 'center', margin: 'auto' }}
    //     />
    //   ) : (
    //     <div className="messages">
    //       <ScrollableChat messages={messages} />
    //     </div>
    //   )}
    //   <FormControl
    //     onKeyDown={sendMessage}
    //     required
    //     className={classes.messageInput}
    //   >
    //     {istyping ? (
    //       <div>
    //         <Lottie
    //           options={defaultOptions}
    //           width={70}
    //           style={{ marginBottom: 15, marginLeft: 0 }}
    //         />
    //       </div>
    //     ) : (
    //       <></>
    //     )}

    //     </>
    // ) : (
    // <Box
    //   style={{
    //     display: "flex",
    //     alignItems: "center",
    //     justifyContent: "center",
    //     height: "100%",
    //   }}
    // >
    //   <Typography
    //     variant="h4"
    //     component="div"
    //     style={{ fontFamily: "Work Sans", paddingBottom: 16 }}
    //   >
    //     Click on a user to start chatting
    //   </Typography>
    // </Box>
    // )}
  );
};

export default SingleChat;

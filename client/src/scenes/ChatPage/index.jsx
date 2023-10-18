import { Box, useMediaQuery } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "scenes/navbar";
import UserWidget from "scenes/widgets/UserWidget";
import MyPostWidget from "scenes/widgets/MyPostWidget";
import PostsWidget from "scenes/widgets/PostsWidget";
import AdvertWidget from "scenes/widgets/AdvertWidget";
import FriendListWidget from "scenes/widgets/FriendListWidget";
import ChatListWidget from "scenes/widgets/ChatListWidget";
import ChatBox from "components/ChatBox";
import SingleChat from "components/SingleChat";
import ScrollableChat from "components/ScrollableChat";
import { useEffect, useState } from "react";
// import io from "socket.io-client";
import { initializeSocket } from "state";
// "https://talk-a-tive.herokuapp.com"; -> After deployment
import io from "socket.io-client";
const ENDPOINT = "https://social-5zzn.onrender.com/"; // "https://talk-a-tive.herokuapp.com"; -> After deployment
var socket = null;

// const ENDPOINT = "http://localhost:3001";

const ChatPage = () => {
  const isNonMobileScreens = useMediaQuery("(min-width:1000px)");
  const { _id, picturePath } = useSelector((state) => state.user);
  const user = useSelector((state) => state.user);
  const [socketConnected, setSocketConnected] = useState(false);

  const [istyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState([]);
  // const dispatch = useDispatch();
  useEffect(() => {
    socket = io(ENDPOINT);

    // console.log("kya karun");
    socket.emit("setup", user);
    socket.emit("online", user._id);
    socket.on("connected", () => {
      console.log("Ho gaya connect");
      setSocketConnected(() => true);
      // dispatch(initializeSocket({ socket }));
      // });
      socket.on("online", (ids) => {
        setIsOnline([...ids]);
        console.log("online", isOnline);

        // if (id !== user._id) setIsTyping(true);
      });
      socket.on("offline", (ids) => {
        setIsOnline([...ids]);
      });

      socket.on("typing", (id) => {
        if (id !== user._id) setIsTyping(true);
      });
      socket.on("stop typing", () => {
        setIsTyping(false);
      });
      // eslint-disable-next-line
    });

    window.addEventListener("beforeunload", () => {
      socket.emit("offline", user._id);
      socket.disconnect();
    });
    return () => {
      socket.emit("offline", user._id);
      socket.disconnect();
    };
  }, []);

  return (
    <Box>
      <Navbar />
      <Box
        width="100%"
        padding="2rem 6%"
        display={isNonMobileScreens ? "flex" : "block"}
        gap="0.5rem"
        justifyContent="space-between"
      >
        {/* <Box flexBasis={isNonMobileScreens ? "26%" : undefined}>
          <UserWidget userId={_id} picturePath={picturePath} />
        </Box> */}
        {/* <Box
          flexBasis={isNonMobileScreens ? "42%" : undefined}
          mt={isNonMobileScreens ? undefined : "2rem"}
        > */}
        <Box
          flexBasis={isNonMobileScreens ? "74%" : undefined}
          mt={isNonMobileScreens ? undefined : "2rem"}
        >
          {socketConnected && (
            <ChatBox socket={socket} istyping={istyping} isOnline={isOnline} />
          )}
          {socketConnected && <SingleChat socket={socket} />}
        </Box>

        <Box
          flexBasis={isNonMobileScreens ? "26%" : undefined}
          mt={isNonMobileScreens ? undefined : "2rem"}
        >
          {<ChatListWidget userId={_id} socket={socket} />}
        </Box>
      </Box>
    </Box>
  );
};

export default ChatPage;

import { Box, Typography, useTheme } from "@mui/material";
import ChatFriend from "components/ChatFriend";
import WidgetWrapper from "components/WidgetWrapper";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setChatSeen, setChatUnseen, setChats, setSelectedChat } from "state";
import { InputBase } from "@mui/material";
import { IconButton } from "@mui/material";
import { Search } from "@mui/icons-material";
import FlexBetween from "components/FlexBetween";
import UserImage from "components/UserImage";
import { getSender } from "Config/ChatLogics";

const ChatListWidget = ({ userId, socket }) => {
  const dispatch = useDispatch();
  const { palette } = useTheme();
  const neutralLight = palette.neutral.light;
  const primaryLight = palette.primary.light;
  const primaryDark = palette.primary.dark;
  const main = palette.neutral.main;
  const medium = palette.neutral.medium;
  const user = useSelector((state) => state.user);
  // const [loggedUser, setLoggedUser] = useState();
  const token = useSelector((state) => state.token);
  const chats = Object.values(useSelector((state) => state.chats));
  const selectedChat = useSelector((state) => state.selectedChat);
  const [fetchAgain, setFetchAgain] = useState(false);
  // const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();

  const getChats = async () => {
    try {
      const response = await fetch(`https://social-5zzn.onrender.com/chats`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      console.log(data);
      dispatch(setChats({ chats: data }));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getChats();
  }, [fetchAgain]);

  const [searchResult, setSearchResult] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const handleInputChange = (event) => {
    // Update the searchValue state when the input value changes
    setSearchValue(() => event.target.value);
  };

  const accessChat = async (userId) => {
    // console.log(userId);

    try {
      const response = await fetch(`https://social-5zzn.onrender.com/chats`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: userId }),
      });
      const data = await response.json();
      // console.log("access", data);
      dispatch(setChatUnseen({ chatId: data._id }));
      dispatch(setSelectedChat({ selectedChat: data }));
      if (!chats.find((c) => c._id === selectedChat._id))
        dispatch(setChats({ chats: [data, ...chats] }));

      // console.log(selectedChat);
      // console.log(data);
      // if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      // setSelectedChat(data);
      // setLoadingChat(false);
      // onClose();
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleSearch = async () => {
    if (!searchValue) {
      return;
    }

    try {
      // const config = {
      //   headers: {
      //     Authorization: `Bearer ${token}`,
      //   },
      // };

      const response = await fetch(
        `https://social-5zzn.onrender.com/users?search=${searchValue}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      setSearchResult(data);
      setSearchValue("");
      // console.log(data);
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <WidgetWrapper>
      <Typography
        color={palette.neutral.dark}
        variant="h5"
        fontWeight="500"
        sx={{ mb: "1.2rem" }}
      >
        Chats
      </Typography>
      <FlexBetween
        backgroundColor={neutralLight}
        borderRadius="9px"
        gap="3rem"
        padding="0.1rem 1.5rem"
        marginBottom="0.5rem"
      >
        <InputBase
          placeholder="Search..."
          value={searchValue}
          onChange={handleInputChange}
        />
        <IconButton onClick={handleSearch}>
          <Search />
        </IconButton>
      </FlexBetween>
      <Box display="flex" flexDirection="column" gap="1.5rem">
        {searchResult?.length !== 0 &&
          searchResult?.map((user) => (
            <FlexBetween key={user._id}>
              <FlexBetween gap="1rem">
                <UserImage image={user.picturePath} size="55px" />
                <Box
                  onClick={async () => {
                    await accessChat(user._id);
                    setSearchResult(() => []);
                    setFetchAgain((val) => !val);
                  }}
                >
                  <Typography
                    color={main}
                    variant="h5"
                    fontWeight="500"
                    sx={{
                      "&:hover": {
                        color: palette.primary.main,
                        cursor: "pointer",
                      },
                    }}
                  >
                    {`${user.firstName} ${user?.lastName}`}
                  </Typography>
                </Box>
              </FlexBetween>
            </FlexBetween>
          ))}
        {searchResult?.length === 0 &&
          chats.length !== 0 &&
          chats.map((chat) => (
            <ChatFriend
              key={chat._id}
              // name={getSender(user, chat.users)}
              name={`${getSender(user, chat.users)?.firstName} ${
                getSender(user, chat.users)?.lastName
              }`}
              chat={chat}
              onClick={(chat) => {
                if (selectedChat) {
                  socket.emit("leave chat", selectedChat?._id);
                }

                dispatch(setSelectedChat({ selectedChat: chat }));
                dispatch(setChatSeen({ chatId: chat?._id }));
              }}
              subtitle={
                chat.seen
                  ? chat.latestMessage
                    ? chat.latestMessage.content.length > 50
                      ? chat.latestMessage.content.substring(0, 51) + "..."
                      : chat.latestMessage.content
                    : ""
                  : "New Messages"
              }
              userPicturePath={getSender(user, chat.users)?.picturePath}
            />
          ))}
      </Box>
    </WidgetWrapper>
  );
};

export default ChatListWidget;

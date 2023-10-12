import { Box, Typography, useTheme } from "@mui/material";
import ChatFriend from "components/ChatFriend";
import Friend from "components/Friend";
import WidgetWrapper from "components/WidgetWrapper";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setChats, setFriends, setSelectedChat } from "state";
import { InputBase } from "@mui/material";
import { IconButton } from "@mui/material";
import { Search } from "@mui/icons-material";
import FlexBetween from "components/FlexBetween";
import UserImage from "components/UserImage";

const ChatListWidget = ({ userId }) => {
  const dispatch = useDispatch();
  const { palette } = useTheme();
  const neutralLight = palette.neutral.light;
  const primaryLight = palette.primary.light;
  const primaryDark = palette.primary.dark;
  const main = palette.neutral.main;
  const medium = palette.neutral.medium;

  // const [loggedUser, setLoggedUser] = useState();
  const token = useSelector((state) => state.token);
  const chats = useSelector((state) => state.chats);
  const selectedChat = useSelector((state) => state.selectedChat);
  // const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();

  const getChats = async () => {
    try {
      const response = await fetch(`http://localhost:3001/chats`, {
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
  }, []);

  // const fetchChats = async () => {
  //   // console.log(user._id);
  //   try {
  //     const config = {
  //       headers: {
  //         Authorization: `Bearer ${user.token}`,
  //       },
  //     };

  //     const { data } = await axios.get("/api/chat", config);
  //     setChats(data);
  //   } catch (error) {
  //     toast({
  //       title: "Error Occured!",
  //       description: "Failed to Load the chats",
  //       status: "error",
  //       duration: 5000,
  //       isClosable: true,
  //       position: "bottom-left",
  //     });
  //   }
  // };

  // useEffect(() => {
  //   setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
  //   fetchChats();
  //   // eslint-disable-next-line
  // }, [fetchAgain]);

  // const dispatch = useDispatch();
  // const { palette } = useTheme();

  // const friends = useSelector((state) => state.user.friends);

  // const getFriends = async () => {
  //   const response = await fetch(
  //     `http://localhost:3001/users/${userId}/friends`,
  //     {
  //       method: "GET",
  //       headers: { Authorization: `Bearer ${token}` },
  //     }
  //   );
  //   const data = await response.json();
  //   dispatch(setFriends({ friends: data }));
  // };

  // useEffect(() => {
  //   getFriends();
  // }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [searchResult, setSearchResult] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const handleInputChange = (event) => {
    // Update the searchValue state when the input value changes
    setSearchValue(event.target.value);
  };

  const accessChat = async (userId) => {
    console.log(userId);

    try {
      // const config = {
      //   headers: {
      //     "Content-type": "application/json",
      //     Authorization: `Bearer ${user.token}`,
      //   },
      // };
      // const { data } = await axios.post(`/api/chat`, { userId }, config);
      // const formData = new FormData();
      // formData.append("userId", userId);
      const response = await fetch(`http://localhost:3001/chats`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: userId }),
      });
      const data = await response.json();
      console.log("access", data);

      if (!chats.find((c) => c._id === selectedChat._id))
        dispatch(setChats({ chats: [selectedChat, ...chats] }));

      dispatch(setSelectedChat({ selectedChat: data }));

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
        `http://localhost:3001/users?search=${searchValue}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      setSearchResult(data);
      setSearchValue("");
      console.log(data);
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
                <Box onClick={() => accessChat(user._id)}>
                  <Typography
                    color={main}
                    variant="h5"
                    fontWeight="500"
                    sx={{
                      "&:hover": {
                        color: palette.primary.light,
                        cursor: "pointer",
                      },
                    }}
                  >
                    {`${user.firstName} ${user.lastName}`}
                  </Typography>
                </Box>
              </FlexBetween>
            </FlexBetween>
          ))}
        {searchResult?.length === 0 &&
          chats.length !== 0 &&
          chats.map((chat) => (
            <ChatFriend
              key={chat.users[1]._id}
              name={`${chat.users[1].firstName} ${chat.users[1].lastName}`}
              subtitle={
                chat.latestMessage
                  ? chat.latestMessage.content.length > 50
                    ? chat.latestMessage.content.substring(0, 51) + "..."
                    : chat.latestMessage.content
                  : ""
              }
              userPicturePath={chat.users[1].picturePath}
            />
          ))}
      </Box>
    </WidgetWrapper>
  );
};

export default ChatListWidget;

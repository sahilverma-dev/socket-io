import { Button } from "@/components/ui/button";
import { useSocket } from "@/hooks";
import { FormEvent, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { faker } from "@faker-js/faker";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { User } from "@/interfaces";

const getRandomUser = () => {
  return {
    id: crypto.randomUUID(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    image: faker.internet.avatar(),
  };
};

const user = getRandomUser();

const Room = () => {
  const [messageText, setMessageText] = useState("");

  const [messages, setMessages] = useState<
    {
      message: string;
      user: User;
    }[]
  >([]);

  const { roomId } = useParams<{
    roomId: string;
  }>();

  const { socket } = useSocket();

  const submitMessage = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (messageText.length > 5) {
      socket?.emit("message", { user, message: messageText });

      setMessages((state) => [
        ...state,
        {
          message: messageText,
          user,
        },
      ]);

      setMessageText("");
    }
  };

  useEffect(() => {
    const unsub = () => {
      socket?.emit("join", {
        roomId,
        user,
      });

      socket?.once("join", (data) => {
        console.log(data);
      });

      socket?.on(
        "message",
        ({
          message,
          user,
          socketId,
        }: {
          message: string;
          user: User;
          socketId: string;
        }) => {
          console.log(socketId);

          setMessages((state) => [
            ...state,
            {
              message,
              user,
            },
          ]);
        }
      );

      socket?.on("left", ({ user }) => {
        console.log(`${user?.name} left the room `);
      });
    };

    return () => unsub();
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto border flex flex-col h-screen">
      <div className="flex border-b p-4 w-full items-center justify-between">
        <h1>Room</h1>
        <div className="flex items-center gap-2">
          <b>Hello, {user.name}</b>
          <Avatar className="border">
            <AvatarImage src={user.image} />
            <AvatarFallback>{user.name.split(" ").join("")}</AvatarFallback>
          </Avatar>
        </div>
      </div>
      <div className="p-4 flex-grow overflow-y-scroll flex flex-col gap-4 ">
        {messages.map((message, i) => (
          <div
            key={i}
            className={cn([
              "flex gap-2",
              message.user.id != user.id ? "flex-row-reverse" : "flex-row",
            ])}
          >
            <p
              className={cn([
                "bg-secondary border text-secondary-foreground rounded-lg py-2 px-4 w-full max-w-xl",
                message.user.id != user.id ? "mr-auto" : "ml-auto",
              ])}
            >
              {message.message}
            </p>
            <Avatar className="border">
              <AvatarImage src={message.user.image} />
              <AvatarFallback>
                {message.user.name.split(" ").join("")}
              </AvatarFallback>
            </Avatar>
          </div>
        ))}
      </div>
      <div className=" border-t p-4 w-full ">
        <form
          onSubmit={submitMessage}
          className="w-full flex items-center gap-2 justify-between"
        >
          <Input
            value={messageText}
            onChange={({ target }) => setMessageText(target.value)}
            placeholder="Enter your message"
            className="w-full"
          />
          <Button
            type="submit"
            disabled={messageText.length <= 5}
            className="aspect-square"
            size={"icon"}
          >
            <Send size={20} />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Room;

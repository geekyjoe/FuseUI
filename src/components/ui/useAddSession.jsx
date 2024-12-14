import { useState } from "react";

const useAddSession = () => {
  const [sessions, setSessions] = useState([]);

  // Function to add a new session
  const addSession = () => {
    const randomName = `Session # ${Math.floor(Math.random() * 1000)}`;
    setSessions([...sessions, { id: Date.now(), name: randomName }]);
  };

  return { sessions, addSession};
};

export default useAddSession;
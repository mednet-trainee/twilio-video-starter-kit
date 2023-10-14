import React, { useState, useRef} from 'react';
import { connect } from 'twilio-video';
import { useParams } from 'react-router-dom';
import Room from './Room';
import './App.scss';
//import Front from './Front';

function Home() {
  const [identity, setIdentity] = useState('');
  const [room, setRoom] = useState(null);
  const inputRef = useRef();
  const {patientEncounterID} = useParams();
  
  const joinRoom = async () => {
    try {
      const roomName = 'PID-80875_43431';
      console.log(patientEncounterID);
      const response = await fetch(`http://localhost:8182/api/v1/mxSelfRegn/getTwilioToken?room=${roomName}&loginID=${patientEncounterID}`);
      const token = await response.text();
      console.log(token);
      const twilioRoom = await connect(token, {
        name: roomName,
        audio: true,
        video: true
      });
      setRoom(twilioRoom);
    } catch (err) {
      console.log(err);
    }
  }

  const returnToLobby = () => {
    setRoom(null);
  }

  const removePlaceholderText = () => {
    inputRef.current.placeholder = '';
  }

  const updateIdentity = (event) => {
    setIdentity(patientEncounterID);
  }

  const disabled = identity === '' ? true : false;

  return (
    <div className="app">
      { 
        room === null
        ? <div className="lobby">
            <input 
              value={identity} 
              onChange={updateIdentity} 
              ref={inputRef} 
              onClick={removePlaceholderText} 
              placeholder="What's your name?"
            />
            <button disabled={disabled} onClick={joinRoom}>Join Room</button>
          </div>
        //? <Front/>
        : <Room returnToLobby={returnToLobby} room={room} />
      }
    </div>
  );
}

export default Home;

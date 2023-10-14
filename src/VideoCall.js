import React, { useState, useEffect } from 'react';
import { connect } from 'twilio-video';
import { useParams, useNavigate } from 'react-router-dom';
import './App.scss';
import Participant from './Participant';
import 'font-awesome/css/font-awesome.min.css';

function VideoCall() {
  const [room, setRoom] = useState(null);
  const [remoteParticipants, setRemoteParticipants] = useState([]);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);

  const { patientMrn, patientEncounterID } = useParams();
  const navigate = useNavigate();

  const addParticipant = (participant) => {
    console.log(`${participant.identity} has joined the room.`);
    setRemoteParticipants(prevParticipants => [...prevParticipants, participant]);
  }

  const removeParticipant = (participant) => {
    console.log(`${participant.identity} has left the room`);
    setRemoteParticipants(prevParticipants => prevParticipants.filter(p => p.identity !== participant.identity));
  }

  const leaveRoom = () => {
    if (room) {
      room.disconnect();
    }
    navigate('/'); 
  };

  const toggleAudio = () => {
    const audioTracks = room.localParticipant.audioTracks;
    audioTracks.forEach(publication => {
      const track = publication.track;
      if (isAudioMuted) {
        track.enable();
      } else {
        track.disable();
      }
    });
    setIsAudioMuted(!isAudioMuted);
  };
  

  const toggleVideo = () => {
    const videoTracks = room.localParticipant.videoTracks;
    videoTracks.forEach(publication => {
      const track = publication.track;
      if (isVideoMuted) {
        document.getElementById(patientEncounterID).style.display = 'block';
        track.enable();
      } else {
        document.getElementById(patientEncounterID).style.display = 'none';
        track.disable();
      }
    });
    setIsVideoMuted(!isVideoMuted);
  };

  useEffect(() => {
    const joinRoom = async () => {
      try {
        const roomName = patientMrn+'_'+patientEncounterID;
        console.log('Room Name: '+roomName);
        const response = await fetch(`http://stage.mednetlabs.com:8182/api/v1/mxSelfRegn/getTwilioToken?room=${roomName}&loginID=${patientEncounterID}`);
        console.log(response);
        const token = await response.text();
        const twilioRoom = await connect(token, {
          name: roomName,
          audio: true,
          video: true
        });
        setRoom(twilioRoom);

        twilioRoom.on('participantConnected', participant => {
          addParticipant(participant);
        });

        twilioRoom.on('participantDisconnected', participant => {
          removeParticipant(participant);
        });

        twilioRoom.participants.forEach(participant => {
          addParticipant(participant);
        });
      } catch (err) {
        console.log(err);
      }
    };

    joinRoom();
  }, [patientMrn, patientEncounterID]);

  return (
    <div className='commonPopupOuter'>
      {room && (
        <div className='commonPopupHeader'>
          <div>
            <Participant key={room.localParticipant.identity} localParticipant="true" participant={room.localParticipant} className="participant" />
            {remoteParticipants.map((participant, index) => (
              <Participant
                key={participant.identity}
                participant={participant}
                className={index === 0 ? 'remoteParticipant' : 'participant'}
              />
            ))}
          </div>
          <div className="widthFullDiv circleButtonBottomDiv_smallScreen">
            <div className='middleIconDiv'>
              <div className="buttonCommonDiv microphone relative" onClick={toggleAudio}>
                <div style={{ lineHeight: "52px", width: "100%" }}>
                  {isAudioMuted ? (
                    <i className="fa fa-microphone-slash"></i>
                    ) : (
                    <i className="fa fa-microphone"></i>)
                  }
                  <div className="fa fa-microphone" style={{ lineHeight: "52px", width: "100%" }}></div>
                </div>
              </div>

              <div className="buttonCommonDiv callDiscDiv" onClick={leaveRoom} id="leaveRoom" style={{ margin: "0 20px" }}>
                <div className="fa fa-phone" style={{ transform: "rotate(135deg)", lineHeight: "52px", width: "100%" }}></div>
              </div>

              <div className="buttonCommonDiv videoCamera relative floatRight" onClick={toggleVideo}>
                <div style={{ lineHeight: "52px", width: "100%" }}>
                  {isVideoMuted ? (
                    <i className="fa fa-video-camera manual-slash-icon"></i>
                  ) : (
                    <i className="fa fa-video-camera"></i>)
                  }
                  <div className="fa fa-video-camera" style={{ lineHeight: "52px", width: "100%" }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
  
}

export default VideoCall;

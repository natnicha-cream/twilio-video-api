const form = document.getElementById("room-name-form");
const roomNameInput = document.getElementById("room-name-input");
const container = document.getElementById("video-container");

let identity_localParticipant = "";

const startRoom = async (event) => {
  // prevent a page reload when a user submits the form
  event.preventDefault();
  // // hide the join form
  // form.style.visibility = "hidden";
  form.style.display = "none";
  // retrieve the room name
  const roomName = roomNameInput.value;

  // fetch an Access Token from the join-room route
  const response = await fetch("/join-room", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ roomName: roomName }),
  });
  const { token } = await response.json();
  console.log(token)
  console.log(roomName)

  // join the video room with the token
  const room = await joinVideoRoom(roomName, token).then(res => res)
  console.log(room);

  // render the local and remote participants' video and audio tracks
  handleConnectedParticipant(room.localParticipant, "local");
  // console.log(room.localParticipant)
  // if(room.localParticipant){
  //   const localParticipantDiv = document.createElement("div");
  //   localParticipantDiv.setAttribute("class", "local-participant");
  //   container.appendChild(localParticipantDiv);
  // }
  room.participants.forEach(handleConnectedParticipant);
  room.on("participantConnected", handleConnectedParticipant);
  identity_localParticipant = room.localParticipant.identity;

  // handle cleanup when a participant disconnects
  room.on("participantDisconnected", handleDisconnectedParticipant);
  window.addEventListener("pagehide", () => room.disconnect());
  window.addEventListener("beforeunload", () => room.disconnect());
};

const handleConnectedParticipant = (participant, type = "remote") => {
  console.log(type)
  // create a div for this participant's tracks
  const participantDiv = document.createElement("div");
  participantDiv.setAttribute("id", participant.identity);
  if(type === "local") {
    participantDiv.setAttribute("class", "local");
  } else {
    participantDiv.setAttribute("class", "remote");
  }
  container.appendChild(participantDiv);

  // iterate through the participant's published tracks and
  // call `handleTrackPublication` on them
  // console.log("local ", identity_localParticipant);
  console.log("identity ", participant.identity);
  console.log("participant: ", participant);
  participant.tracks.forEach((trackPublication) => {
    // console.log("trackPublication: ", trackPublication);
    handleTrackPublication(trackPublication, participant);
  });

  // listen for any new track publications
  participant.on("trackPublished", handleTrackPublication);
};

const handleTrackPublication = (trackPublication, participant) => {
  function displayTrack(track) {
    // append this track to the participant's div and render it on the page
    const participantDiv = document.getElementById(participant.identity);
    // console.log(participantDiv)
    // track.attach creates an HTMLVideoElement or HTMLAudioElement
    // (depending on the type of track) and adds the video or audio stream
    participantDiv.append(track.attach());
  }

  // check if the trackPublication contains a `track` attribute. If it does,
  // we are subscribed to this track. If not, we are not subscribed.
  if (trackPublication.track) {
    // const remoteDiv = document.getElementById("div");
    displayTrack(trackPublication.track);
  }

  // listen for any new subscriptions to this track publication
  trackPublication.on("subscribed", displayTrack);
};

const handleDisconnectedParticipant = (participant) => {
  // stop listening for this participant
  participant.removeAllListeners();
  // remove this participant's div from the page
  const participantDiv = document.getElementById(participant.identity);
  participantDiv.remove();
};

const joinVideoRoom = async (roomName, token) => {
  // join the video room with the Access Token and the given room name
  const room = await Twilio.Video.connect(token, {
    room: roomName,
  });
  return room;
};

form.addEventListener("submit", startRoom);

function joinRoom() {
  console.log("check btn join room")
};
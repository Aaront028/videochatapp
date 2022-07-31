const socket = io('/')
const videoGrid = document.getElementById('video-grid')

const myPeer = new Peer(undefined, {
  host: 'peerjs-server.herokuapp.com',
  secure: true,
  port: 443,
})

const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    addVideoStream(myVideo, stream)

    myPeer.on('call', (call) => {
      call.answer(stream)
      const video = document.createElement('video')
      call.on('stream', (userVideoStream) => {
        addVideoStream(video, userVideoStream)
      })
    })

    socket.on('user-connected', (userId) => {
      setTimeout(() => {
        // user joined
        console.log('user ' + userId + 'just joined')
        connectToNewUser(userId, stream)
      }, 1000)
    })
  })

socket.on('user-disconnected', (userId) => {
  setTimeout(() => {
    if (peers[userId]) {
      peers[userId].close()
      console.log('user ' + userId + 'disconnected')
    }
  }, 1000)
})

myPeer.on('open', (id) => {
  socket.emit(
    'join-room',
    ROOM_ID,
    id,
    console.log('id: ' + id, 'room_id:' + ROOM_ID)
  )
})

function connectToNewUser(userId, stream) {
  {
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', (userVideoStream) => {
      addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
      setTimeout(() => {
        video.remove()
      }, 1000)
    })
    peers[userId] = call
  }
}

// this is to display screen share
// navigator.mediaDevices
//   .getDisplayMedia({
//     video: true,
//     audio: true,
//   })
//   .then((stream) => {
//     addVideoStream(myVideo, stream)
//   })

// test code
// socket.on('user-connected', (userId) => {
//   console.log('user connected' + userId)
// })

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}

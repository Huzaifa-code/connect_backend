let express = require('express');
require('dotenv').config();
const moment = require('moment');
const { APIService } = require('../src/services/APIService');
const { TokenService } = require('../src/services/TokenService');

let app = express();
app.use(express.json()); // for parsing request body as JSON
let port = process.env.PORT || 5000;

const tokenService = new TokenService();
const apiService = new APIService(tokenService);


app.listen(port, () => {
    console.log(`Token server started on ${port}!`);
});

app.get('/', (req, res) => {
    res.send(
       "<h1>Connect Backend</h1>"
    )
})

// Create a new room, either randomly or with the requested configuration
app.post('/create-room', async (req, res) => {
    const payload = {
        "name": req.body.name,
        "description": req.body.description,
        "template_id": req.body.template_id,
        "region": req.body.region
    };

    try {
        const resData = await apiService.post("/rooms", payload);
        res.json(resData);
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});
 
// Create RoomCode from RoomId
app.post('/create-room-code', async (req, res) => {
    const { room_id, role } = req.body;

    const payload = {
        "room_id": req.body.room_id,
        "role": req.body.role || "guest",
    }
  
    if (!room_id || !role) {
      return res.status(400).json({ error: 'Room ID and role are required' });
    }

    try {
        const resData = await apiService.post(`/room-codes/room/${room_id}`, payload);
        res.json(resData);
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }


})

// Generate an auth token for a peer to join a room
app.post('/auth-token', (req, res) => {
    try {
        const token = tokenService.getAuthToken({ room_id: req.body['room_id'], user_id: req.body['user_id'], role: req.body['role'] });
        res.json({
            token: token,
            msg: "Token generated successfully!",
            success: true,
        });
    } catch (error) {
        res.json({
            msg: "Some error occured!",
            success: false,
        });
    }
});



// Get usage analytics for the latest Session in a Room :
// Fetch all the sessions for a specific room.
// Processes the session details of the latest session among them, to generate usage analytics.
// Here, we take the example of Attendance. The session details are fetched from the API call based on room id and then the response is used to calculate the following:

// Individual participants' duration in the call
// Aggregated participants' duration
// Total session duration

app.get('/session-analytics-by-room', async (req, res) => {
    try {
        const sessionListData = await apiService.get("/sessions", { room_id: req.query.room_id });
        if (sessionListData.data.length > 0) {
            const sessionData = sessionListData.data[0];
            console.log(sessionData);

            // Calculate individual participants' duration
            const peers = Object.values(sessionData.peers);
            const detailsByUser = peers.reduce((acc, peer) => {
                const duration = moment
                    .duration(moment(peer.left_at).diff(moment(peer.joined_at)))
                    .asMinutes();
                const roundedDuration = Math.round(duration * 100) / 100;
                acc[peer.user_id] = {
                    "name": peer.name,
                    "user_id": peer.user_id,
                    "duration": (acc[peer.user_id] || 0) + roundedDuration
                };
                return acc;
            }, {});
            const result = Object.values(detailsByUser);
            console.log(result);

            // Calculate aggregated participants' duration
            const totalDuration = result
                .reduce((a, b) => a + b.duration, 0)
                .toFixed(2);
            console.log(`Total duration for all peers: ${totalDuration} minutes`);

            // Calculate total session duration
            const sessionDuration = moment
                .duration(moment(sessionData.updated_at).diff(moment(sessionData.created_at)))
                .asMinutes()
                .toFixed(2);
            console.log(`Session duration is: ${sessionDuration} minutes`);

            res.json({
                "user_duration_list": result,
                "session_duration": sessionDuration,
                "total_peer_duration": totalDuration
            });
        } else {
            res.status(404).send("No session found for this room");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});


module.exports = app;
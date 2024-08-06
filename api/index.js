let express = require('express');
require('dotenv').config();
const chatRoutes = require('../src/routes/chatRoutes')
const cors = require('cors');

let app = express();
app.use(cors());
app.use(express.json()); // for parsing request body as JSON
let port = process.env.PORT || 5000;


app.listen(port, () => {
    console.log(`Server started on ${port}!`);
});

app.get('/', (req, res) => {
    res.send(
       "<h1>Connect Backend</h1>"
    )
})

app.use('/api', chatRoutes)


module.exports = app;
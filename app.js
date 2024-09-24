const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db'); 
const userRoutes = require('./routes/userRoutes.routes.js');
const roomRoutes = require('./routes/roomRoutes.routes.js');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 6000;

connectDB();

app.use(cors());
app.use(bodyParser.json());

app.use('/api/users', userRoutes);
app.use('/api/rooms', roomRoutes);
app.get('/',(req,res)=>{
  res.send("This is Backend of InteractiveWhiteboard");
})
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});

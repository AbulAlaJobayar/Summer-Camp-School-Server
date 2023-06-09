const express = require('express');
const app =express();
const cors = require('cors');
const port = process.env.PORT || 5000;


// middleware
app.use(cors())
app.use(express.json())




app.get('/', (req, res) => {
    res.send('assignment running with server!')
  })


  
  app.listen(port, () => {
    console.log(`assignment running on port ${port}`)
  })
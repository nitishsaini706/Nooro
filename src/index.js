const express = require('express');
const app = express();
const port = 3000;
const routes = require("./routes/index")

app.use(routes);

app.get("/",async(req,res)=>{
    res.json("server working fine")
})

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});

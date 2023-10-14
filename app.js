const express = require("express")
const bodyParser = require("body-parser")
const fs = require("fs")
const jwt = require("jsonwebtoken")

const app = express()
const SECRET_KEY = "feathers"
const PORT = 3000

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

//define user data
const usersData = JSON.parse(fs.readFileSync('users.json', 'utf8'));

//generate token
function generateToken(payload){
    return jwt.sign(payload, SECRET_KEY)
}

//verify token
function verifyToken(token){
    return jwt.verify(token, SECRET_KEY)
}

//check user
// function getUser(username, password){
//     return usersData.find((user) => user.username === username && user.password === password)
// }

//middleware
function verify(req, res, next){
    const bearerHeader = req.headers["authorization"]
    const token = bearerHeader && bearerHeader.split(' ')[1]

    if(!token){
        res.status(401).json({
            message: "No Token!"
        })
    }

    try {
        verifyToken(token)
        next()
    } catch (error) {
        res.status(500).json({
            message: "Wrong or Expired Token",
        })
    }
}

app.post("/login", (req, res) => {
    // console.log("Request Body:", req.body)
    const {username, password} = req.body
    const user = usersData.find((user) => user.username === username && user.password === password)
    // console.log("User Data:", usersData);
    // console.log("Username:", username);
    // console.log("Password:", password);
    if(user){
        const token = generateToken(username)
        res.json({
            message: `Welcome, ${username}!`,
            token: token
        });
    }else{
        res.status(401).json({
            message: "Invalid username or password"
        })
    }
})

app.get("/teachers", verify, (req, res) => {
    const teachersData = JSON.parse(fs.readFileSync('teachers.json', 'utf8'));
    res.send({data: teachersData})
})

app.listen(PORT, () => {
    console.log(`Server is running on PORT : ${PORT}`);
})
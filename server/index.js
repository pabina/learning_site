import express from "express";
import Jwt from "jsonwebtoken";
const app = express();

const PORT = 5000;

//for middleware
app.use(express.json());

const users = [
  {
    id: "1",
    userName: "pabina",
    password: "pabina1234",
    isAdmin: true,
  },
  {
    id: "2",
    userName: "pabinauser",
    password: "pabinauser1234",
    isAdmin: false,
  },
];
let refreshTokens = [];



app.post("/api/refresh", (req, res) => {
  // take the refresh token from the user
  let refreshToken = req.body.token;

  //send error if there is not token or the token is invalid

  if (!refreshToken) return res.status(401).json("you are not auth");
   if(!refreshTokens.includes(refreshToken)){
    return res.status(403).json("Refresh token is not valid")
   }
   Jwt.verify(refreshToken,"myRefreshSecreteKey",(err,user)=>{
    err && console.log(err);
   
    refreshTokens=refreshTokens.filter((token)=>token !==refreshToken);
    
    const newAccessToken=generateAccessToken(user)
    const newRefreshToken=generateRefreshToken(user)

    refreshTokens.push(newRefreshToken);

    res.status(200).json({
    accessToken:newAccessToken,
    refreshToken:newRefreshToken,
    })
   })
  //if everything is okay,create new access token,refresh token and send to user
});


//generate access token function
const generateAccessToken = (user) => {
    return Jwt.sign(
        { id: user.id, isAdmin: user.isAdmin },
        "mySecreteKey",
        { expiresIn: "15m" }
      );
};

//generate refresh token function
const generateRefreshToken = (user) => {
   return Jwt.sign(
        { id: user.id, isAdmin: user.isAdmin },
        "myRefreshSecreteKey",
        { expiresIn: "15m" }
      );
};

app.post("/api/login", (req, res) => {
  const { userName, password } = req.body;
  const user = users.find((u) => {
    return u.userName === userName && u.password === password;
  });
  if (user) {
    //generate and access token
   const accessToken= generateAccessToken(user);
    //gererate refresh token
   const refreshToken= generateRefreshToken(user); 
    //sending refresh token into array
     refreshTokens.push(refreshToken);

    res.json({
      userName: user.userName,
      isAdmin: user.isAdmin,
      accessToken,
      refreshToken
    });

    // res.json(user);
  } else {
    res.status(400).json("userName and password incorrect");
  }
});

const verify = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];


    Jwt.verify(token, "mySecreteKey", (err, user) => {
      if (err) {
        return res.status(403).json("token is not valid");
      }

      req.user = user;
      next();
    });
  } else {
    res.status(401).json("you are not authenticated");
  }
};

app.delete("/api/users/:userId", verify, (req, res) => {
  if (req.user.id === req.params.userId || req.user.isAdmin) {
    res.status(200).json("user has been delete");
  } else {
    res.status(403).json("you are not alllow to delete this user");
  }
});

app.listen(PORT, () => {
  console.log("backend server is working");
});

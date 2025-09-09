import axios from "axios";

const AUTH_URL = "http://20.244.56.144/evaluation-service/auth";
const clientID = "a52c9dd1-7708-4d58-a77a-6768d53f9040";
const clientSecret = "xDDFezptgbJMgHSu"; 
const accessCode = "sAWTuR";

let accessToken = null;
let tokenExpiry = null;

async function getToken() {
  const now = Math.floor(Date.now() / 1000);

  if (accessToken && tokenExpiry && now < tokenExpiry) {
    return accessToken;
  }

  try {
    const res = await axios.post(AUTH_URL, {
        "email": "kapoorpiyush1401@gmail.com",
        "name": "piyush kapoor",
        "rollNo": "2201641720071",
        "accessCode": accessCode,
        "clientID": clientID,
        "clientSecret": clientSecret
    });

    accessToken = res.data.access_token;
    tokenExpiry = now + res.data.expires_in - 60;

    return accessToken;
  } catch (err) {
    console.error("Failed to fetch token:", err.message);
    throw err;
  }
}

export default getToken;
import axios from "axios";
import getToken from "./updateToken.js";

const LOGGING_API = "http://20.244.56.144/evaluation-service/logs";

async function log(stack, level, pkg, message) {
  try {
    const token = await getToken();
    await axios.post(LOGGING_API,{ 
        stack, 
        level, 
        package: pkg, 
        message 
    },{ headers: { 
            Authorization: `Bearer ${token}` 
    }});
    console.log(`[${level.toUpperCase()}] ${pkg}: ${message}`);
  } catch (err) {
    console.error("Log failed:", err.response?.data || err.message);
  }
}

export default log;
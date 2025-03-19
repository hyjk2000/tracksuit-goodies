import axios from "axios";

const axiosClient = axios.create({
  baseURL: "https://www.stuff.co.nz/api/v1.0",
  headers: {
    Accept: "application/json",
    Referer: "https://www.stuff.co.nz/quizzes",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36",
  },
});

export default axiosClient;

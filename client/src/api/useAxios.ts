import axios from "axios";
import baseURL from "../utils/baseURL";

const useAxios = axios.create({
  baseURL: `${baseURL}api/v2/`,
  withCredentials: true,
});

export default useAxios;

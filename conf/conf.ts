// Application Configuration
export const BASE_URL = process.env.API_BASE_URL;
export const AppTitle = "Faith Tracker";
export const env = process.env.NODE_ENV || "development";

// Local Storage Keys
export const localStorageNames = {
  userLoggedInLocalStorageName: "userLoggedIn",
  lastActivityTimeLocalStorageName: "lastActivityTime",
  sessionTokenName: "sessionToken",
  userDataName: "userData",
};

// Route Constants
export const LOGIN_PATH = "/login";
export const ROOT_PATH = "/";

export default {
  BASE_URL,
  AppTitle,
  env,
  localStorageNames,
  LOGIN_PATH,
  ROOT_PATH,
};

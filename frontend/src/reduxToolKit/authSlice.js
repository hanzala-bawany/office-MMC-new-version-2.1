import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  loginUser :  JSON.parse(localStorage.getItem("loginUserData")) || null
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    loginUser : (state , action) =>{
      // console.log(state , "state");
      // console.log(action , "action");
      state.loginUser = action.payload;
    },
    logoutUser: (state) => {
      state.loginUser = null;
      // localStorage.removeItem('loginUser');
      // localStorage.removeItem('loginUserData');
      // localStorage.removeItem('persist:doctor');
      // localStorage.removeItem('persist:user');
      localStorage.clear();
    },
  },
})


export const { loginUser , logoutUser } = userSlice.actions

export default userSlice.reducer
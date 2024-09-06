import React, { useState } from 'react'
import "./login.css"
import assets from '../../assets/assets'
import { signup , login , resetPass} from '../../config/firebase'


const Login = () => {
  const [currentState, setCurrentState] = useState("Sign Up")
  const [userName, setUserName] = useState("")
  const [password, setPassword] = useState("")
  const [email, setEmail] = useState("")
  console.log(currentState);

  const submitHanlder = (e) => {
    e.preventDefault()
    if (currentState === "Sign Up") {
      signup(userName,email,password)
    }
    else {
      login(email,password)
    }
  }

  return (
    <div className='login'>
      <img src={assets.logo_big} alt="" className='logo'/>
      <form className='login-form'  onSubmit={submitHanlder}>
        <h2>{currentState}</h2>
        {currentState === "Sign Up"? <input onChange={(e)=> setUserName(e.target.value)} value={userName} type="text" placeholder="Username" required className="form-input" />: null}
        <input type="text" onChange={(e)=>setEmail(e.target.value)} value={email} placeholder="Email" required className="form-input" />
        <input type="text" onChange={(e)=> setPassword(e.target.value)} value={password} placeholder="Password" required className="form-input" />
        <button type='submit'>{currentState === "Sign Up"? "Create account": "Log In"}</button>
        <div className="login-term">
          <input type="checkbox"/>
          <p>Agree to the terms of use and privacy policy</p>
        </div>
        <div className="login-forgot">
          {currentState === "Sign Up"? 
          <p className="login-toggle">Already have an account <span onClick={() => setCurrentState("Log In")}>Login Here</span></p>
          :
          <p className="login-toggle">Create an account <span onClick={() => setCurrentState("Sign Up")}>Click Here</span></p>
          }
          {currentState === "Log In"? <p className="login-toggle">Forgot password <span onClick={() => resetPass(email)}>Reset Here</span></p> : null}
        </div>
      </form>
    </div>
  )
}

export default Login
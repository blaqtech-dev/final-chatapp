import { useState } from 'react' 
import assets from '../../assets/assets'
 import './login.css' 
 import { signUp, Login, resetPass } from '../../config/firebase' 


 export function LoginIn() { 
    const [currentState, setCurrentState] = useState('sign up') 
    const [username, setUsername] = useState('') 
    const [email, setEmail] = useState('') 
    const [password, setPassword] = useState('')


     const handleSubmitForm = (e) => { 
        e.preventDefault() 
        if (currentState === 'sign up') 
        { signUp(username, email, password) } 
        else { Login(email, password) } } 
        return (
        <div className='login'> 
        <img src={assets.chat_logo} className='login-img'/>
        <div className='login-container'>
        <form onSubmit={handleSubmitForm} className='login-form' >
             <h2>{currentState}</h2> {currentState === 'sign up' ? 
             <input onChange={(e) => setUsername(e.target.value)}
              value={username} type="text" placeholder='username' 
              className="form-input" required /> : null} 
              <input onChange={(e) => setEmail(e.target.value)} value={email} type="text" placeholder='email' className="form-input" required />
               <input onChange={(e) => setPassword(e.target.value)} value={password} type="password" placeholder='password' className="form-input" required /> 
               <button>{currentState === 'sign up' ? 'create account' : 'login'}</button> <div className='terms-condition'> <input type='checkbox' />
                <p>Agree to the terms and condition</p>
                 </div> 
                 <div className='forgot-login'> {currentState === 'sign up' ? <p>Already have an account <span onClick={() => setCurrentState('Login')}>login here</span>
                  </p> : <p>don't have an account <span onClick={() => setCurrentState('sign up')}>click here</span> </p>} {currentState === 'Login' ?
                   <p>forgot password <span onClick={() => resetPass(email)}>reset here</span> </p> : null} </div> </form> 
                   </div>
                  </div>
                )
                 }
import React, { useState }from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useContext } from 'react'
import { AppContent } from '../context/AppContext'

const ResetPassword = () => {

  const {backendURL} = React.useContext(AppContent);

  axios.defaults.withCredentials = true;

  const navigate = useNavigate();

  const [email, setEmail] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [isEmailSent, setIsEmailSent] = useState('');
  const [otp, setOtp] = useState(0);
  const [isOTPSubmitted, setIsOTPSubmitted] = useState(false);

  const inputRefs = React.useRef([]);

  const handleInput = (e, index) => {
    if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  }

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  }

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData('text');
    const pasteArray = paste.split('');
    pasteArray.forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
      }
    });
  }

  const onSubmitEmail = async (e) => {
    e.preventDefault();
    console.log('SUBMIT EMAIL TO RESET PASSWORD:', email);
    try {
      const {data} = await axios.post(backendURL + '/api/auth/send-reset-otp', {email});
      // if (data.success) {
        // toast.success(data.message);
        // setIsEmailSent(true);
        data.success ? (toast.success(data.message), setIsEmailSent(true)) : toast.error(data.message);
      // } else {
      //   toast.error(data.message);
      // }
    } catch (error) {
      toast.error(error.message)
    }
  }

const onSubmitOTP = async (e) => {
  e.preventDefault();

  // Combine OTP inputs
  const otpArray = inputRefs.current.map(e => e.value);
  const otpCode = otpArray.join('');
  setOtp(otpCode);

  try {
    const { data } = await axios.post(`${backendURL}/api/auth/reset-password-verify-otp`, {
      email,  // your user's email
      otp: otpCode
    });

    if (data.success) {
      toast.success("OTP verified! You can reset your password now.");
      setIsOTPSubmitted(true);
      // show the new password input form
    } else {
      toast.error(data.message); // will show "Invalid OTP" or "OTP Expired"
      // optionally clear inputs
      inputRefs.current.forEach(input => input.value = '');
      setIsOTPSubmitted(false);
    }

  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    setIsOTPSubmitted(false);
  }
};


  const onSubmitNewPassword = async (e) => {
    e.preventDefault();
    try {
      const {data} = await axios.post(backendURL + '/api/auth/reset-password', {email, otp, newPassword});
      data.success ? (toast.success(data.message), navigate('/login')) : toast.error(data.message);
    } catch (error) {
      toast.error(error.message)
    }
  }


  return (
     <div className='flex items-center justify-center min-h-screen bg-linear-to-br from-blue-200 to-purple-400'>
        <img onClick={() => navigate('/')} src={assets.logo} alt="" className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer'/>
        
        {/* Enter Email Address to Reset Password */}
        {!isEmailSent && 
          <form onSubmit={onSubmitEmail} className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>
            <h1 className='text-white text-2xl font-semibold text-center mb-4'>Reset Password</h1>
            <p className='text-center mb-6 text-indigo-300'>Enter your registered email address.</p>
            <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
              <img src={assets.mail_icon} alt="" className='w-3 h-3' />
              <input type="email" placeholder='Email Address' className='bg-transparent outline-none text-white'
                value={email} onChange={e => setEmail(e.target.value)} required/>
            </div>

            <button className='w-full py-2.5 rounded-full bg-linear-to-r from-indigo-500 to-indigo-900 text-white font-medium cursor-pointer'>Submit</button>
          </form>
        }

        {/* OTP Input form */}
        {!isOTPSubmitted && isEmailSent &&
          <form onSubmit={onSubmitOTP} className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>
          <h1 className='text-white text-2xl font-semibold text-center mb-4'>Reset Password OTP</h1>
          <p className='text-center mb-6 text-indigo-300'>Enter the 6-digit code that was sent to your email address.</p>
          <div className='flex justify-between mb-8' onPaste={handlePaste}>
            {Array(6).fill(0).map((_, index) => (
              <input type="text" maxLength={1} key={index} required className='w-12 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md'
                ref={e => inputRefs.current[index] = e}
                onInput={(e => handleInput(e, index))}
                onKeyDown={(e => handleKeyDown(e, index))}
              />
            ))}
          </div>

            <button className='w-full py-2.5 bg-linear-to-r from-indigo-500 to-indigo-800 rounded-full text-white'>Submit</button>

          </form>
        }

        {/* Enter New Password Form */}
        {isOTPSubmitted && isEmailSent &&
          <form onSubmit={onSubmitNewPassword} className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>
            <h1 className='text-white text-2xl font-semibold text-center mb-4'>New Password</h1>
            <p className='text-center mb-6 text-indigo-300'>Enter your new password below.</p>
            <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
              <img src={assets.lock_icon} alt="" className='w-3 h-3' />
              <input type="password" placeholder='Password' className='bg-transparent outline-none text-white'
                value={newPassword} onChange={e => setNewPassword(e.target.value)} required/>
            </div>

            <button className='w-full py-2.5 rounded-full bg-linear-to-r from-indigo-500 to-indigo-900 text-white font-medium cursor-pointer'>Submit</button>
          </form>
        }      

    </div>
  )
}

export default ResetPassword

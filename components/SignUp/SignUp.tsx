"use client";

import { useState } from "react";
import Image from "next/image";
import googleIcon from "@/assets/google.svg";

interface SignUpFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

function SignUpForm() {
  //Old way of storing user inputed information
  /*
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  */

  //Form state saving user inputed data and updated as input is typed
  const [signUpData, setSignUpData] = useState<SignUpFormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-md w-full max-w-xl">
      <h2 className="text-2xl font-bold mb-4">Sign Up For An Account</h2>
      <div className="text-sm text-gray-600 mb-2">
        Enter your email to sign up for Smart Trip
      </div>
      <form className="space-y-4">
        <input
          type="firstName"
          placeholder="First Name"
          value={signUpData.firstName}
          onChange={(e) =>
            setSignUpData({ ...signUpData, firstName: e.target.value })
          }
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
        />
        <input
          type="lastName"
          placeholder="Last Name"
          value={signUpData.lastName}
          onChange={(e) =>
            setSignUpData({ ...signUpData, lastName: e.target.value })
          }
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
        />
        <input
          type="email"
          placeholder="email@domain.com"
          value={signUpData.email}
          onChange={(e) =>
            setSignUpData({ ...signUpData, email: e.target.value })
          }
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
        />
        <input
          type="password"
          placeholder="Enter your password"
          value={signUpData.password}
          onChange={(e) =>
            setSignUpData({ ...signUpData, password: e.target.value })
          }
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
        />
        <button
          type="submit"
          className="bg-black text-white rounded-lg w-full font-medium py-2 hover:bg-gray-800 transition"
        >
          Sign up with email
        </button>
        <div className="flex items-center my-4">
          <hr className="flex-grow border-gray-300" />
          <span className="px-2 text-sm text-gray-400">or continue with</span>
          <hr className="flex-grow border-gray-300" />
        </div>
        <button
          type="button"
          className="w-full flex items-center justify-center border border-gray-300 rounded-lg py-2 hover:bg-gray-50 transition"
        >
          <Image src={googleIcon} alt="google icon" className="w-5 h-5 mr-2" />
          <span className="font-medium">Google</span>
        </button>
      </form>
    </div>
  );
}

export default SignUpForm;

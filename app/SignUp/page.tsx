import SignUpForm from "@/components/SignUp/SignUp";
import LoginForm from "@/components/Login/Login";

export default function SignUp() {
  return (
    <div className="flex m-4 p-8 justify-center gap-8">
      <LoginForm></LoginForm>
      <SignUpForm></SignUpForm>
    </div>
  );
}

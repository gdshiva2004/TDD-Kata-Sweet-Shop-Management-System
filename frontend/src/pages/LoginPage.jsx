import LoginForm from "../components/LoginForm";
import AnimatedCard from "../components/AnimatedCard";

export default function LoginPage() {
  return (
    <AnimatedCard>
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>Welcome Back</h2>
      <LoginForm />
    </AnimatedCard>
  );
}

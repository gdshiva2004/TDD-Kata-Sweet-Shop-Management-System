import RegisterForm from "../components/RegisterForm";
import AnimatedCard from "../components/AnimatedCard";

export default function RegisterPage() {
  return (
    <AnimatedCard>
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>Create Account</h2>
      <RegisterForm />
    </AnimatedCard>
  );
}

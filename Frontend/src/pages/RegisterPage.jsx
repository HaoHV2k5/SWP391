import RegisterForm from "../components/register/RegisterForm";
import RegisterHero from "../components/register/RegisterHero";

const RegisterPage = () => {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      background: "white"
    }}>
      <RegisterHero />
      <RegisterForm />
    </div>
  );
};

export default RegisterPage;

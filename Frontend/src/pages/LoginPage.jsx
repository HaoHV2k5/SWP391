import LoginForm from "../components/login/LoginForm";
import LoginHero from "../components/login/LoginHero";

const LoginPage = ({ onLogin }) => {
  return (
    <div style={{
        minHeight: "100vh",
        display: "flex",
      background: "white"
    }}>
      <LoginHero />
      <LoginForm onLogin={onLogin} />
    </div>
  );
};

export default LoginPage;

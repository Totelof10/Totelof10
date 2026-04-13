import React, { useState } from 'react';
import '../style/login.css';
import { Link, useNavigate } from 'react-router-dom';
import { saveToken } from '../../../services/AUTH';
import API from '../../../services/API';
import { toast } from 'react-toastify';
import AuthLayout from '../components/AuthLayout';

function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      toast.warning("Veuillez remplir tous les champs", { autoClose: 2000 });
      return;
    }

    setIsLoading(true);
    try {
      const response = await API.post("/auth/login", {
        username,
        password
      });
      
      await new Promise((resolve) => setTimeout(resolve, 700));
      
      if(response.status === 200){
        saveToken(response.data.accessToken);
        toast.success("Connexion réussie !", {
          autoClose: 1500,
          onClose: () => navigate("/dashboard")
        });
      }else{
        toast.error("Identifiants incorrects", { autoClose: 2000 });
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      if (error.response?.status === 401) {
        toast.error("Nom d'utilisateur ou mot de passe incorrect", { autoClose: 2500 });
      } else {
        toast.error("Erreur de connexion au serveur", { autoClose: 2500 });
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
    {isLoading && (
        <div className="login-loading-overlay">
          <div className="login-loading"></div>
        </div>
      )}
    <AuthLayout
      title="Connexion"
      subtitle="Accedez a votre espace professionnel"
      sideTitle="Pilotez votre activite avec precision"
      sideText="Une interface simple, rapide et adaptée au quotidien des equipes commerciales."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className={`auth-field${username ? ' filled' : ''}`}>
          <input type="text" id="username" className="auth-input" placeholder=" " value={username} onChange={e => setUsername(e.target.value)} />
          <label htmlFor="username" className="auth-label">Nom d'utilisateur</label>
        </div>

        <div className={`auth-field${password ? ' filled' : ''}`}>
          <input type="password" id="password" className="auth-input" placeholder=" " value={password} onChange={e => setPassword(e.target.value)} />
          <label htmlFor="password" className="auth-label">Mot de passe</label>
        </div>

        <button type="submit" className="auth-button" disabled={isLoading}>
          {isLoading ? 'Connexion...' : 'Se connecter'}
        </button>

        <div className="auth-links-row">
          <Link to="/register" className='auth-link'>Creer un compte</Link>
          <Link to="/forgot-password" className='auth-link'>Mot de passe oublie ?</Link>
        </div>

        <p className="auth-demo-hint">Compte demo: demo / demo123</p>
      </form>
    </AuthLayout>
    </>
  )
}

export default Login
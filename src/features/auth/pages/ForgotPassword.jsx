import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../style/login.css';
import AuthLayout from '../components/AuthLayout';

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.warning('Veuillez entrer votre adresse email.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Lien de reinitialisation envoye.');
      navigate("/");
    }, 900);
  }

  return (
    <>
    {isLoading && (
        <div className="login-loading-overlay">
          <div className="login-loading"></div>
        </div>
      )}
    <AuthLayout
      title="Mot de passe oublie"
      subtitle="Recevez un lien de reinitialisation sur votre email"
      sideTitle="Recuperez votre acces rapidement"
      sideText="Nous vous guidons avec une procedure simple et securisee pour retrouver votre compte."
      footer={<Link to="/" className='auth-link'>Retour a la connexion</Link>}
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className={`auth-field${email ? ' filled' : ''}`}>
          <input type="email" id="email" className="auth-input" placeholder=" " value={email} onChange={e => setEmail(e.target.value)} />
          <label htmlFor="email" className="auth-label">Adresse email</label>
        </div>
        <button type="submit" className="auth-button" disabled={isLoading}>
          {isLoading ? 'Envoi...' : 'Envoyer le lien'}
        </button>
      </form>
    </AuthLayout>
    </>
  )
}

export default ForgotPassword
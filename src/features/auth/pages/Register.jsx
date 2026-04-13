import React, { useState } from 'react';
import '../style/login.css';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../../services/API';
import { toast } from 'react-toastify';
import AuthLayout from '../components/AuthLayout';

function Register() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Champs du formulaire
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!username.trim() || username.length < 3) newErrors.username = "Min. 3 caractères";
    if (!firstName.trim()) newErrors.firstName = "Prénom obligatoire";
    if (!lastName.trim()) newErrors.lastName = "Nom obligatoire";
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email invalide";
    if (!password || password.length < 8) newErrors.password = "Min. 8 caractères";
    if (password !== confirmPassword) newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const response = await API.post("/auth/register", {
        username,
        password,
        email,
        firstName,
        lastName
      });

      if (response.status === 201) {
        toast.success("Compte créé avec succès ! Connectez-vous.", {
          autoClose: 2500,
          onClose: () => navigate("/")
        });
      }
    } catch (error) {
      const msg = error.response?.data || "Erreur lors de l'inscription";
      toast.error(typeof msg === 'string' ? msg : "Erreur lors de l'inscription", {
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && (
        <div className="login-loading-overlay">
          <div className="login-loading"></div>
        </div>
      )}
      <AuthLayout
        title="Creer un compte"
        subtitle="Configurez votre acces en quelques secondes"
        sideTitle="Demarrez avec une base solide"
        sideText="Centralisez clients, produits et operations dans une interface claire et fiable."
        reverse
        footer={<Link to="/" className='auth-link'>Deja un compte ? Se connecter</Link>}
      >
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-row">
            <div className={`auth-field${firstName ? ' filled' : ''}${errors.firstName ? ' has-error' : ''}`}>
              <input type="text" id="reg-firstName" className="auth-input" placeholder=" " value={firstName} onChange={e => setFirstName(e.target.value)} />
              <label htmlFor="reg-firstName" className="auth-label">Prenom</label>
              {errors.firstName && <span className="auth-error">{errors.firstName}</span>}
            </div>
            <div className={`auth-field${lastName ? ' filled' : ''}${errors.lastName ? ' has-error' : ''}`}>
              <input type="text" id="reg-lastName" className="auth-input" placeholder=" " value={lastName} onChange={e => setLastName(e.target.value)} />
              <label htmlFor="reg-lastName" className="auth-label">Nom</label>
              {errors.lastName && <span className="auth-error">{errors.lastName}</span>}
            </div>
          </div>

          <div className={`auth-field${username ? ' filled' : ''}${errors.username ? ' has-error' : ''}`}>
            <input type="text" id="reg-username" className="auth-input" placeholder=" " value={username} onChange={e => setUsername(e.target.value)} />
            <label htmlFor="reg-username" className="auth-label">Nom d'utilisateur</label>
            {errors.username && <span className="auth-error">{errors.username}</span>}
          </div>

          <div className={`auth-field${email ? ' filled' : ''}${errors.email ? ' has-error' : ''}`}>
            <input type="email" id="reg-email" className="auth-input" placeholder=" " value={email} onChange={e => setEmail(e.target.value)} />
            <label htmlFor="reg-email" className="auth-label">Adresse email</label>
            {errors.email && <span className="auth-error">{errors.email}</span>}
          </div>

          <div className={`auth-field${password ? ' filled' : ''}${errors.password ? ' has-error' : ''}`}>
            <input type="password" id="reg-password" className="auth-input" placeholder=" " value={password} onChange={e => setPassword(e.target.value)} />
            <label htmlFor="reg-password" className="auth-label">Mot de passe</label>
            {errors.password && <span className="auth-error">{errors.password}</span>}
            {password && (
              <div className="password-strength">
                <div className={`password-strength-bar ${password.length >= 12 ? 'strong' : password.length >= 8 ? 'medium' : 'weak'}`}></div>
                <span className="password-strength-text">
                  {password.length >= 12 ? 'Fort' : password.length >= 8 ? 'Moyen' : 'Faible'}
                </span>
              </div>
            )}
          </div>

          <div className={`auth-field${confirmPassword ? ' filled' : ''}${errors.confirmPassword ? ' has-error' : ''}`}>
            <input type="password" id="reg-confirmPassword" className="auth-input" placeholder=" " value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            <label htmlFor="reg-confirmPassword" className="auth-label">Confirmer le mot de passe</label>
            {errors.confirmPassword && <span className="auth-error">{errors.confirmPassword}</span>}
          </div>

          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? 'Inscription...' : "S'inscrire"}
          </button>
        </form>
      </AuthLayout>
    </>
  )
}

export default Register
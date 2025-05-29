// src/pages/Login.jsx
import React, { useState, useRef, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Toast } from 'primereact/toast';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import useAuth from '../auth/useAuth';

const schema = Yup.object().shape({
  email:    Yup.string().email('E-mail invalide').required("L'adresse e-mail est requise"),
  password: Yup.string().required('Le mot de passe est requis')
});

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [errors, setErrors] = useState({});
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const toast = useRef(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  // handle resize for responsive layout
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setErrors({});
    try {
      await schema.validate(form, { abortEarly: false });
      const user = await login(form.email, form.password);
      if (user.role === 'PATIENT') navigate('/profile');
      else navigate('/patients');
    } catch (err) {
      if (err.name === 'ValidationError') {
        const fieldErrors = {};
        err.inner.forEach(({ path, message }) => (fieldErrors[path] = message));
        setErrors(fieldErrors);
      } else {
        toast.current.show({
          severity: 'error',
          summary:  'Échec de la connexion',
          detail:   err.response?.data?.message || 'Veuillez réessayer',
          life:     3000
        });
      }
    }
  };

  const colors = {
    primary:   '#3b82f6',
    secondary: '#10b981',
    accent:    '#6366f1',
    dark:      '#1e293b',
    light:     '#f8fafc'
  };

  return (
    <>
      <Toast ref={toast} />

      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        minHeight: 'calc(100vh - 128px)'  /* leave space for Header/Footer */
      }}>
        {/* Branding column */}
        {!isMobile && (
          <div style={{
            flex: 1,
            background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(16,185,129,0.1))',
            padding: '3rem',
            color: colors.dark,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ maxWidth: 400 }}>
              <div style={{ display:'flex', alignItems:'center', marginBottom: '2rem' }}>
                <i className="fas fa-shield-alt" style={{ fontSize: 32, color: colors.primary, marginRight: '0.5rem' }} />
                <span style={{ fontSize: 40, fontWeight: 'bold', color: colors.primary }}>MedSafe</span>
              </div>
              <h1 style={{ fontSize: 28, marginBottom: '1rem' }}>Bienvenue</h1>
              <p style={{ color: '#4a5568', marginBottom: '2rem' }}>
                Accédez en toute sécurité à vos dossiers médicaux, rendez-vous, ordonnances.
              </p>
            </div>
          </div>
        )}

        {/* Login form column */}
        <div style={{
          flex:1,
          display:'flex',
          alignItems:'center',
          justifyContent:'center',
          padding: '2rem',
          background: '#fff'
        }}>
          <div style={{
            width:'100%',
            maxWidth:360,
            padding:'2rem',
            boxShadow:'0 4px 12px rgba(0,0,0,0.05)',
            borderRadius:8,
            background:'#fff'
          }}>
            {/* Mobile header */}
            {isMobile && (
              <div style={{ textAlign:'center', marginBottom:'1.5rem' }}>
                <i className="fas fa-shield-alt" style={{ fontSize:28, color:colors.primary, marginRight:'0.5rem' }} />
                <span style={{ fontSize:20, fontWeight:'bold', color:colors.primary }}>MedSafe</span>
                <h2 style={{ marginTop:'1rem', fontSize:22 }}>Connexion au portail patient</h2>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
              {/* Email */}
              <div>
                <label htmlFor="email" style={{ display:'block', marginBottom:4, color:colors.dark }}>
                  Adresse e-mail
                </label>
                <div style={{ position:'relative' }}>
                  <i className="fas fa-envelope" style={{
                    position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#9ca3af'
                  }}/>
                  <InputText
                    id="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="input-focus"
                    placeholder="Entrez votre adresse e-mail"
                    style={{
                      width:'100%',
                      padding:'0.75rem 1rem 0.75rem 2.5rem',
                      border:'1px solid #d1d5db',
                      borderRadius:4
                    }}
                  />
                </div>
                {errors.email && <small style={{ color:colors.accent }}>{errors.email}</small>}
              </div>

              {/* Password */}
              <div>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                  <label htmlFor="password" style={{ color:colors.dark }}>Mot de passe</label>
                  <a href="#" style={{ color:colors.primary, textDecoration:'none' }}>Mot de passe oublié ?</a>
                </div>
                <div style={{ position:'relative' }}>
                  <i className="fas fa-lock" style={{
                    position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#9ca3af'
                  }}/>
                  <Password
                    id="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    toggleMask
                    feedback={false}
                    placeholder="Entrez votre mot de passe"
                    inputStyle={{
                      width:'100%',
                      padding:'0.75rem 1rem 0.75rem 2.5rem',
                      border:'1px solid #d1d5db',
                      borderRadius:4
                    }}
                    className="input-focus"
                  />
                </div>
                {errors.password && <small style={{ color:colors.accent }}>{errors.password}</small>}
              </div>

              {/* Remember me */}
              <div style={{ display:'flex', alignItems:'center' }}>
                <Checkbox
                  id="remember"
                  name="remember"
                  checked={form.remember}
                  onChange={handleChange}
                />
                <label htmlFor="remember" style={{ marginLeft:8, color:colors.dark }}>Se souvenir de moi</label>
              </div>

              {/* Submit */}
              <Button
                label="Se connecter"
                type="submit"
                style={{
                  width:'100%',
                  background:colors.primary,
                  border:0,
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'center'
                }}
              >
                <i className="fas fa-arrow-right" style={{ marginLeft:8 }} />
              </Button>

              {/* Signup */}
              <div style={{ textAlign:'center', marginTop:'1rem' }}>
                <small style={{ color:'#6b7280' }}>
                  Nouveau sur MedSafe?{' '}
                  <a onClick={() => navigate('/register')} style={{ color:colors.primary }}>Créer un compte</a>
                </small>
              </div>

              {/* Terms */}
              <div style={{ textAlign:'center', marginTop:'1rem' }}>
                <small style={{ color:'#9ca3af' }}>
                  En vous connectant, vous acceptez nos{' '}
                  <a style={{ color:colors.primary }}>Conditions d'utilisation</a> et{' '}
                  <a style={{ color:colors.primary }}>Politique de confidentialité</a>.
                </small>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

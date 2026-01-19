import { API_URL } from '../config/api';
import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar usuario al iniciar
  useEffect(() => {
    const loadUser = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }

        // Configurar el header por defecto
        axios.defaults.headers.common['x-auth-token'] = token;

        try {
            // Pedimos los datos reales del usuario al backend
            const res = await axios.get('${API_URL}/api/auth/me');
            setUser({ ...res.data, token }); 
        } catch (error) {
            console.error("Error al cargar usuario (token vencido o inválido):", error);
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['x-auth-token'];
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    loadUser();
  }, []);

  const login = async (email, password, role) => {
    // NOTA: El endpoint real dependerá de tu backend. 
    // Por ahora conectamos con la ruta que vimos antes: /api/auth/login
    try {
      const res = await axios.post('${API_URL}/api/auth/login', {
        email,
        password
      });

      // Guardar token
      localStorage.setItem('token', res.data.token);
      axios.defaults.headers.common['x-auth-token'] = res.data.token;
      
      setUser({ ...res.data.user, role: res.data.role }); // Guardamos datos del usuario + rol
      return { success: true };
    } catch (error) {
        console.error("Error Login:", error.response?.data?.msg || error.message);
        return { 
            success: false, 
            error: error.response?.data?.msg || "Error al iniciar sesión" 
        };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['x-auth-token'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, setUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};


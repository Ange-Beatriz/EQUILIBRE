import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export const Dashboard = () => {
  const { user, logout, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <h1>Dashboard</h1>
        <button
          onClick={logout}
          style={{
            padding: '10px 20px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Se déconnecter
        </button>
      </div>

      <div style={{ 
        padding: '20px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h2>Bienvenue, {user?.name} !</h2>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>ID:</strong> {user?.id}</p>
      </div>

      <div style={{ 
        padding: '20px', 
        backgroundColor: '#e7f3ff', 
        borderRadius: '8px'
      }}>
        <h3>Authentification réussie</h3>
        <p>Vous êtes maintenant connecté à l'application.</p>
        <p>Votre token JWT est stocké dans le localStorage.</p>
      </div>
    </div>
  );
};

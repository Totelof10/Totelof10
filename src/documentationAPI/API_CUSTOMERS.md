# API Clients (CustomerController)

## Vue d'ensemble

Cette API permet de gérer les clients avec leurs informations de contact et coordonnées.

## Endpoints disponibles

### 1. Récupérer tous les clients
```
GET /api/customers
```

**Réponse :**
```json
[
  {
    "id": 1,
    "name": "Jean Dupont",
    "email": "jean.dupont@email.com",
    "phone": "0123456789",
    "address": "123 Rue de la Paix, 75001 Paris"
  },
  {
    "id": 2,
    "name": "Marie Martin",
    "email": "marie.martin@email.com",
    "phone": "0987654321",
    "address": "456 Avenue des Champs, 69000 Lyon"
  }
]
```

### 2. Récupérer un client par ID
```
GET /api/customers/{id}
```

**Réponse :**
```json
{
  "id": 1,
  "name": "Jean Dupont",
  "email": "jean.dupont@email.com",
  "phone": "0123456789",
  "address": "123 Rue de la Paix, 75001 Paris"
}
```

### 3. Créer un nouveau client
```
POST /api/customers
```

**Corps de la requête :**
```json
{
  "name": "Nouveau Client",
  "email": "nouveau.client@email.com",
  "phone": "0123456789",
  "address": "789 Boulevard Central, 13000 Marseille"
}
```

### 4. Mettre à jour un client
```
PUT /api/customers/{id}
```

**Corps de la requête :**
```json
{
  "name": "Jean Dupont Modifié",
  "email": "jean.dupont.modifie@email.com",
  "phone": "0123456789",
  "address": "123 Rue de la Paix, 75001 Paris"
}
```

### 5. Supprimer un client
```
DELETE /api/customers/{id}
```

**Notes :**
- Vérifiez qu'aucune commande n'est associée à ce client avant suppression

## Exemples d'utilisation

### Créer un client avec React

```jsx
import React, { useState } from 'react';

const CustomerForm = () => {
  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData)
      });

      if (response.ok) {
        const createdCustomer = await response.json();
        alert('Client créé avec succès !');
        console.log('Client créé:', createdCustomer);
        
        // Réinitialiser le formulaire
        setCustomerData({
          name: '',
          email: '',
          phone: '',
          address: ''
        });
      } else {
        alert('Erreur lors de la création du client');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la création du client');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Nom du client:</label>
        <input
          type="text"
          value={customerData.name}
          onChange={(e) => setCustomerData({...customerData, name: e.target.value})}
          required
        />
      </div>

      <div>
        <label>Email:</label>
        <input
          type="email"
          value={customerData.email}
          onChange={(e) => setCustomerData({...customerData, email: e.target.value})}
          required
        />
      </div>

      <div>
        <label>Téléphone:</label>
        <input
          type="tel"
          value={customerData.phone}
          onChange={(e) => setCustomerData({...customerData, phone: e.target.value})}
          required
        />
      </div>

      <div>
        <label>Adresse:</label>
        <textarea
          value={customerData.address}
          onChange={(e) => setCustomerData({...customerData, address: e.target.value})}
          required
        />
      </div>

      <button type="submit">Créer le client</button>
    </form>
  );
};

export default CustomerForm;
```

### Lister tous les clients

```javascript
const getAllCustomers = async () => {
  try {
    const response = await fetch('/api/customers');
    
    if (response.ok) {
      const customers = await response.json();
      console.log('Clients:', customers);
      return customers;
    } else {
      console.error('Erreur lors de la récupération des clients');
      return [];
    }
  } catch (error) {
    console.error('Erreur:', error);
    return [];
  }
};

// Exemple d'utilisation
getAllCustomers().then(customers => {
  customers.forEach(customer => {
    console.log(`${customer.name} - ${customer.email}`);
  });
});
```

### Récupérer un client par ID

```javascript
const getCustomerById = async (customerId) => {
  try {
    const response = await fetch(`/api/customers/${customerId}`);
    
    if (response.ok) {
      const customer = await response.json();
      console.log('Client:', customer);
      return customer;
    } else if (response.status === 404) {
      console.error('Client non trouvé');
      return null;
    } else {
      console.error('Erreur lors de la récupération du client');
      return null;
    }
  } catch (error) {
    console.error('Erreur:', error);
    return null;
  }
};

// Exemple d'utilisation
getCustomerById(1);
```

### Mettre à jour un client

```javascript
const updateCustomer = async (customerId, updatedData) => {
  try {
    const response = await fetch(`/api/customers/${customerId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedData)
    });

    if (response.ok) {
      const updatedCustomer = await response.json();
      console.log('Client mis à jour:', updatedCustomer);
      return updatedCustomer;
    } else if (response.status === 404) {
      console.error('Client non trouvé');
      return null;
    } else {
      console.error('Erreur lors de la mise à jour du client');
      return null;
    }
  } catch (error) {
    console.error('Erreur:', error);
    return null;
  }
};

// Exemple d'utilisation
updateCustomer(1, {
  name: 'Jean Dupont Modifié',
  email: 'jean.dupont.modifie@email.com',
  phone: '0123456789',
  address: '123 Rue de la Paix, 75001 Paris'
});
```

### Supprimer un client

```javascript
const deleteCustomer = async (customerId) => {
  try {
    const response = await fetch(`/api/customers/${customerId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      console.log('Client supprimé avec succès');
      return true;
    } else {
      console.error('Erreur lors de la suppression du client');
      return false;
    }
  } catch (error) {
    console.error('Erreur:', error);
    return false;
  }
};

// Exemple d'utilisation
deleteCustomer(1);
```

### Composant de liste des clients avec React

```jsx
import React, { useState, useEffect } from 'react';

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers');
      
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      } else {
        setError('Erreur lors de la récupération des clients');
      }
    } catch (error) {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (customerId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      try {
        const response = await fetch(`/api/customers/${customerId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setCustomers(customers.filter(customer => customer.id !== customerId));
          alert('Client supprimé avec succès');
        } else {
          alert('Erreur lors de la suppression du client');
        }
      } catch (error) {
        alert('Erreur lors de la suppression du client');
      }
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;

  return (
    <div>
      <h2>Liste des clients</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nom</th>
            <th>Email</th>
            <th>Téléphone</th>
            <th>Adresse</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map(customer => (
            <tr key={customer.id}>
              <td>{customer.id}</td>
              <td>{customer.name}</td>
              <td>{customer.email}</td>
              <td>{customer.phone}</td>
              <td>{customer.address}</td>
              <td>
                <button onClick={() => handleDelete(customer.id)}>
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerList;
```

## Validation

- `name` : **OBLIGATOIRE** - Nom du client
- `email` : **OBLIGATOIRE** - Adresse email valide
- `phone` : **OBLIGATOIRE** - Numéro de téléphone
- `address` : **OBLIGATOIRE** - Adresse complète

## Codes d'erreur

- `400 Bad Request` : Données invalides
- `404 Not Found` : Client introuvable
- `500 Internal Server Error` : Erreur serveur

## Fonctionnalités

- **Gestion complète CRUD** : Création, lecture, mise à jour, suppression
- **Validation des données** : Vérification des champs obligatoires
- **Gestion des erreurs** : Codes d'erreur appropriés 
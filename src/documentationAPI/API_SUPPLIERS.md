# API Fournisseurs (SupplierController)

## Vue d'ensemble

Cette API permet de gérer les fournisseurs avec leurs informations de contact et coordonnées.

## Endpoints disponibles

### 1. Récupérer tous les fournisseurs
```
GET /api/suppliers
```

**Réponse :**
```json
[
  {
    "id": 1,
    "name": "Fournisseur A",
    "email": "fournisseur@email.com",
    "phone": "0123456789",
    "address": "123 Rue du Commerce, 75001 Paris"
  },
  {
    "id": 2,
    "name": "Fournisseur B",
    "email": "fournisseur2@email.com",
    "phone": "0987654321",
    "address": "456 Avenue de l'Industrie, 69000 Lyon"
  }
]
```

### 2. Récupérer un fournisseur par ID
```
GET /api/suppliers/{id}
```

**Réponse :**
```json
{
  "id": 1,
  "name": "Fournisseur A",
  "email": "fournisseur@email.com",
  "phone": "0123456789",
  "address": "123 Rue du Commerce, 75001 Paris"
}
```

### 3. Créer un nouveau fournisseur
```
POST /api/suppliers
```

**Corps de la requête :**
```json
{
  "name": "Nouveau Fournisseur",
  "email": "nouveau.fournisseur@email.com",
  "phone": "0123456789",
  "address": "789 Boulevard des Affaires, 13000 Marseille"
}
```

### 4. Mettre à jour un fournisseur
```
PUT /api/suppliers/{id}
```

**Corps de la requête :**
```json
{
  "name": "Fournisseur A Modifié",
  "email": "fournisseur.modifie@email.com",
  "phone": "0123456789",
  "address": "123 Rue du Commerce, 75001 Paris"
}
```

### 5. Supprimer un fournisseur
```
DELETE /api/suppliers/{id}
```

**Notes :**
- Vérifiez qu'aucun produit n'est associé à ce fournisseur avant suppression

## Exemples d'utilisation

### Créer un fournisseur avec React

```jsx
import React, { useState } from 'react';

const SupplierForm = () => {
  const [supplierData, setSupplierData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/suppliers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(supplierData)
      });

      if (response.ok) {
        const createdSupplier = await response.json();
        alert('Fournisseur créé avec succès !');
        console.log('Fournisseur créé:', createdSupplier);
        
        // Réinitialiser le formulaire
        setSupplierData({
          name: '',
          email: '',
          phone: '',
          address: ''
        });
      } else {
        alert('Erreur lors de la création du fournisseur');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la création du fournisseur');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Nom du fournisseur:</label>
        <input
          type="text"
          value={supplierData.name}
          onChange={(e) => setSupplierData({...supplierData, name: e.target.value})}
          required
        />
      </div>

      <div>
        <label>Email:</label>
        <input
          type="email"
          value={supplierData.email}
          onChange={(e) => setSupplierData({...supplierData, email: e.target.value})}
          required
        />
      </div>

      <div>
        <label>Téléphone:</label>
        <input
          type="tel"
          value={supplierData.phone}
          onChange={(e) => setSupplierData({...supplierData, phone: e.target.value})}
          required
        />
      </div>

      <div>
        <label>Adresse:</label>
        <textarea
          value={supplierData.address}
          onChange={(e) => setSupplierData({...supplierData, address: e.target.value})}
          required
        />
      </div>

      <button type="submit">Créer le fournisseur</button>
    </form>
  );
};

export default SupplierForm;
```

### Lister tous les fournisseurs

```javascript
const getAllSuppliers = async () => {
  try {
    const response = await fetch('/api/suppliers');
    
    if (response.ok) {
      const suppliers = await response.json();
      console.log('Fournisseurs:', suppliers);
      return suppliers;
    } else {
      console.error('Erreur lors de la récupération des fournisseurs');
      return [];
    }
  } catch (error) {
    console.error('Erreur:', error);
    return [];
  }
};

// Exemple d'utilisation
getAllSuppliers().then(suppliers => {
  suppliers.forEach(supplier => {
    console.log(`${supplier.name} - ${supplier.email}`);
  });
});
```

### Récupérer un fournisseur par ID

```javascript
const getSupplierById = async (supplierId) => {
  try {
    const response = await fetch(`/api/suppliers/${supplierId}`);
    
    if (response.ok) {
      const supplier = await response.json();
      console.log('Fournisseur:', supplier);
      return supplier;
    } else if (response.status === 404) {
      console.error('Fournisseur non trouvé');
      return null;
    } else {
      console.error('Erreur lors de la récupération du fournisseur');
      return null;
    }
  } catch (error) {
    console.error('Erreur:', error);
    return null;
  }
};

// Exemple d'utilisation
getSupplierById(1);
```

### Mettre à jour un fournisseur

```javascript
const updateSupplier = async (supplierId, updatedData) => {
  try {
    const response = await fetch(`/api/suppliers/${supplierId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedData)
    });

    if (response.ok) {
      const updatedSupplier = await response.json();
      console.log('Fournisseur mis à jour:', updatedSupplier);
      return updatedSupplier;
    } else if (response.status === 404) {
      console.error('Fournisseur non trouvé');
      return null;
    } else {
      console.error('Erreur lors de la mise à jour du fournisseur');
      return null;
    }
  } catch (error) {
    console.error('Erreur:', error);
    return null;
  }
};

// Exemple d'utilisation
updateSupplier(1, {
  name: 'Fournisseur A Modifié',
  email: 'fournisseur.modifie@email.com',
  phone: '0123456789',
  address: '123 Rue du Commerce, 75001 Paris'
});
```

### Supprimer un fournisseur

```javascript
const deleteSupplier = async (supplierId) => {
  try {
    const response = await fetch(`/api/suppliers/${supplierId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      console.log('Fournisseur supprimé avec succès');
      return true;
    } else {
      console.error('Erreur lors de la suppression du fournisseur');
      return false;
    }
  } catch (error) {
    console.error('Erreur:', error);
    return false;
  }
};

// Exemple d'utilisation
deleteSupplier(1);
```

### Composant de liste des fournisseurs avec React

```jsx
import React, { useState, useEffect } from 'react';

const SupplierList = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/suppliers');
      
      if (response.ok) {
        const data = await response.json();
        setSuppliers(data);
      } else {
        setError('Erreur lors de la récupération des fournisseurs');
      }
    } catch (error) {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (supplierId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) {
      try {
        const response = await fetch(`/api/suppliers/${supplierId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setSuppliers(suppliers.filter(supplier => supplier.id !== supplierId));
          alert('Fournisseur supprimé avec succès');
        } else {
          alert('Erreur lors de la suppression du fournisseur');
        }
      } catch (error) {
        alert('Erreur lors de la suppression du fournisseur');
      }
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;

  return (
    <div>
      <h2>Liste des fournisseurs</h2>
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
          {suppliers.map(supplier => (
            <tr key={supplier.id}>
              <td>{supplier.id}</td>
              <td>{supplier.name}</td>
              <td>{supplier.email}</td>
              <td>{supplier.phone}</td>
              <td>{supplier.address}</td>
              <td>
                <button onClick={() => handleDelete(supplier.id)}>
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

export default SupplierList;
```

### Sélecteur de fournisseur pour les produits

```jsx
import React, { useState, useEffect } from 'react';

const SupplierSelector = ({ onSupplierSelect }) => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/suppliers');
      
      if (response.ok) {
        const data = await response.json();
        setSuppliers(data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des fournisseurs');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Chargement des fournisseurs...</div>;

  return (
    <div>
      <label>Sélectionner un fournisseur:</label>
      <select onChange={(e) => onSupplierSelect(parseInt(e.target.value))}>
        <option value="">Choisir un fournisseur</option>
        {suppliers.map(supplier => (
          <option key={supplier.id} value={supplier.id}>
            {supplier.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SupplierSelector;
```

## Validation

- `name` : **OBLIGATOIRE** - Nom du fournisseur
- `email` : **OBLIGATOIRE** - Adresse email valide
- `phone` : **OBLIGATOIRE** - Numéro de téléphone
- `address` : **OBLIGATOIRE** - Adresse complète

## Codes d'erreur

- `400 Bad Request` : Données invalides
- `404 Not Found` : Fournisseur introuvable
- `500 Internal Server Error` : Erreur serveur

## Fonctionnalités

- **Gestion complète CRUD** : Création, lecture, mise à jour, suppression
- **Validation des données** : Vérification des champs obligatoires
- **Gestion des erreurs** : Codes d'erreur appropriés
- **Intégration avec les produits** : Association possible avec les produits 
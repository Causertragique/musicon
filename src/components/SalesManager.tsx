import React, { useState, useEffect } from 'react';
import { Plus, Search, Package, DollarSign, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { productService, notificationService } from '../services/firebaseService';
import { Product, ProductCategory } from '../types';

interface SalesManagerProps {
  selectedGroupId?: string;
}

export default function SalesManager({ selectedGroupId }: SalesManagerProps) {
  const { user } = useAuth();
  const { groups, users, getStudentsByGroup, getActiveGroups } = useData();
  
  // États locaux
  const [showSaleForm, setShowSaleForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  // Données Firebase
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [sales, setSales] = useState<any[]>([]);

  // Ajout état pour le popup Fourniture (prix)
  const [showSupplyModal, setShowSupplyModal] = useState(false);
  const [supplyCategory, setSupplyCategory] = useState('');
  const [supplyProduct, setSupplyProduct] = useState('');
  const [supplyQuantity, setSupplyQuantity] = useState('');
  const [supplyPrice, setSupplyPrice] = useState('');

  const teacherGroups = getActiveGroups(user?.id || '');
  const isAdmin = user?.role === 'admin';

  // Charger les données au montage du composant
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsData, categoriesData, salesData] = await Promise.all([
        productService.getProducts(),
        productService.getProductCategories(),
        productService.getSales(isAdmin ? undefined : user?.id)
      ]);
      
      setProducts(productsData);
      setCategories(categoriesData);
      setSales(salesData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les produits selon la recherche
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.instrument?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || product.categoryId === selectedCategory;
    
    return matchesSearch && matchesCategory && product.isActive;
  });

  // Obtenir les élèves du groupe sélectionné ou tous les élèves de l'enseignant
  const availableStudents = selectedGroupId 
    ? getStudentsByGroup(selectedGroupId)
    : teacherGroups.flatMap(group => getStudentsByGroup(group.id));

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedProduct(null);
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setQuantity(1);
  };

  const handleSale = async () => {
    if (!selectedProduct || !selectedStudent) return;

    const student = users.find(u => u.id === selectedStudent);
    if (!student) return;

    setLoading(true);
    try {
      const success = await productService.recordSale({
        productId: selectedProduct.id,
        studentId: selectedStudent,
        quantity: quantity,
        totalAmount: selectedProduct.currentPrice * quantity,
        status: 'credit' // Par défaut à crédit
      });

      if (success) {
        // Créer une notification pour l'enseignant concernant la dette
        await notificationService.createNotification({
          recipientId: user!.id,
          type: 'debt_reminder',
          title: 'Nouvelle dette - Élève',
          message: `${student.firstName} ${student.lastName} a une nouvelle dette de ${(selectedProduct.currentPrice * quantity).toFixed(2)} $ pour ${selectedProduct.name}`,
          recipientRole: 'teacher',
          relatedId: selectedStudent,
          priority: 'medium'
        });

        // Vérifier si le stock est faible après la vente
        const newStockQuantity = selectedProduct.stockQuantity - quantity;
        if (newStockQuantity <= selectedProduct.minStockLevel) {
          // Créer une notification pour l'admin concernant le stock faible
          if (isAdmin) {
            await notificationService.createNotification({
              recipientId: user!.id,
              type: newStockQuantity === 0 ? 'out_of_stock' : 'low_stock',
              title: newStockQuantity === 0 ? 'Rupture de stock' : 'Stock faible',
              message: `${selectedProduct.name} : ${newStockQuantity} en stock (seuil: ${selectedProduct.minStockLevel})`,
              recipientRole: 'admin',
              relatedId: selectedProduct.id,
              priority: newStockQuantity === 0 ? 'high' : 'medium'
            });
          }
        }

        // Recharger les données
        await loadData();
        
        // Reset form
        setShowSaleForm(false);
        setSelectedProduct(null);
        setSelectedStudent('');
        setQuantity(1);
        
        alert('Vente enregistrée avec succès !');
      } else {
        alert('Erreur lors de l\'enregistrement de la vente');
      }
    } catch (error) {
      console.error('Erreur lors de la vente:', error);
      alert('Erreur lors de l\'enregistrement de la vente');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)?.name || 'Inconnu';
  };

  const getStockStatus = (product: Product) => {
    if (product.stockQuantity === 0) return 'out';
    if (product.stockQuantity <= product.minStockLevel) return 'low';
    return 'ok';
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {selectedGroupId ? `Ventes - Groupe ${groups.find(g => g.id === selectedGroupId)?.name}` : 'Gestion des Ventes'}
          </h2>
          <p className="text-gray-600">
            {isAdmin ? 'Administration des ventes et inventaire' : 'Ventes de fournitures musicales'}
          </p>
        </div>
        <div className="flex gap-3">
          {isAdmin && (
            <button
              onClick={() => setShowSupplyModal(true)}
              className="btn-outline"
              disabled={loading}
            >
              Fourniture (prix)
            </button>
          )}
          <button
            onClick={() => setShowSaleForm(true)}
            className="btn-primary flex items-center gap-2"
            disabled={loading}
          >
            <Plus className="w-4 h-4" />
            Nouvelle Vente
          </button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Produits en stock</p>
              <p className="text-2xl font-semibold text-gray-900">{products.filter(p => p.stockQuantity > 0).length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <Package className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Stock faible</p>
              <p className="text-2xl font-semibold text-gray-900">
                {products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= p.minStockLevel).length}
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-full">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rupture de stock</p>
              <p className="text-2xl font-semibold text-gray-900">
                {products.filter(p => p.stockQuantity === 0).length}
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded-full">
              <X className="w-6 h-6 text-red-500" />
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valeur du stock</p>
              <p className="text-2xl font-semibold text-gray-900">
                {products.reduce((total, p) => total + (p.currentPrice * p.stockQuantity), 0).toFixed(0)} $
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Formulaire de vente */}
      {showSaleForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Nouvelle Vente</h3>
            <button
              onClick={() => setShowSaleForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sélection du produit */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Sélection du Produit</h4>
              
              {/* Catégories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Toutes les catégories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Recherche */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rechercher un produit
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Nom, instrument, marque..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Liste des produits */}
              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                {filteredProducts.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    Aucun produit trouvé
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredProducts.map(product => {
                      const stockStatus = getStockStatus(product);
                      return (
                        <button
                          key={product.id}
                          onClick={() => handleProductSelect(product)}
                          className={`w-full p-3 text-left hover:bg-gray-50 transition-colors ${
                            selectedProduct?.id === product.id ? 'bg-primary-50 border-l-4 border-primary-500' : ''
                          }`}
                          disabled={stockStatus === 'out'}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{product.name}</p>
                              <p className="text-sm text-gray-600">
                                {product.instrument && `${product.instrument} • `}
                                {product.strength && `Force ${product.strength} • `}
                                {product.brand && `${product.brand} • `}
                                {getCategoryName(product.categoryId)}
                              </p>
                            </div>
                            <div className="text-right ml-4">
                              <p className="font-semibold text-gray-900">{product.currentPrice.toFixed(2)} $</p>
                              <div className="flex items-center gap-1 mt-1">
                                {stockStatus === 'ok' && <CheckCircle className="w-3 h-3 text-green-500" />}
                                {stockStatus === 'low' && <AlertTriangle className="w-3 h-3 text-yellow-500" />}
                                {stockStatus === 'out' && <X className="w-3 h-3 text-red-500" />}
                                <span className={`text-xs ${
                                  stockStatus === 'ok' ? 'text-green-600' :
                                  stockStatus === 'low' ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                  {product.stockQuantity} en stock
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Détails de la vente */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Détails de la Vente</h4>
              
              {selectedProduct && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-2">{selectedProduct.name}</h5>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>Prix unitaire : <span className="font-medium">{selectedProduct.currentPrice.toFixed(2)} $</span></p>
                    <p>Stock disponible : <span className="font-medium">{selectedProduct.stockQuantity}</span></p>
                    {selectedProduct.instrument && <p>Instrument : {selectedProduct.instrument}</p>}
                    {selectedProduct.strength && <p>Force : {selectedProduct.strength}</p>}
                    {selectedProduct.brand && <p>Marque : {selectedProduct.brand}</p>}
                  </div>
                </div>
              )}

              {/* Quantité */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantité
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedProduct?.stockQuantity || 1}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Élève */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Élève
                </label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Sélectionner un élève</option>
                  {availableStudents.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.firstName} {student.lastName} ({student.instrument})
                    </option>
                  ))}
                </select>
              </div>

              {/* Total */}
              {selectedProduct && (
                <div className="bg-primary-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">Total :</span>
                    <span className="text-2xl font-bold text-primary-600">
                      {(selectedProduct.currentPrice * quantity).toFixed(2)} $
                    </span>
                  </div>
                </div>
              )}

              {/* Boutons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSale}
                  disabled={!selectedProduct || !selectedStudent || quantity > (selectedProduct?.stockQuantity || 0) || loading}
                  className="flex-1 btn-primary"
                >
                  {loading ? 'Enregistrement...' : 'Confirmer la Vente'}
                </button>
                <button
                  onClick={() => setShowSaleForm(false)}
                  className="btn-outline"
                  disabled={loading}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Popup Fourniture (prix) */}
      {showSupplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Ajouter une Fourniture</h3>
              <button onClick={() => setShowSupplyModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={e => { e.preventDefault(); console.log({ supplyCategory, supplyProduct, supplyQuantity, supplyPrice }); setShowSupplyModal(false); setSupplyCategory(''); setSupplyProduct(''); setSupplyQuantity(''); setSupplyPrice(''); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                <input type="text" value={supplyCategory} onChange={e => setSupplyCategory(e.target.value)} className="input w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Produit</label>
                <input type="text" value={supplyProduct} onChange={e => setSupplyProduct(e.target.value)} className="input w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantité</label>
                <input type="number" value={supplyQuantity} onChange={e => setSupplyQuantity(e.target.value)} className="input w-full" min="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prix par unité</label>
                <input type="text" value={supplyPrice} onChange={e => setSupplyPrice(e.target.value)} className="input w-full" />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setShowSupplyModal(false)} className="btn-outline">Annuler</button>
                <button type="submit" className="btn-primary">Ajouter</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Liste des produits en stock faible */}
      {products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= p.minStockLevel).length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            Stock Faible
          </h3>
          <div className="grid gap-3">
            {products
              .filter(p => p.stockQuantity > 0 && p.stockQuantity <= p.minStockLevel)
              .map(product => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-600">
                      {product.instrument && `${product.instrument} • `}
                      {product.strength && `Force ${product.strength} • `}
                      {product.brand && `${product.brand}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-yellow-600">
                      {product.stockQuantity} en stock
                    </p>
                    <p className="text-sm text-yellow-600">
                      Seuil : {product.minStockLevel}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Historique des ventes récentes */}
      {sales.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ventes Récentes</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Produit</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Élève</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Quantité</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Total</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Statut</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                </tr>
              </thead>
              <tbody>
                {sales.slice(0, 10).map((sale) => (
                  <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{sale.productName}</td>
                    <td className="py-3 px-4 text-gray-600">{sale.studentName}</td>
                    <td className="py-3 px-4 text-gray-600">{sale.quantity}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">{sale.totalAmount.toFixed(2)} $</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full font-medium ${
                        sale.status === 'paid' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {sale.status === 'paid' ? 'Payé' : 'À crédit'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {sale.createdAt?.toDate?.()?.toLocaleDateString('fr-FR') || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 
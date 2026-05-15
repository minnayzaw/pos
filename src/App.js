import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './pos.css';
import logo from './assets/images/innoMon.jpg';

function App() {
  const [products, setProducts] = useState([
    { id: 1, name: 'Coffee', price: 3.50, category: 'Beverages', stock: 100 },
    { id: 2, name: 'Espresso', price: 2.50, category: 'Beverages', stock: 100 },
    { id: 3, name: 'Latte', price: 4.00, category: 'Beverages', stock: 100 },
    { id: 4, name: 'Croissant', price: 2.00, category: 'Pastries', stock: 100 },
    { id: 5, name: 'Muffin', price: 2.50, category: 'Pastries', stock: 100 },
    { id: 6, name: 'Sandwich', price: 5.50, category: 'Food', stock: 100 },
    { id: 7, name: 'Salad', price: 6.00, category: 'Food', stock: 100 },
    { id: 8, name: 'Apple Juice', price: 4.00, category: 'Beverages', stock: 100 },
    { id: 9, name: 'Orange Juice', price: 3.00, category: 'Beverages', stock: 100 },
    { id: 10, name: 'Kiwi Juice', price: 3.00, category: 'Beverages', stock: 100 }
  ]);
  
  const [cart, setCart] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showReceipt, setShowReceipt] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  
  // Get unique categories
  const categories = ['All', ...new Set(products.map(p => p.category))];
  
  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory && product.stock > 0;
  });
  
  // Add to cart
  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCart(cart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      } else {
        alert('Not enough stock!');
      }
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };
  
  // Update cart item quantity
  const updateQuantity = (id, newQuantity) => {
    const product = products.find(p => p.id === id);
    if (newQuantity > product.stock) {
      alert('Not enough stock!');
      return;
    }
    
    if (newQuantity === 0) {
      removeFromCart(id);
    } else {
      setCart(cart.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      ));
    }
  };
  
  // Remove from cart
  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };
  
  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;
  
  // Process payment
  const processPayment = (paymentMethod) => {
    if (cart.length === 0) {
      alert('Cart is empty!');
      return;
    }
    
    // Update stock
    const updatedProducts = products.map(product => {
      const cartItem = cart.find(item => item.id === product.id);
      if (cartItem) {
        return { ...product, stock: product.stock - cartItem.quantity };
      }
      return product;
    });
    setProducts(updatedProducts);
    
    // Create transaction record
    const transaction = {
      id: Date.now(),
      date: new Date().toLocaleString(),
      items: [...cart],
      subtotal: subtotal,
      tax: tax,
      total: total,
      paymentMethod: paymentMethod,
      change: paymentMethod === 'cash' ? 0 : null
    };
    
    setTransactions([transaction, ...transactions]);
    setCurrentTransaction(transaction);
    setShowReceipt(true);
    setCart([]);
  };
  
  // Handle cash payment
  const handleCashPayment = () => {
    const cashAmount = parseFloat(prompt('Enter cash amount:', total.toFixed(2)));
    if (isNaN(cashAmount)) return;
    
    if (cashAmount >= total) {
      const change = cashAmount - total;
      alert(`Payment successful! Change: $${change.toFixed(2)}`);
      processPayment('cash');
    } else {
      alert('Insufficient cash!');
    }
  };
  
  // Close receipt
  const closeReceipt = () => {
    setShowReceipt(false);
    setCurrentTransaction(null);
  };
  
  // Print receipt (simulated)
  const printReceipt = () => {
    window.print();
  };
  
  // Get today's sales
  const todaySales = transactions.filter(t => {
    const today = new Date().toDateString();
    const transactionDate = new Date(t.date).toDateString();
    return today === transactionDate;
  });
  
  const todayTotal = todaySales.reduce((sum, t) => sum + t.total, 0);
  
  return (
    <div className="pos-app">
      {/* Header */}
      <div className="header">
        <h1 className='head-text'><img src={logo} width={100}></img><span>InnoMon Coffee Shop</span></h1>
        <div className="stats">
          <div className="stat-card">
            <span className="stat-label">Today's Sales</span>
            <span className="stat-value">${todayTotal.toFixed(2)}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Transactions</span>
            <span className="stat-value">{todaySales.length}</span>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="main-content">
        {/* Products Section */}
        <div className="products-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          <div className="products-grid">
            {filteredProducts.map(product => (
              <div key={product.id} className="product-card" onClick={() => addToCart(product)}>
                <h3>{product.name}</h3>
                <p className="price">${product.price.toFixed(2)}</p>
                <p className="stock">Stock: {product.stock}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Cart Section */}
        <div className="cart-section">
          <h2>Current Order</h2>
          {cart.length === 0 ? (
            <p className="empty-cart">No items in cart</p>
          ) : (
            <>
              <div className="cart-items">
                {cart.map(item => (
                  <div key={item.id} className="cart-item">
                    <div className="item-info">
                      <h4>{item.name}</h4>
                      <p>${item.price.toFixed(2)} each</p>
                    </div>
                    <div className="item-controls">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                      <button className="remove-btn" onClick={() => removeFromCart(item.id)}>×</button>
                    </div>
                    <div className="item-total">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="cart-totals">
                <div className="total-row">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="total-row">
                  <span>Tax (10%):</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="total-row grand-total">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="payment-buttons">
                <button className="cash-btn" onClick={handleCashPayment}>
                  Pay
                </button>
                {/* <button className="card-btn" onClick={() => processPayment('card')}>
                  Card
                </button> */}
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Receipt Modal */}
      {showReceipt && currentTransaction && (
        <div className="modal">
          <div className="modal-content receipt">
            <div className="receipt-header">
              <h2>POS System</h2>
              <p>123 Main Street, City, State</p>
              <p>Tel: (555) 123-4567</p>
              <p>------------------------</p>
              <p>Date: {currentTransaction.date}</p>
              <p>Receipt #: {currentTransaction.id}</p>
              <p>------------------------</p>
            </div>
            
            <div className="receipt-items">
              {currentTransaction.items.map((item, index) => (
                <div key={index} className="receipt-item">
                  <span>{item.name} x {item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <div className="receipt-totals">
              <p>------------------------</p>
              <p>Subtotal: ${currentTransaction.subtotal.toFixed(2)}</p>
              <p>Tax: ${currentTransaction.tax.toFixed(2)}</p>
              <p><strong>Total: ${currentTransaction.total.toFixed(2)}</strong></p>
              <p>Payment: {currentTransaction.paymentMethod.toUpperCase()}</p>
              <p>------------------------</p>
              <p>Thank you for your business!</p>
            </div>
            
            <div className="receipt-buttons">
              <button onClick={printReceipt}>Print Receipt</button>
              <button onClick={closeReceipt}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

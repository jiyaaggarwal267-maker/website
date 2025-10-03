import React, { useState, useEffect, useMemo, useCallback } from 'react';

// --- Utility: Simulated JWT Authentication and Storage ---

const SECRET_KEY = "mock-secret-key-123";
const EXPIRATION_TIME_MS = 3600000; // 1 hour

/**
 * Simulates a JWT generation (Base64 encoding a payload).
 */
const generateToken = (userData) => {
    const payload = {
        userId: userData.userId,
        email: userData.email,
        exp: Date.now() + EXPIRATION_TIME_MS,
    };
    return btoa(JSON.stringify(payload));
};

/**
 * Decodes and validates the simulated JWT.
 */
const validateToken = (token) => {
    if (!token) return null;
    try {
        const payloadJson = atob(token);
        const payload = JSON.parse(payloadJson);
        
        if (payload.exp > Date.now()) {
            return {
                userId: payload.userId,
                email: payload.email,
            };
        } else {
            console.error("Token expired");
            return null;
        }
    } catch (e) {
        console.error("Invalid token format", e);
        return null;
    }
};

// --- Mock Database (localStorage) ---

const MOCK_USERS_KEY = 'mock_users';
const saveUser = (email, password) => {
    const users = JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]');
    if (users.some(u => u.email === email)) {
        return { error: 'User already exists' };
    }
    const newUser = {
        userId: crypto.randomUUID(),
        email,
        password, // In a real app, this would be hashed
    };
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify([...users, newUser]));
    return newUser;
};

const findUser = (email, password) => {
    const users = JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]');
    return users.find(u => u.email === email && u.password === password);
};


// --- Icon Components (Simple SVG) ---
const ShoppingCart = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.72a2 2 0 0 0 2-1.58L23 6H6"/></svg>);
const Package = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="m7.5 19.73 9-5.15"/><path d="M3.3 8.7L12 3l8.7 5.7"/><path d="M12 21l8.7-5.7"/><path d="M3.3 15.3 12 21"/><path d="M3.3 8.7v6.6"/><path d="M20.7 8.7v6.6"/></svg>);
const X = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>);
const Plus = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>);
const Minus = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/></svg>);
const UserIcon = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>);
const LogOut = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>);
const Lock = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>);
const Search = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>);

// --- Product Data ---
const initialProducts = [
    { id: 1, name: 'Mechanical Keyboard (Red Switches)', price: 99.99, category: 'Peripherals', image: "https://m.media-amazon.com/images/I/710B-MnAc9L.jpg", description: 'Clicky, tactile, and completely wireless for the ultimate desk setup. Great for gaming.' },
    { id: 2, name: '4K OLED Display Monitor', price: 349.00, category: 'Displays', image: "https://i.ytimg.com/vi/FqTGbb3k-wI/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLBDfBFDy5-h0eFBAmWMoAgonebPyw", description: 'Stunning clarity, vibrant colors, perfect for professional work and high-refresh-rate gaming.' },
    { id: 3, name: 'Noise-Cancelling Headphones Pro', price: 199.50, category: 'Audio', image: 
"https://kreo-tech.com/cdn/shop/files/Artboard_1_9.png?v=1753673089", description: 'Immersive sound with total silence, powered by spatial audio technology. All-day comfort.' },
    { id: 4, name: 'Portable SSD 2TB, USB-C Gen 2', price: 189.00, category: 'Storage', image: "https://m.media-amazon.com/images/I/71bBCTIvIIL._UF1000,1000_QL80_.jpg", description: 'Blazing fast external storage for professionals on the go. Read speeds up to 1000MB/s.' },
    { id: 5, name: 'Ergonomic Desk Chair', price: 499.99, category: 'Furniture', image: "https://images-cdn.ubuy.co.in/6453d48995032476b641c4d4-qulomvs-mesh-ergonomic-office-chair-with.jpg", description: 'Ultimate comfort and lumbar support for long working hours. Fully adjustable.' },
    { id: 6, name: 'Premium Leather Phone Case (Black)', price: 45.00, category: 'Accessories', image: "https://elefcases.com/cdn/shop/files/61EWirYW5XL._SL1500_0a103842-fee5-4731-8d2f-eb9d1b93805b.jpg?v=1699513938", description: 'Genuine leather, slim profile, and full protection for your device. Compatible with wireless charging.' },
    { id: 7, name: 'Titanium Smartwatch X Pro', price: 299.99, category: 'Wearables', image: "https://m.media-amazon.com/images/I/51EqcQnv7BL._UF1000,1000_QL80_.jpg", description: 'Health tracking, GPS, and a week-long battery life in a rugged titanium body.' },
    { id: 8, name: 'Gaming Mouse (Wireless, Lightweight)', price: 75.00, category: 'Peripherals', image: 
"https://image.made-in-china.com/202f0j00kOdVmFCIpcqa/HP-Wireless-Mouse-Gaming-Mouse-Computer-Parts-Wholesale-Wireless-Mouse-PC-Mouse-USB-Mouse-Mouse.webp", description: 'Ultra-lightweight design with adjustable DPI up to 26,000. Perfect for competitive gaming.' },
    { id: 9, name: '100W GaN Fast Charger (4 Ports)', price: 59.00, category: 'Accessories', image: "https://www.ugreenindia.com/cdn/shop/files/61ynAzFcI1L._SL1500.jpg?v=1758524975&width=1214", description: 'Simultaneously charge your laptop, phone, and tablet at maximum speed using gallium nitride technology.' },
    { id: 10, name: 'Classic Chronograph Watch', price: 149.00, category: 'Wearables', image: 
"https://m.media-amazon.com/images/S/aplus-media-library-service-media/27b635a4-112a-47a5-bb41-500ab1bc5fa9.__CR367,834,2667,1649_PT0_SX970_V1___.jpeg", description: 'Timeless design with a stainless steel case and genuine leather strap. Water resistant to 50m.' },
    { id: 11, name: 'High-Fidelity Bluetooth Speaker', price: 129.00, category: 'Audio', image: "https://rukminim2.flixcart.com/image/480/640/xif0q/speaker/mobile-tablet-speaker/s/j/d/apollo-one-20w-bluetooth-portable-speaker-with-wireless-karaoke-original-imah8kmemmtgegqh.jpeg?q=90", description: 'Deep bass and clear highs from a compact, waterproof speaker. 24-hour playtime.' },
    { id: 12, name: 'Desktop Streaming Webcam 4K', price: 119.00, category: 'Peripherals', image: "https://m.media-amazon.com/images/I/61dMu1TXR2L.jpg", description: 'Professional 4K resolution with auto-focus and built-in privacy shutter for video calls and streaming.' },
];
// Get all unique categories for filtering, plus an 'All' option
const allCategories = ['All', ...new Set(initialProducts.map(p => p.category))];

// --- Sub-Components ---

// 1. Header Component
const Header = ({ auth, cartCount, setView, logout }) => {
    return (
        <header className="header">
            <div className="header-content container">
                <h1 className="logo">
                    <button onClick={() => setView('home')} className="logo-btn">
                        <Package className="icon" />E-Shop Pro
                    </button>
                </h1>
                <nav className="nav-menu">
                    {auth.isAuthenticated ? (
                        <>
                            <span className="user-email-display">{auth.email.split('@')[0]}</span>
                            <button onClick={logout} className="auth-btn logout-btn" aria-label="Logout">
                                <LogOut className="icon" /> Logout
                            </button>
                        </>
                    ) : (
                        // LOGIN/SIGNUP button is now always visible
                        <button onClick={() => setView('login')} className="auth-btn login-btn">
                            <UserIcon className="icon" /> Login / Signup
                        </button>
                    )}
                    <button onClick={() => setView('cart')} className="cart-btn" aria-label="View shopping cart">
                        <ShoppingCart className="icon" />
                        {cartCount > 0 && (<span className="cart-badge">{cartCount}</span>)}
                    </button>
                </nav>
            </div>
        </header>
    );
};

// 2. Product Card Component
const ProductCard = ({ product, addToCart, isAuthenticated, openModal }) => (
    <div className="product-card" onClick={() => openModal(product)}>
        <img src={product.image} alt={product.name} className="product-image" />
        <div className="product-info">
            <div className="product-category-tag">{product.category}</div>
            <h3 className="product-title">{product.name}</h3>
            <p className="product-description">{product.description}</p>
            <div className="product-actions">
                <span className="product-price">${product.price.toFixed(2)}</span>
                <button
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent modal from opening when button is clicked
                        addToCart(product);
                    }}
                    className={`add-to-cart-btn ${!isAuthenticated ? 'disabled-btn' : ''}`}
                    disabled={!isAuthenticated}
                >
                    {isAuthenticated ? 'Add to Cart' : 'Log in to buy'}
                </button>
            </div>
        </div>
    </div>
);

// 3. Category Filter Component
const CategoryFilter = ({ categories, currentCategory, setCategory, searchTerm, setSearchTerm }) => (
    <div className="filter-bar">
        {/* Search Input */}
        <div className="search-input-group">
            <Search className="search-icon" />
            <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
            />
        </div>
        
        {/* Category Buttons */}
        <div className="category-buttons-scroll">
            {categories.map(category => (
                <button
                    key={category}
                    onClick={() => setCategory(category)}
                    className={`category-btn ${currentCategory === category ? 'active-category' : ''}`}
                >
                    {category}
                </button>
            ))}
        </div>
    </div>
);

// 4. Product Modal Component
const ProductModal = ({ product, closeModal, addToCart, isAuthenticated }) => {
    if (!product) return null;

    return (
        <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={closeModal}><X className="icon" /></button>
                <div className="modal-body">
                    <img src={product.image} alt={product.name} className="modal-image" />
                    <div className="modal-details">
                        <span className="product-category-tag">{product.category}</span>
                        <h2 className="modal-title">{product.name}</h2>
                        <p className="modal-description">{product.description}</p>
                        <div className="modal-price">${product.price.toFixed(2)}</div>
                        
                        <button
                            onClick={() => {
                                addToCart(product);
                                closeModal();
                            }}
                            className={`modal-add-to-cart-btn ${!isAuthenticated ? 'disabled-btn' : ''}`}
                            disabled={!isAuthenticated}
                        >
                            {isAuthenticated ? 'Add to Cart' : 'Log in to Add to Cart'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 5. Product List (Home View) Component
const ProductList = ({ products, addToCart, isAuthenticated, openModal }) => {
    const [currentCategory, setCurrentCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredProducts = useMemo(() => {
        let filtered = products;

        // 1. Filter by Category
        if (currentCategory !== 'All') {
            filtered = filtered.filter(p => p.category === currentCategory);
        }

        // 2. Filter by Search Term
        if (searchTerm.trim()) {
            const lowerCaseSearch = searchTerm.toLowerCase();
            filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(lowerCaseSearch) || 
                p.description.toLowerCase().includes(lowerCaseSearch)
            );
        }

        return filtered;
    }, [products, currentCategory, searchTerm]);

    return (
        <div className="view-container">
            <h2 className="section-title">Product Catalog</h2>

            <CategoryFilter
                categories={allCategories}
                currentCategory={currentCategory}
                setCategory={setCurrentCategory}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
            />

            <div className="product-grid">
                {filteredProducts.length > 0 ? (
                    filteredProducts.map(product => (
                        <ProductCard 
                            key={product.id} 
                            product={product} 
                            addToCart={addToCart} 
                            isAuthenticated={isAuthenticated}
                            openModal={openModal}
                        />
                    ))
                ) : (
                    <div className="no-results-message">
                        <p>No products match your search or filter criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// 6. Cart View Component
const CartView = ({ cart, updateQuantity, removeFromCart, total, setView }) => {
    if (cart.length === 0) {
        return (
            <div className="view-container">
                <h2 className="section-title">Your Cart</h2>
                <div className="cart-empty-message">
                    <ShoppingCart className="empty-cart-icon" />
                    <p className="empty-cart-text-main">Your cart is empty.</p>
                    <button className="back-to-shop-btn" onClick={() => setView('home')}>
                        Continue Shopping
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="view-container">
            <h2 className="section-title">Your Shopping Cart</h2>
            <div className="cart-layout">
                {/* Cart Items List */}
                <div className="cart-items-list">
                    {cart.map(item => (
                        <div key={item.id} className="cart-item">
                            <img src={item.image} alt={item.name} className="cart-item-image" />
                            <div className="cart-item-details">
                                <h3 className="cart-item-title">{item.name}</h3>
                                <p className="cart-item-price">${item.price.toFixed(2)}</p>
                            </div>

                            <div className="cart-item-quantity-controls">
                                <button
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    disabled={item.quantity <= 1}
                                    className="quantity-btn"
                                ><Minus className="icon-sm" /></button>
                                <span className="quantity-display">{item.quantity}</span>
                                <button
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    className="quantity-btn"
                                ><Plus className="icon-sm" /></button>
                            </div>
                            
                            <span className="cart-item-subtotal">${(item.price * item.quantity).toFixed(2)}</span>
                            <button
                                onClick={() => removeFromCart(item.id)}
                                className="cart-item-remove-btn"
                            ><X className="icon-sm" /></button>
                        </div>
                    ))}
                </div>

                {/* Cart Summary */}
                <div className="cart-summary-wrapper">
                    <div className="cart-summary">
                        <h3 className="summary-title">Order Summary</h3>
                        <div className="summary-row">
                            <span className="summary-label">Subtotal</span>
                            <span className="summary-value">${total.toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                            <span className="summary-label">Shipping</span>
                            <span className="summary-value free-shipping">FREE</span>
                        </div>
                        <div className="summary-total-row">
                            <span>Order Total</span>
                            <span className="summary-total-value">${total.toFixed(2)}</span>
                        </div>
                        
                        <button className="checkout-btn" onClick={() => setView('checkout')}>
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 7. Checkout View
const CheckoutView = ({ total, setView, setCart }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);

    const handlePayment = () => {
        setIsProcessing(true);
        // Simulate an asynchronous payment API call
        setTimeout(() => {
            setIsProcessing(false);
            setOrderSuccess(true);
            setCart([]); // Clear the cart upon successful "payment"
        }, 2000);
    };

    return (
        <div className="view-container">
            <h2 className="section-title">Checkout</h2>

            <div className="checkout-card">
                {orderSuccess ? (
                    <div className="success-message">
                        <h3 className="success-title">🎉 Order Placed Successfully!</h3>
                        <p className="success-text">Your simulated order for **${total.toFixed(2)}** has been processed.</p>
                        <p className="success-text">Thank you for shopping with E-Shop Pro!</p>
                        <button className="back-to-shop-btn" onClick={() => setView('home')}>
                            Back to Home
                        </button>
                    </div>
                ) : (
                    <>
                        <h3 className="card-title">Payment Details (Simulated)</h3>
                        <div className="summary-total-row" style={{marginBottom: '1.5rem'}}>
                            <span>Total Due</span>
                            <span className="summary-total-value">${total.toFixed(2)}</span>
                        </div>
                        
                        <form className="payment-form">
                            <label className="input-label">Card Number</label>
                            <input type="text" placeholder="XXXX XXXX XXXX XXXX" className="text-input" disabled={isProcessing} />
                            
                            <div className="form-row">
                                <div>
                                    <label className="input-label">Expiry</label>
                                    <input type="text" placeholder="MM/YY" className="text-input" disabled={isProcessing} />
                                </div>
                                <div>
                                    <label className="input-label">CVV</label>
                                    <input type="text" placeholder="123" className="text-input" disabled={isProcessing} />
                                </div>
                            </div>
                        </form>

                        <button 
                            onClick={handlePayment} 
                            className="pay-btn" 
                            disabled={isProcessing}
                        >
                            {isProcessing ? 'Processing...' : `Pay $${total.toFixed(2)}`}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

// 8. Auth View (Login/Signup)
const AuthView = ({ setAuth, setView }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (isLogin) {
            const user = findUser(email, password);
            if (user) {
                const token = generateToken(user);
                localStorage.setItem('jwtToken', token);
                setAuth({ isAuthenticated: true, email: user.email });
                setView('home');
            } else {
                setError('Invalid email or password.');
            }
        } else {
            const result = saveUser(email, password);
            if (result.error) {
                setError(result.error);
            } else {
                const token = generateToken(result);
                localStorage.setItem('jwtToken', token);
                setAuth({ isAuthenticated: true, email: result.email });
                setView('home');
            }
        }
    };

    return (
        <div className="view-container auth-view">
            <div className="auth-card">
                <h2 className="section-title">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                <p className="auth-subtitle">
                    {isLogin ? 'Sign in to access your cart and checkout.' : 'Sign up to start shopping.'}
                </p>

                <form onSubmit={handleSubmit} className="auth-form">
                    <Lock className="auth-icon" />
                    
                    <label className="input-label">Email Address</label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        placeholder="user@example.com" 
                        required 
                        className="text-input"
                    />

                    <label className="input-label">Password</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        placeholder="Strong Password" 
                        required 
                        className="text-input"
                    />
                    
                    {error && <p className="error-message">{error}</p>}
                    
                    <button type="submit" className="submit-btn">
                        {isLogin ? 'Log In' : 'Sign Up'}
                    </button>
                </form>

                <p className="toggle-auth-text">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="toggle-auth-btn">
                        {isLogin ? 'Sign Up' : 'Log In'}
                    </button>
                </p>
            </div>
        </div>
    );
};


// --- Main App Component ---
const App = () => {
    // Authentication State: { isAuthenticated: boolean, email: string | null }
    const [auth, setAuth] = useState({ isAuthenticated: false, email: null });
    // Cart State: [{ id, name, price, quantity, image }]
    const [cart, setCart] = useState([]);
    // Simple Router State: 'home', 'cart', 'checkout', 'login'
    const [currentView, setCurrentView] = useState('home');
    // Product Detail State: Stores the product object for the modal
    const [selectedProduct, setSelectedProduct] = useState(null);

    // 1. Initial Load: Check for stored JWT token
    useEffect(() => {
        const token = localStorage.getItem('jwtToken');
        const userData = validateToken(token);
        if (userData) {
            setAuth({ isAuthenticated: true, email: userData.email });
        } else {
            setAuth({ isAuthenticated: false, email: null });
        }
        // Initialize mock users if none exist (for fresh setup)
        if (!localStorage.getItem(MOCK_USERS_KEY)) {
             localStorage.setItem(MOCK_USERS_KEY, '[]');
        }
    }, []);

    // 2. Auth Actions
    const handleLogout = useCallback(() => {
        localStorage.removeItem('jwtToken');
        setAuth({ isAuthenticated: false, email: null });
        setCart([]); // Clear cart on logout
        setCurrentView('home');
    }, []);
    
    // 3. Cart Calculations
    const { total, itemCount } = useMemo(() => {
        const calculatedTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const calculatedCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        return { total: calculatedTotal, itemCount: calculatedCount };
    }, [cart]);

    // 4. Cart Manipulation Functions
    const addToCart = useCallback((product) => {
        if (!auth.isAuthenticated) {
            setCurrentView('login');
            return;
        }
        setCart(prevCart => {
            const existingItemIndex = prevCart.findIndex(item => item.id === product.id);

            if (existingItemIndex > -1) {
                const newCart = [...prevCart];
                newCart[existingItemIndex].quantity += 1;
                return newCart;
            } else {
                return [...prevCart, { ...product, quantity: 1, image: product.image }];
            }
        });
    }, [auth.isAuthenticated]);

    const updateQuantity = useCallback((id, newQuantity) => {
        setCart(prevCart => {
            if (newQuantity <= 0) {
                return prevCart.filter(item => item.id !== id);
            }
            return prevCart.map(item =>
                item.id === id ? { ...item, quantity: newQuantity } : item
            );
        });
    }, []);

    const removeFromCart = useCallback((id) => {
        setCart(prevCart => prevCart.filter(item => item.id !== id));
    }, []);

    // 5. Product Modal Functions
    const openProductModal = useCallback((product) => {
        setSelectedProduct(product);
    }, []);

    const closeProductModal = useCallback(() => {
        setSelectedProduct(null);
    }, []);

    // 6. Protected Routing
    const navigate = useCallback((view) => {
        if (view === 'cart' || view === 'checkout') {
            if (!auth.isAuthenticated) {
                setCurrentView('login');
                console.warn(`Attempted access to ${view}, redirected to login.`);
                return;
            }
            if (view === 'checkout' && cart.length === 0) {
                 setCurrentView('cart');
                 return;
            }
        }
        setCurrentView(view);
    }, [auth.isAuthenticated, cart.length]);

    // 7. View Renderer
    const renderView = () => {
        switch (currentView) {
            case 'login':
            case 'signup':
                return <AuthView setAuth={setAuth} setView={setCurrentView} />;
            case 'cart':
                return <CartView 
                    cart={cart} 
                    updateQuantity={updateQuantity} 
                    removeFromCart={removeFromCart} 
                    total={total}
                    setView={navigate}
                />;
            case 'checkout':
                return <CheckoutView 
                    total={total} 
                    setView={navigate} 
                    setCart={setCart}
                />;
            case 'home':
            default:
                return <ProductList 
                    products={initialProducts} 
                    addToCart={addToCart} 
                    isAuthenticated={auth.isAuthenticated}
                    openModal={openProductModal}
                />;
        }
    };

    return (
        <div className="app-container">
            <style>
                {`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
                /* Global Reset & Base Styles */
                * { box-sizing: border-box; margin: 0; padding: 0; }
                html { font-family: 'Inter', sans-serif; }

                /* Colors */
                :root {
                    --primary: #4f46e5; /* Indigo 600 */
                    --primary-dark: #4338ca; /* Indigo 700 */
                    --accent-login: #f59e0b; /* Amber 500 - New Login Color */
                    --accent-login-dark: #d97706; /* Amber 700 */
                    --text: #1f2937; /* Gray 800 */
                    --text-light: #6b7280; /* Gray 500 */
                    --bg: #f9fafb; /* Gray 50 */
                    --white: #fff;
                    --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.06);
                }

                .app-container {
                    min-height: 100vh;
                    background-color: var(--bg);
                }

                .container {
                    width: 100%;
                    max-width: 1280px;
                    margin: 0 auto;
                    padding: 0 1rem;
                }

                .icon { width: 1.5rem; height: 1.5rem; }
                .icon-sm { width: 1.25rem; height: 1.25rem; }
                .section-title {
                    font-size: 2rem;
                    font-weight: 800;
                    color: var(--text);
                    margin-bottom: 1.5rem;
                    text-align: center;
                }
                .view-container {
                    padding: 2rem 1rem;
                    min-height: calc(100vh - 120px);
                }

                /* Header Styles */
                .header {
                    position: sticky;
                    top: 0;
                    z-index: 50;
                    background-color: var(--white);
                    box-shadow: var(--shadow);
                }
                
                .header-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem 0;
                }

                .logo-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: var(--text);
                    transition: color 0.3s;
                    display: flex;
                    align-items: center;
                    font-size: 1.5rem;
                    font-weight: 700;
                }

                .logo-btn:hover { color: var(--primary); }
                .logo-btn .icon { margin-right: 0.5rem; }

                .nav-menu {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem; /* Reduced gap for mobile */
                }
                @media (min-width: 768px) { .nav-menu { gap: 1rem; } }

                /* Cart Button */
                .cart-btn {
                    position: relative;
                    padding: 0.6rem;
                    border-radius: 0.5rem; /* Changed to rounded rect for better touch target */
                    transition: all 0.3s;
                    border: 1px solid #e5e7eb;
                    cursor: pointer;
                    background-color: #f3f4f6;
                    color: var(--text);
                    display: flex; /* Ensure it's a flex container for alignment */
                    align-items: center;
                    justify-content: center;
                }
                .cart-btn:hover {
                    background-color: #e0e7ff;
                    color: var(--primary);
                }

                .cart-badge {
                    position: absolute;
                    top: 0;
                    right: 0;
                    padding: 0.25rem 0.5rem;
                    font-size: 0.75rem;
                    font-weight: 700;
                    line-height: 1;
                    color: var(--white);
                    transform: translate(50%, -50%);
                    background-color: #ef4444; /* Red 500 */
                    border-radius: 9999px;
                }

                /* Auth Button FIX: Always visible */
                .auth-btn {
                    display: flex; /* <-- FIX: Always display the button */
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 0.75rem; /* Adjusted padding for mobile */
                    font-weight: 600;
                    font-size: 0.875rem; /* Slightly smaller text for mobile */
                    border-radius: 0.5rem;
                    cursor: pointer;
                    transition: all 0.3s;
                    border: 1px solid transparent;
                }
                @media (min-width: 768px) {
                    .auth-btn {
                        padding: 0.5rem 1rem;
                        font-size: 1rem;
                    }
                }

                /* LOGGED OUT: Bright Amber button */
                .login-btn {
                    background-color: var(--accent-login);
                    color: var(--text);
                }
                .login-btn:hover { background-color: var(--accent-login-dark); }
                
                /* LOGGED IN: Red text, subtle background button */
                .logout-btn {
                    background: none;
                    color: #ef4444; /* Red 500 */
                    border: 1px solid #ef4444;
                }
                .logout-btn:hover {
                    background-color: #fee2e2;
                }
                
                .user-email-display {
                    font-size: 0.875rem;
                    color: var(--primary);
                    font-weight: 600;
                }
                @media (max-width: 767px) { .user-email-display { display: none; } }

                /* Filter and Search Bar */
                .filter-bar {
                    margin-bottom: 2rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    align-items: stretch;
                }
                @media (min-width: 768px) {
                    .filter-bar {
                        flex-direction: row;
                        justify-content: space-between;
                        align-items: center;
                    }
                }
                
                /* Search Input Group */
                .search-input-group {
                    position: relative;
                    flex: 1;
                    max-width: 400px;
                    order: 2; /* Move to the right on desktop */
                }
                @media (min-width: 768px) { .search-input-group { order: 1; } }

                .search-input {
                    width: 100%;
                    padding: 0.6rem 0.6rem 0.6rem 2.5rem;
                    border: 1px solid #d1d5db;
                    border-radius: 0.5rem;
                    font-size: 1rem;
                }

                .search-icon {
                    position: absolute;
                    left: 0.75rem;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 1.25rem;
                    height: 1.25rem;
                    color: var(--text-light);
                }

                /* Category Buttons */
                .category-buttons-scroll {
                    display: flex;
                    gap: 0.5rem;
                    overflow-x: auto;
                    padding-bottom: 0.5rem;
                    order: 1; /* Move to the left on desktop */
                }
                @media (min-width: 768px) { .category-buttons-scroll { order: 2; } }

                .category-btn {
                    flex-shrink: 0;
                    padding: 0.5rem 1rem;
                    border-radius: 9999px;
                    border: 1px solid #d1d5db;
                    background-color: var(--white);
                    color: var(--text);
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .category-btn:hover {
                    border-color: var(--primary);
                    color: var(--primary);
                }
                .active-category {
                    background-color: var(--primary);
                    color: var(--white);
                    border-color: var(--primary);
                }

                /* Product Grid & Card Styles */
                .product-grid {
                    display: grid;
                    grid-template-columns: repeat(1, 1fr);
                    gap: 2rem;
                }
                @media (min-width: 640px) { .product-grid { grid-template-columns: repeat(2, 1fr); } }
                @media (min-width: 1024px) { .product-grid { grid-template-columns: repeat(3, 1fr); } }
                
                .no-results-message {
                    grid-column: 1 / -1;
                    text-align: center;
                    padding: 3rem;
                    font-size: 1.25rem;
                    color: var(--text-light);
                    background-color: var(--white);
                    border-radius: 0.75rem;
                }


                .product-card {
                    background-color: var(--white);
                    border-radius: 0.75rem;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                    border: 1px solid #e5e7eb;
                    transition: transform 0.3s;
                    cursor: pointer;
                }
                .product-card:hover { 
                    transform: translateY(-5px); 
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); 
                    border-color: var(--primary);
                }

                .product-image {
                    width: 100%;
                    height: 12rem;
                    object-fit: cover;
                }

                .product-info { padding: 1.5rem; }
                .product-category-tag {
                    display: inline-block;
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: var(--primary);
                    background-color: #e0e7ff;
                    padding: 0.25rem 0.5rem;
                    border-radius: 0.375rem;
                    margin-bottom: 0.5rem;
                }
                .product-title { font-size: 1.25rem; font-weight: 700; color: var(--text); margin-bottom: 0.5rem; }
                .product-description { font-size: 0.875rem; color: var(--text-light); height: 2.5rem; overflow: hidden; margin-bottom: 1.5rem; }

                .product-actions { display: flex; justify-content: space-between; align-items: center; }
                .product-price { font-size: 1.5rem; font-weight: 800; color: var(--primary); }

                .add-to-cart-btn {
                    background-color: #34d399; /* Green 500 */
                    color: var(--white);
                    font-weight: 600;
                    padding: 0.6rem 1.2rem;
                    border-radius: 0.5rem;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 5px 10px -2px rgba(52, 211, 153, 0.3);
                }
                .add-to-cart-btn:hover { background-color: #059669; }
                
                .disabled-btn {
                    background-color: #9ca3af; /* Gray 400 */
                    cursor: not-allowed;
                    box-shadow: none;
                }
                .disabled-btn:hover { background-color: #9ca3af; }

                /* MODAL Styles (Product Detail) */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.6);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 100;
                }

                .modal-content {
                    background-color: var(--white);
                    border-radius: 1rem;
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
                    width: 95%;
                    max-width: 800px;
                    max-height: 90vh;
                    overflow-y: auto;
                    position: relative;
                }

                .modal-close-btn {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: var(--text-light);
                    z-index: 10;
                    padding: 0.5rem;
                    border-radius: 50%;
                }
                .modal-close-btn:hover { background-color: #f3f4f6; color: var(--text); }

                .modal-body {
                    display: flex;
                    flex-direction: column;
                    padding: 2rem;
                }
                @media (min-width: 768px) {
                    .modal-body {
                        flex-direction: row;
                        gap: 2rem;
                    }
                }

                .modal-image {
                    width: 100%;
                    height: auto;
                    border-radius: 0.75rem;
                    margin-bottom: 1.5rem;
                }
                @media (min-width: 768px) {
                    .modal-image {
                        width: 50%;
                        margin-bottom: 0;
                        height: 300px;
                        object-fit: cover;
                    }
                }

                .modal-details {
                    width: 100%;
                }
                @media (min-width: 768px) { .modal-details { width: 50%; } }

                .modal-title {
                    font-size: 2rem;
                    font-weight: 800;
                    color: var(--text);
                    margin-bottom: 0.5rem;
                }
                .modal-description {
                    font-size: 1rem;
                    color: var(--text-light);
                    margin-bottom: 1.5rem;
                    line-height: 1.5;
                }
                .modal-price {
                    font-size: 2.25rem;
                    font-weight: 800;
                    color: var(--primary);
                    margin-bottom: 1.5rem;
                }
                .modal-add-to-cart-btn {
                    width: 100%;
                    background-color: var(--primary);
                    color: var(--white);
                    font-weight: 700;
                    padding: 1rem;
                    border-radius: 0.5rem;
                    border: none;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }
                .modal-add-to-cart-btn:hover { background-color: var(--primary-dark); }
                .modal-add-to-cart-btn.disabled-btn { background-color: #9ca3af; }


                /* Cart View Styles (continued) */
                .cart-layout {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                }
                @media (min-width: 1024px) {
                    .cart-layout { flex-direction: row; }
                    .cart-items-list { width: 66.666667%; }
                    .cart-summary-wrapper { width: 33.333333%; }
                }

                .cart-items-list {
                    flex-grow: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .cart-item {
                    display: flex;
                    align-items: center;
                    background-color: var(--white);
                    padding: 1rem;
                    border-radius: 0.75rem;
                    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
                    flex-wrap: wrap;
                }
                
                .cart-item-image {
                    width: 4rem;
                    height: 4rem;
                    object-fit: cover;
                    border-radius: 0.5rem;
                    margin-right: 1rem;
                }

                .cart-item-details { flex-grow: 1; min-width: 100px; }
                .cart-item-title { font-size: 1rem; font-weight: 600; color: var(--text); }
                .cart-item-price { font-size: 0.875rem; color: var(--text-light); }

                .cart-item-quantity-controls {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    margin: 1rem 0;
                    flex-basis: 100%;
                    justify-content: flex-start;
                }
                @media (min-width: 640px) {
                    .cart-item-quantity-controls { 
                        flex-basis: auto; 
                        justify-content: center;
                        margin: 0 1rem;
                    }
                }
                
                .quantity-btn {
                    padding: 0.4rem;
                    background-color: #e5e7eb;
                    border-radius: 0.375rem;
                    border: none;
                    cursor: pointer;
                }
                .quantity-btn:hover:not(:disabled) { background-color: #d1d5db; }
                .quantity-btn:disabled { opacity: 0.5; cursor: not-allowed; }

                .quantity-display { font-weight: 600; width: 1.5rem; text-align: center; }

                .cart-item-subtotal {
                    font-size: 1rem;
                    font-weight: 700;
                    color: var(--primary);
                    width: 5rem;
                    text-align: right;
                    margin-left: auto;
                }

                .cart-item-remove-btn {
                    padding: 0.3rem;
                    color: #ef4444;
                    border-radius: 50%;
                    border: none;
                    background: none;
                    cursor: pointer;
                    margin-left: 0.5rem;
                }
                .cart-item-remove-btn:hover { background-color: #fee2e2; }

                .cart-empty-message {
                    text-align: center;
                    padding: 4rem 1rem;
                    background-color: var(--white);
                    border-radius: 0.75rem;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                }
                .empty-cart-icon { width: 4rem; height: 4rem; color: #9ca3af; margin: 0 auto 1rem; }
                .empty-cart-text-main { font-size: 1.25rem; color: var(--text); font-weight: 600; margin-bottom: 0.5rem; }
                .back-to-shop-btn {
                    margin-top: 1.5rem;
                    background-color: #10b981; /* Green 500 */
                    color: var(--white);
                    font-weight: 600;
                    padding: 0.75rem 1.5rem;
                    border-radius: 0.5rem;
                    border: none;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }
                .back-to-shop-btn:hover { background-color: #059669; }

                /* Cart Summary */
                .cart-summary {
                    background-color: var(--white);
                    padding: 1.5rem;
                    border-radius: 0.75rem;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                    border: 1px solid var(--primary);
                }

                .summary-title {
                    font-size: 1.25rem;
                    font-weight: 700;
                    margin-bottom: 1rem;
                    border-bottom: 1px solid #e5e7eb;
                    padding-bottom: 0.5rem;
                    text-align: left;
                }

                .summary-row {
                    display: flex;
                    justify-content: space-between;
                    font-size: 1rem;
                    margin-bottom: 0.75rem;
                }

                .summary-label { color: var(--text-light); }
                .summary-value { font-weight: 600; }
                .free-shipping { color: #10b981; }

                .summary-total-row {
                    display: flex;
                    justify-content: space-between;
                    font-size: 1.5rem;
                    font-weight: 800;
                    padding-top: 1rem;
                    border-top: 2px dashed #e5e7eb;
                    margin-top: 1rem;
                }
                .summary-total-value { color: var(--primary); }

                .checkout-btn {
                    width: 100%;
                    margin-top: 1.5rem;
                    background-color: #34d399; /* Green 500 */
                    color: var(--white);
                    font-weight: 700;
                    padding: 0.75rem;
                    border-radius: 0.5rem;
                    border: none;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }
                .checkout-btn:hover { background-color: #059669; }

                /* Auth & Checkout Card Styles (continued) */
                .auth-view, .checkout-view {
                    display: flex;
                    justify-content: center;
                    align-items: flex-start;
                    padding-top: 4rem;
                }

                .auth-card, .checkout-card {
                    background-color: var(--white);
                    padding: 2rem;
                    border-radius: 1rem;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    width: 100%;
                    max-width: 400px;
                    border-top: 5px solid var(--primary);
                    text-align: center;
                }
                
                .auth-icon {
                    width: 2.5rem;
                    height: 2.5rem;
                    color: var(--primary);
                    margin: 0 auto 1rem;
                }
                .auth-subtitle {
                    color: var(--text-light);
                    margin-bottom: 1.5rem;
                }

                .auth-form { text-align: left; }
                .input-label {
                    display: block;
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: var(--text);
                    margin-top: 1rem;
                    margin-bottom: 0.25rem;
                }
                .text-input {
                    width: 100%;
                    padding: 0.75rem;
                    border: 1px solid #d1d5db;
                    border-radius: 0.5rem;
                    font-size: 1rem;
                }
                .error-message {
                    color: #ef4444;
                    font-size: 0.875rem;
                    margin-top: 0.5rem;
                    font-weight: 500;
                }

                .submit-btn {
                    width: 100%;
                    margin-top: 1.5rem;
                    background-color: var(--primary);
                    color: var(--white);
                    font-weight: 700;
                    padding: 0.75rem;
                    border-radius: 0.5rem;
                    border: none;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }
                .submit-btn:hover { background-color: var(--primary-dark); }
                
                .toggle-auth-text {
                    margin-top: 1.5rem;
                    font-size: 0.875rem;
                    color: var(--text-light);
                }
                .toggle-auth-btn {
                    color: var(--primary);
                    font-weight: 600;
                    background: none;
                    border: none;
                    cursor: pointer;
                }

                /* Checkout Specific */
                .payment-form { margin-bottom: 2rem; }
                .form-row {
                    display: flex;
                    gap: 1rem;
                }
                .form-row > div { flex: 1; }
                
                .pay-btn {
                    width: 100%;
                    background-color: #10b981; /* Green 500 */
                    color: var(--white);
                    font-weight: 700;
                    padding: 0.75rem;
                    border-radius: 0.5rem;
                    border: none;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }
                .pay-btn:hover:not(:disabled) { background-color: #059669; }
                .pay-btn:disabled { background-color: #9ca3af; cursor: progress; }

                .success-message {
                    text-align: center;
                    padding: 1rem;
                }
                .success-title {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #10b981;
                    margin-bottom: 1rem;
                }
                .success-text {
                    color: var(--text);
                    margin-bottom: 0.5rem;
                }

                /* Footer */
                .footer {
                    background-color: #1f2937;
                    color: var(--white);
                    padding: 1.5rem;
                    text-align: center;
                }
                `}
            </style>
            
            <Header 
                auth={auth} 
                cartCount={itemCount} 
                setView={navigate} 
                logout={handleLogout} 
            />
            
            <main className="main-content">
                <div className="container">
                    {renderView()}
                </div>
            </main>

            <ProductModal
                product={selectedProduct}
                closeModal={closeProductModal}
                addToCart={addToCart}
                isAuthenticated={auth.isAuthenticated}
            />

            <footer className="footer">
                <p>
                    E-Shop Pro | Authentication and Checkout Simulated
                </p>
            </footer>
        </div>
    );
};

export default App;

document.addEventListener('DOMContentLoaded', () => {
    const windows = document.querySelectorAll('.window');
    const taskbarItems = document.getElementById('taskbar-items');
    let activeWindow = null;
    let offsetX, offsetY;
    let isDragging = false;
    let hasSignedUp = false;
    let cart = [];
    let newsletterShown = false;

    // Hide cart window immediately
    const cartWindow = document.getElementById('cart-window');
    if (cartWindow) {
        cartWindow.style.cssText = `
            display: none;
            visibility: hidden;
            z-index: 9999;
            opacity: 0;
        `;
    }

    // Store original positions of windows
    const originalPositions = new Map();
    windows.forEach(window => {
        // Skip cart window when storing original positions
        if (window.id !== 'cart-window') {
            originalPositions.set(window, {
                left: window.style.left,
                top: window.style.top,
                width: window.offsetWidth,
                height: window.offsetHeight
            });
        }
    });

    // Window controls and taskbar functionality
    windows.forEach(window => {
        const windowTitle = window.querySelector('.window-title').textContent;
        
        // Skip cart window, subscription confirmation, and custom alerts
        if (window.id === 'cart-window' || 
            window.id === 'custom-alert' || 
            window.id === 'newsletter-window' ||
            windowTitle === 'Subscription Confirmation' ||
            windowTitle === 'Cart Update') return;

        const minimizeBtn = window.querySelector('.minimize');
        const maximizeBtn = window.querySelector('.maximize');
        const closeBtn = window.querySelector('.close');

        // Create taskbar item
        const taskbarItem = document.createElement('div');
        taskbarItem.classList.add('taskbar-item');
        taskbarItem.textContent = windowTitle;
        taskbarItems.appendChild(taskbarItem);

        // Minimize button
        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', () => {
                window.style.display = 'none';
                taskbarItem.classList.add('active');
            });
        }

        // Maximize button
        if (maximizeBtn) {
            maximizeBtn.addEventListener('click', () => {
                if (window.style.width === '100vw') {
                    window.style.width = '';
                    window.style.height = '';
                    window.style.top = '';
                    window.style.left = '';
                } else {
                    window.style.width = '100vw';
                    window.style.height = '100vh';
                    window.style.top = '0';
                    window.style.left = '0';
                }
            });
        }

        // Close button
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                window.style.display = 'none';
                taskbarItem.classList.add('hidden');
            });
        }

        // Taskbar item click
        taskbarItem.addEventListener('click', () => {
            if (window.style.display === 'none') {
                window.style.display = 'block';
                taskbarItem.classList.remove('active');
                taskbarItem.classList.remove('hidden');
                // Bring window to front
                windows.forEach(w => w.style.zIndex = '1');
                window.style.zIndex = '2';
            } else {
                window.style.display = 'none';
                taskbarItem.classList.add('active');
            }
        });
    });

    // Cart window specific controls
    if (cartWindow) {
        const minimizeBtn = cartWindow.querySelector('.minimize');
        const maximizeBtn = cartWindow.querySelector('.maximize');
        const closeBtn = cartWindow.querySelector('.close');

        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', () => {
                cartWindow.style.cssText = `
                    display: none;
                    visibility: hidden;
                    z-index: 9999;
                    opacity: 0;
                `;
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                cartWindow.style.cssText = `
                    display: none;
                    visibility: hidden;
                    z-index: 9999;
                    opacity: 0;
                `;
            });
        }
    }

    // Newsletter window controls
    const newsletterWindow = document.getElementById('newsletter-window');
    if (newsletterWindow) {
        const newsletterMinBtn = newsletterWindow.querySelector('.minimize');
        const newsletterCloseBtn = newsletterWindow.querySelector('.close');

        if (newsletterMinBtn) {
            newsletterMinBtn.addEventListener('click', () => {
                newsletterWindow.style.display = 'none';
                newsletterShown = false;
            });
        }

        if (newsletterCloseBtn) {
            newsletterCloseBtn.addEventListener('click', () => {
                newsletterWindow.style.display = 'none';
                newsletterShown = false;
                // Prevent newsletter from showing again in this session
                hasSignedUp = true;
            });
        }
    }

    // Newsletter show/hide functions
    function showNewsletter() {
        if (!hasSignedUp && !newsletterShown) {
            const newsletterWindow = document.getElementById('newsletter-window');
            if (newsletterWindow) {
                newsletterWindow.style.display = 'block';
                newsletterShown = true;
            }
        }
    }

    function hideNewsletter() {
        const newsletterWindow = document.getElementById('newsletter-window');
        if (newsletterWindow) {
            newsletterWindow.style.display = 'none';
            newsletterShown = false;
        }
    }

    // Cart icon click handler
    const cartIcon = document.getElementById('cart-icon');
    if (cartIcon) {
        cartIcon.addEventListener('click', (e) => {
            console.log('Cart icon clicked');
            e.preventDefault();
            showCartWindow();
        });
    }

    // Function to show cart window
    function showCartWindow() {
        console.log('Showing cart window');
        if (cartWindow) {
            // Force display
            cartWindow.style.cssText = `
                display: block !important;
                visibility: visible !important;
                z-index: 9999 !important;
                position: fixed !important;
            `;
            
            // Center the window if not already positioned
            if (!cartWindow.style.left) {
                cartWindow.style.left = '50%';
                cartWindow.style.top = '50%';
                cartWindow.style.transform = 'translate(-50%, -50%)';
            }
            
            // Update taskbar
            const cartTaskbarItem = Array.from(taskbarItems.children)
                .find(item => item.textContent === 'Shopping Cart');
            if (cartTaskbarItem) {
                cartTaskbarItem.classList.remove('active');
            }

            console.log('Cart window display:', cartWindow.style.display);
        } else {
            console.log('Cart window not found');
        }
    }

    // Add to Cart button handler
    const addToCartBtn = document.querySelector('.add-to-cart-btn');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', (e) => {
            console.log('Add to cart clicked');
            e.preventDefault();
            const size = document.getElementById('size').value;
            const quantity = parseInt(document.getElementById('quantity').value) || 1;
            const price = 50.00;

            const item = {
                name: 'Limited Edition Tom Riddle T-Shirt',
                price: price,
                size: size,
                quantity: quantity
            };

            // Show cart icon
            if (cartIcon) {
                cartIcon.style.display = 'block';
            }

            // Add item and show cart
            addToCart(item);
            showCartWindow();
        });
    }

    // Handle quantity button clicks
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('quantity-btn')) {
            const index = parseInt(e.target.dataset.index);
            const isIncrease = e.target.classList.contains('increase');
            
            if (!isNaN(index) && index >= 0 && index < cart.length) {
                if (isIncrease && cart[index].quantity < 10) {
                    cart[index].quantity++;
                } else if (!isIncrease && cart[index].quantity > 1) {
                    cart[index].quantity--;
                }
                
                updateCartDisplay();
                saveCart();
                
                // Debug log
                console.log('Quantity updated:', cart[index].quantity);
            }
        }
    });

    function updateCartDisplay() {
        const cartItems = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cart-total');
        
        if (!cartItems || !cartTotal) return;
        
        cartItems.innerHTML = '';
        let total = 0;

        cart.forEach((item, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="cart-cell">${item.name}</td>
                <td class="cart-cell">
                    <select class="size-select" data-index="${index}">
                        <option value="s" ${item.size === 's' ? 'selected' : ''}>Small</option>
                        <option value="m" disabled style="color: gray;">Medium (Sold Out)</option>
                        <option value="l" disabled style="color: gray;">Large (Sold Out)</option>
                        <option value="xl" disabled style="color: gray;">X-Large (Sold Out)</option>
                        <option value="2xl" ${item.size === '2xl' ? 'selected' : ''}>2X-Large</option>
                    </select>
                </td>
                <td class="cart-cell quantity-cell">
                    <button class="quantity-btn decrease" data-index="${index}">-</button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-btn increase" data-index="${index}">+</button>
                </td>
                <td class="cart-cell price-cell">$${(item.price * item.quantity).toFixed(2)}</td>
            `;
            cartItems.appendChild(row);
            total += item.price * item.quantity;
        });

        cartTotal.innerHTML = `
            <div class="cart-total-row">
                <span>Total: $${total.toFixed(2)}</span>
                <button id="checkout-btn" class="checkout-btn" ${cart.length === 0 ? 'disabled' : ''}>
                    Proceed to Checkout
                </button>
            </div>
        `;

        if (cartIcon) {
            cartIcon.textContent = `Cart (${cart.reduce((sum, item) => sum + item.quantity, 0)})`;
        }

        // Add checkout button handler
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', handleCheckout);
        }
    }

    function addToCart(item) {
        const existingItem = cart.find(cartItem => 
            cartItem.name === item.name && cartItem.size === item.size
        );

        if (existingItem) {
            existingItem.quantity += item.quantity;
        } else {
            cart.push(item);
        }

        updateCartDisplay();
        saveCart();
    }

    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    function loadCart() {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
            if (cart.length > 0) {
                if (cartIcon) cartIcon.style.display = 'block';
            }
            updateCartDisplay();
        }
    }

    // Initialize cart
    loadCart();

    // Update cart taskbar functionality
    function updateCartTaskbar() {
        const existingCartTaskbar = Array.from(taskbarItems.children)
            .find(item => item.textContent === 'Shopping Cart');
        
        if (!existingCartTaskbar && cart.length > 0) {
            const cartTaskbarItem = document.createElement('div');
            cartTaskbarItem.classList.add('taskbar-item');
            cartTaskbarItem.textContent = 'Shopping Cart';
            taskbarItems.appendChild(cartTaskbarItem);

            cartTaskbarItem.addEventListener('click', () => {
                if (cartWindow.style.display === 'none') {
                    cartWindow.style.display = 'block';
                    cartWindow.style.zIndex = '9999';
                    bringToFront(cartWindow);
                    cartTaskbarItem.classList.remove('active');
                } else {
                    cartWindow.style.display = 'none';
                    cartTaskbarItem.classList.add('active');
                }
            });
        }
    }

    // Checkout handler
    function handleCheckout() {
        if (cart.length === 0) {
            showCustomAlert('Your cart is empty.');
            return;
        }

        // Create checkout data
        const checkoutData = {
            items: cart,
            total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            currency: 'AUD'
        };

        // Save cart state
        localStorage.setItem('checkoutData', JSON.stringify(checkoutData));

        // Redirect to checkout page
        window.location.href = 'checkout.html';
    }

    // Payment button handlers
    document.querySelectorAll('.payment-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const paymentMethod = this.classList[1]; // gets 'apple-pay', 'google-pay', etc.
            
            // Show processing message
            showCustomAlert('Processing payment with ' + paymentMethod.replace('-', ' '));
            
            // Here you would normally integrate with your payment processor
            // For now, we'll just show a message
            setTimeout(() => {
                showCustomAlert('This payment method is currently in development. Please use PayPal or card payment.');
            }, 1000);
        });
    });

    // Google Pay Implementation
    function initGooglePay() {
        // First check if Google Pay is available
        if (!window.google || !window.google.payments) {
            console.error('Google Pay not available');
            const googlePayButton = document.getElementById('google-pay-btn');
            if (googlePayButton) {
                googlePayButton.style.display = 'none';
            }
            return;
        }

        const googlePayClient = new google.payments.api.PaymentsClient({
            environment: 'TEST'
        });

        const googlePayButton = document.getElementById('google-pay-btn');
        if (!googlePayButton) {
            console.error('Google Pay button not found');
            return;
        }

        const paymentDataRequest = {
            apiVersion: 2,
            apiVersionMinor: 0,
            allowedPaymentMethods: [{
                type: 'CARD',
                parameters: {
                    allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                    allowedCardNetworks: ['MASTERCARD', 'VISA']
                },
                tokenizationSpecification: {
                    type: 'PAYMENT_GATEWAY',
                    parameters: {
                        gateway: 'example',
                        gatewayMerchantId: 'BCR2DN4T27SPXJQ3'
                    }
                }
            }],
            merchantInfo: {
                merchantId: 'BCR2DN4T27SPXJQ3',
                merchantName: 'Tom Riddle'
            },
            transactionInfo: {
                totalPriceStatus: 'FINAL',
                totalPrice: '50.00',
                currencyCode: 'AUD',
                countryCode: 'AU'
            }
        };
        googlePayButton.addEventListener('click', async () => {
            try {
                console.log('Google Pay button clicked');
                const paymentData = await googlePayClient.loadPaymentData(paymentDataRequest);
                console.log('Payment successful', paymentData);
                
                // Handle successful payment
                showCustomAlert('Payment processed successfully!');
                cart = [];
                updateCartDisplay();
                saveCart();
                
                // Close checkout window
                const checkoutWindow = document.getElementById('checkout-window');
                if (checkoutWindow) {
                    checkoutWindow.style.display = 'none';
                }
            } catch (err) {
                console.error('Error processing payment:', err);
                showCustomAlert('Payment failed. Please try again.');
            }
        });

        // Log that initialization is complete
        console.log('Google Pay initialized');
    }

    // Remove any Apple Pay related code
    // Initialize only Google Pay when document is loaded
    document.addEventListener('DOMContentLoaded', () => {
        initGooglePay();
    });

    // Make sure checkout button shows checkout window
    document.getElementById('checkout-button')?.addEventListener('click', () => {
        const checkoutWindow = document.getElementById('checkout-window');
        if (checkoutWindow) {
            checkoutWindow.style.display = 'block';
        }
    });

    // Newsletter form submission handler
    document.getElementById('newsletter-form').addEventListener('submit', async function(e) {
        e.preventDefault(); // Prevent form from submitting normally
        
        const form = this;
        const email = form.querySelector('#email').value;
        
        try {
            // Send to Formspree in the background
            await fetch("https://formspree.io/f/xovqaezq", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email
                })
            });

            // Show the confirmation window
            const newsletterConfirmation = document.getElementById('newsletter-confirmation');
            if (newsletterConfirmation) {
                newsletterConfirmation.style.display = 'block';
                
                // Hide the newsletter signup window
                const newsletterWindow = document.getElementById('newsletter-window');
                if (newsletterWindow) {
                    newsletterWindow.style.display = 'none';
                }
            }

            // Clear the form
            form.reset();
            
            // Set hasSignedUp to true to prevent showing the form again
            hasSignedUp = true;

        } catch (error) {
            console.error('Error:', error);
            showCustomAlert('There was an error submitting the form. Please try again.');
        }
    });

    // T-shirt image animation
    function initTshirtAnimation() {
        const tshirtImage = document.querySelector('.merch-image');
        if (!tshirtImage) {
            console.error('T-shirt image element not found');
            return;
        }
        console.log('Found t-shirt image element:', tshirtImage);

        const images = [
            '/Users/tomriddle/Desktop/tom-riddle.com 2 2 2/tshirt1/tshirt_1.png',
            '/Users/tomriddle/Desktop/tom-riddle.com 2 2 2/tshirt1/tshirt_2.png',
            '/Users/tomriddle/Desktop/tom-riddle.com 2 2 2/tshirt1/tshirt_3.png',
            '/Users/tomriddle/Desktop/tom-riddle.com 2 2 2/tshirt1/tshirt_4.png',
            '/Users/tomriddle/Desktop/tom-riddle.com 2 2 2/tshirt1/tshirt_5.png',
            '/Users/tomriddle/Desktop/tom-riddle.com 2 2 2/tshirt1/tshirt_6.png',
            '/Users/tomriddle/Desktop/tom-riddle.com 2 2 2/tshirt1/tshirt_7.png'
        ];

        let currentIndex = 0;
        const animationDuration = 1000; // 1 second for full cycle
        const frameInterval = animationDuration / images.length;

        // Preload images
        images.forEach(src => {
            const img = new Image();
            img.src = src;
        });

        function updateImage() {
            console.log('Updating image to:', images[currentIndex]);
            tshirtImage.src = images[currentIndex];
            currentIndex = (currentIndex + 1) % images.length;
        }

        // Initial update
        updateImage();

        // Start the animation
        console.log('Starting animation with interval:', frameInterval);
        const intervalId = setInterval(updateImage, frameInterval);

        // Optional: Stop animation when window is not visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                console.log('Page hidden, clearing interval');
                clearInterval(intervalId);
            } else {
                console.log('Page visible, restarting animation');
                const newIntervalId = setInterval(updateImage, frameInterval);
                return () => clearInterval(newIntervalId);
            }
        });
    }

    // Initialize animation when document is loaded
    document.addEventListener('DOMContentLoaded', () => {
        console.log('Document loaded, initializing t-shirt animation');
        initTshirtAnimation();
    });

    function createCheckoutWindow() {
        const checkoutHTML = `
            <div class="window" id="checkout-window">
                <div class="window-header">
                    <span class="window-title">Checkout</span>
                    <div class="window-controls">
                        <button class="minimize">_</button>
                        <button class="maximize">□</button>
                        <button class="close">×</button>
                    </div>
                </div>
                <div class="window-content">
                    <div class="payment-methods">
                        <div class="express-payments">
                            <!-- PayPal Button -->
                            <div id="paypal-btn-container"></div>
                        </div>
                        
                        <div class="traditional-payments">
                            <h3>Or pay with card</h3>
                            <div id="stripe-card-element"></div>
                            <button id="submit-payment">Pay Now</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add the checkout window to the desktop
        document.getElementById('desktop').insertAdjacentHTML('beforeend', checkoutHTML);
        
        // Initialize payment methods
        initGooglePay();
        
        // Add event listeners for window controls
        const checkoutWindow = document.getElementById('checkout-window');
        checkoutWindow.querySelector('.close').addEventListener('click', () => {
            checkoutWindow.remove();
        });
        
        checkoutWindow.querySelector('.minimize').addEventListener('click', () => {
            checkoutWindow.style.display = 'none';
        });
        
        // Make window draggable
        makeWindowDraggable(checkoutWindow);
    }

    // Add event listener to checkout button
    document.getElementById('checkout-button')?.addEventListener('click', () => {
        // Remove existing checkout window if it exists
        const existingCheckout = document.getElementById('checkout-window');
        if (existingCheckout) {
            existingCheckout.remove();
        }
        
        // Create new checkout window
        createCheckoutWindow();
    });

    // Function to update the path display
    function updatePathDisplay() {
        const pathInput = document.getElementById('current-path');
        if (!pathInput) return;

        // Get current page location and filename
        const currentPath = window.location.pathname;
        const currentPage = currentPath.split('/').pop(); // Gets the filename
        let displayPath = 'C:';

        // Determine path based on current page filename
        if (currentPage === 'checkout.html' || currentPage === 'checkout') {
            displayPath += '\\Home\\Checkout';
        } else if (currentPage === 'cart.html' || currentPage === 'cart') {
            displayPath += '\\Home\\Cart';
        } else if (currentPage.includes('product')) {
            displayPath += '\\Home\\Products\\Item';
        } else if (currentPage === '' || currentPage === 'index.html') {
            displayPath += '\\Home';
        }

        // Update the display
        pathInput.value = displayPath;
        console.log('Current page:', currentPage); // Debug log
        console.log('Display path:', displayPath); // Debug log
    }

    // Update path immediately
    updatePathDisplay();

    // Update path when navigation occurs
    window.addEventListener('popstate', updatePathDisplay);
    
    // Also update on load event to ensure it catches all cases
    window.addEventListener('load', updatePathDisplay);

    // Track data with streaming links
    const trackData = {
        '3': {
            image: '3.jpg',
            title: '3',
            spotify: 'https://open.spotify.com/track/...',
            apple: 'https://music.apple.com/...',
            soundcloud: 'https://soundcloud.com/...',
            youtube: 'https://youtube.com/...'
        },
        'Focus': {
            image: 'Focus.jpg',
            title: 'Focus',
            spotify: 'https://open.spotify.com/track/...',
            apple: 'https://music.apple.com/...',
            soundcloud: 'https://soundcloud.com/...',
            youtube: 'https://youtube.com/...'
        },
        'Nibiru': {
            image: 'Nibiru.jpg',
            title: 'Nibiru',
            spotify: 'https://open.spotify.com/track/...',
            apple: 'https://music.apple.com/...',
            soundcloud: 'https://soundcloud.com/...',
            youtube: 'https://youtube.com/...'
        },
        'ETHANOL': {
            image: 'ETHANOL.jpg',
            title: 'ETHANOL',
            spotify: 'https://open.spotify.com/track/...',
            apple: 'https://music.apple.com/...',
            soundcloud: 'https://soundcloud.com/...',
            youtube: 'https://youtube.com/...'
        },
        'ALL GIRLS ARE THE SAME': {
            image: 'ALL GIRLS ARE THE SAME.jpg',
            title: 'ALL GIRLS ARE THE SAME',
            spotify: 'https://open.spotify.com/track/...',
            apple: 'https://music.apple.com/...',
            soundcloud: 'https://soundcloud.com/...',
            youtube: 'https://youtube.com/...'
        },
        'Coming Down': {
            image: 'Coming Down.jpg',
            title: 'Coming Down',
            spotify: 'https://open.spotify.com/track/...',
            apple: 'https://music.apple.com/...',
            soundcloud: 'https://soundcloud.com/...',
            youtube: 'https://youtube.com/...'
        },
        'Fool Me Twice': {
            image: 'Fool Me Twice.jpg',
            title: 'Fool Me Twice',
            spotify: 'https://open.spotify.com/track/...',
            apple: 'https://music.apple.com/...',
            soundcloud: 'https://soundcloud.com/...',
            youtube: 'https://youtube.com/...'
        },
        'Sublime': {
            image: 'Sublime.jpg',
            title: 'Sublime',
            spotify: 'https://open.spotify.com/track/...',
            apple: 'https://music.apple.com/...',
            soundcloud: 'https://soundcloud.com/...',
            youtube: 'https://youtube.com/...'
        }
    };

    // Handle track clicks
    document.querySelectorAll('#tracklist-window .image-grid a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const songName = link.getAttribute('data-song');
            const track = trackData[songName];
            
            if (track) {
                showStreamingWindow(track);
            }
        });
    });

    // Show streaming window with track data
    function showStreamingWindow(track) {
        const streamWindow = document.getElementById('streaming-window');
        const artwork = document.getElementById('stream-artwork');
        
        // Update window title
        streamWindow.querySelector('.window-title').textContent = track.title;
        
        // Update artwork
        artwork.src = track.image;
        artwork.alt = track.title;

        // Update streaming links
        document.querySelector('.stream-link.spotify').href = track.spotify;
        document.querySelector('.stream-link.apple').href = track.apple;
        document.querySelector('.stream-link.soundcloud').href = track.soundcloud;
        document.querySelector('.stream-link.youtube').href = track.youtube;

        // Show window
        streamWindow.style.display = 'block';
    }

    // Handle window controls
    document.querySelector('#streaming-window .close').addEventListener('click', () => {
        document.getElementById('streaming-window').style.display = 'none';
    });
});

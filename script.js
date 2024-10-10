document.addEventListener('DOMContentLoaded', () => {
    const windows = document.querySelectorAll('.window');
    const taskbarItems = document.getElementById('taskbar-items');
    let activeWindow = null;
    let offsetX, offsetY;
    let isDragging = false;
    let hasSignedUp = false; // New flag to track if user has signed up

    // Store original positions of windows
    const originalPositions = new Map();
    windows.forEach(window => {
        originalPositions.set(window, {
            left: window.style.left,
            top: window.style.top
        });
    });

    // Function to adjust window positions on resize
    function adjustWindowPositions() {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        windows.forEach(window => {
            const originalPos = originalPositions.get(window);
            const isTracklistWindow = window.id === 'tracklist-window';
            
            // Calculate new dimensions
            let newWidth, newHeight;
            if (isTracklistWindow) {
                newWidth = Math.min(viewportWidth * 0.9, originalPos.width);
                newHeight = newWidth;  // Keep it square for tracklist
            } else {
                newWidth = Math.min(viewportWidth * 0.9, originalPos.width);
                newHeight = newWidth * (originalPos.height / originalPos.width);  // Maintain aspect ratio
            }

            // Set new dimensions
            window.style.width = `${newWidth}px`;
            window.style.height = `${newHeight}px`;

            // Calculate new position
            let newLeft, newTop;
            if (viewportWidth >= 1024) { // Full screen
                newLeft = originalPos.left;
                newTop = originalPos.top;
            } else { // Smaller screens
                if (isTracklistWindow) {
                    newLeft = `${(viewportWidth - newWidth) / 2}px`;  // Center horizontally
                    newTop = `${viewportHeight - newHeight - 10}px`;  // 10px margin from bottom
                } else {
                    newLeft = `${Math.max(0, Math.min(viewportWidth - newWidth, parseFloat(originalPos.left)))}px`;
                    newTop = `${Math.max(0, Math.min(viewportHeight - newHeight, parseFloat(originalPos.top)))}px`;
                }
            }

            // Set new position
            window.style.left = newLeft;
            window.style.top = newTop;

            // Ensure visibility
            window.style.display = 'block';
        });
    }

    // Store original dimensions along with positions
    windows.forEach(window => {
        originalPositions.set(window, {
            left: window.style.left,
            top: window.style.top,
            width: window.offsetWidth,
            height: window.offsetHeight
        });
    });

    // Add resize event listener
    window.addEventListener('resize', adjustWindowPositions);

    // Call adjustWindowPositions initially to set correct positions
    adjustWindowPositions();

    // Add resize event listener
    window.addEventListener('resize', adjustWindowPositions);

    // Call adjustWindowPositions initially to set correct positions
    adjustWindowPositions();

    // Cart state
    let cart = [];
    const cartIcon = document.getElementById('cart-icon');
    const cartBadge = document.getElementById('cart-badge');
    const cartWindow = document.getElementById('cart-window');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const checkoutButton = document.getElementById('checkout-button');

    // Load cart from local storage
    function loadCart() {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
            updateCartDisplay();
        }
    }

    // Save cart to local storage
    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // Add item to cart
    function addToCart(item) {
        const existingItem = cart.find(cartItem => 
            cartItem.name === item.name && cartItem.size === item.size
        );

        if (existingItem) {
            existingItem.quantity += item.quantity;
        } else {
            cart.push({...item, shipping: 'Standard Parcel'});
        }

        updateCartDisplay();
        saveCart();
    }
    // Update cart display
    function updateCartDisplay() {
        cartBadge.textContent = cart.reduce((total, item) => total + item.quantity, 0);
        cartItems.innerHTML = '';
        let subtotal = 0;
        let shippingCost = 0;

        cart.forEach((item, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.name}</td>
                <td>${item.size}</td>
                <td><input type="number" class="cart-quantity" value="${item.quantity}" min="1" max="10" data-index="${index}"></td>
                <td class="item-total">$${(item.price * item.quantity).toFixed(2)}</td>
                <td>
                    <select class="shipping-option" data-index="${index}">
                        <option value="Standard Parcel" ${item.shipping === 'Standard Parcel' ? 'selected' : ''}>Standard Parcel</option>
                        <option value="Express Parcel" ${item.shipping === 'Express Parcel' ? 'selected' : ''}>Express Parcel</option>
                        <option value="Standard International" ${item.shipping === 'Standard International' ? 'selected' : ''}>Standard International</option>
                        <option value="Express International" ${item.shipping === 'Express International' ? 'selected' : ''}>Express International</option>
                    </select>
                </td>
                <td><button class="remove-item" data-index="${index}">Remove</button></td>
            `;
            cartItems.appendChild(row);
            subtotal += item.price * item.quantity;
            shippingCost += getShippingCost(item.shipping);
        });

        const total = subtotal + shippingCost;
        cartTotal.innerHTML = `
            <p class="shipping-cost">Shipping: $${shippingCost.toFixed(2)}</p>
            <p>Total: $${total.toFixed(2)}</p>
        `;

        // Add event listeners for quantity changes and shipping options
        document.querySelectorAll('.cart-quantity').forEach(input => {
            input.addEventListener('change', handleQuantityChange);
        });
        document.querySelectorAll('.shipping-option').forEach(select => {
            select.addEventListener('change', handleShippingChange);
        });
    }

    // Get shipping cost based on selected option
    function getShippingCost(option) {
        switch (option) {
            case 'Standard Parcel':
                return 9.00;
            case 'Express Parcel':
                return 12.50;
            case 'Standard International':
                return 20.00;
            case 'Express International':
                return 40.00;
            default:
                return 0;
        }
    }

    // Handle shipping option change
    function handleShippingChange(e) {
        const index = e.target.dataset.index;
        cart[index].shipping = e.target.value;
        updateCartDisplay();
        saveCart();
    }

    // Handle quantity change in cart
    function handleQuantityChange(e) {
        const index = e.target.dataset.index;
        const newQuantity = parseInt(e.target.value);
        
        if (newQuantity >= 1 && newQuantity <= 10) {
            cart[index].quantity = newQuantity;
            const itemTotal = e.target.parentElement.nextElementSibling;
            itemTotal.textContent = `$${(cart[index].price * newQuantity).toFixed(2)}`;
            
            updateCartTotal();
            saveCart();
        } else {
            e.target.value = cart[index].quantity;
        }
    }

    // Update cart total
    function updateCartTotal() {
        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        cartTotal.textContent = `Total: $${total.toFixed(2)}`;
        cartBadge.textContent = cart.reduce((total, item) => total + item.quantity, 0);
    }

    // Event listener for cart icon
    cartIcon.addEventListener('click', () => {
        cartWindow.style.display = 'block';
    });

    // Event listener for cart window close button
    cartWindow.querySelector('.close').addEventListener('click', () => {
        cartWindow.style.display = 'none';
    });
    // Remove item from cart
    function removeFromCart(index) {
        cart.splice(index, 1);
        updateCartDisplay();
        saveCart();
    }

    // Event listener for cart icon
    cartIcon.addEventListener('click', () => {
        cartWindow.style.display = cartWindow.style.display === 'none' ? 'block' : 'none';
    });

    // Event listener for remove buttons
    cartItems.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-item')) {
            const index = parseInt(e.target.dataset.index);
            removeFromCart(index);
        }
    });

    // Event listener for checkout button
    checkoutButton.addEventListener('click', () => {
        alert('Checkout functionality not implemented yet.');
    });

    // T-shirt animation
    const tshirtImg = document.querySelector('#merch-window .merch-image');
    let currentFrame = 1;
    const totalFrames = 7;

    function animateTshirt() {
        currentFrame = (currentFrame % totalFrames) + 1;
        tshirtImg.src = `tshirt1/tshirt_${currentFrame}.png`;
    }

    setInterval(animateTshirt, 1000); // Change frame every second (7 seconds total for all frames)

    // Custom alert function
    function showCustomAlert(message) {
        const customAlert = document.getElementById('custom-alert');
        const customAlertMessage = document.getElementById('custom-alert-message');
        customAlertMessage.textContent = message;
        customAlert.style.display = 'block';
    
        setTimeout(() => {
            customAlert.style.animation = 'fadeOut 0.3s ease-in-out';
            setTimeout(() => {
                customAlert.style.display = 'none';
                customAlert.style.animation = '';
            }, 300);
        }, 1000);
    }

    // Add to Cart functionality
    document.querySelector('.add-to-cart-btn').addEventListener('click', () => {
        const productName = document.querySelector('#merch-window h2').textContent;
        const productPrice = parseFloat(document.querySelector('#merch-window .product-details p strong').textContent.replace('Price: $', ''));
        const productSize = document.querySelector('#size').value;
        const productQuantity = parseInt(document.querySelector('#quantity').value);

        if (productSize === '') {
            showCustomAlert('Please select a size.');
            return;
        }

        if (isNaN(productQuantity) || productQuantity < 1) {
            showCustomAlert('Please select a valid quantity.');
            return;
        }

        const item = {
            name: productName,
            price: productPrice,
            size: productSize,
            quantity: productQuantity
        };

        addToCart(item);
        showCustomAlert(`${productQuantity} item(s) added to cart!`);
    });

    // Update addToCart function
    function addToCart(item) {
        const existingItem = cart.find(cartItem => 
            cartItem.name === item.name && cartItem.size === item.size
        );

        if (existingItem) {
            existingItem.quantity += item.quantity;
        } else {
            cart.push({...item, shipping: 'Standard Parcel'});
        }

        updateCartDisplay();
        saveCart();
    }

    // Add to cart functionality for merchandise
    const purchaseForm = document.querySelector('.purchase-form');
    purchaseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const size = document.getElementById('size').value;
        const quantity = parseInt(document.getElementById('quantity').value);
        addToCart({
            name: 'Tom Riddle T-Shirt',
            size: size,
            quantity: quantity,
            price: 29.99
        });
        showCustomAlert('Item added to cart!');
    });

    // Close button functionality for custom alert
    document.querySelector('#custom-alert .close').addEventListener('click', () => {
        document.getElementById('custom-alert').style.display = 'none';
    });

    windows.forEach(window => {
        const minimizeBtn = window.querySelector('.minimize');
        const maximizeBtn = window.querySelector('.maximize');
        const closeBtn = window.querySelector('.close');
        const windowTitle = window.querySelector('.window-title').textContent;
        const windowHeader = window.querySelector('.window-header');

        // Create taskbar item
        const taskbarItem = document.createElement('div');
        taskbarItem.classList.add('taskbar-item');
        taskbarItem.textContent = windowTitle;
        taskbarItems.appendChild(taskbarItem);

        // Make window draggable
        windowHeader.addEventListener('mousedown', (e) => {
            if (e.target === windowHeader || e.target.classList.contains('window-title')) {
                activeWindow = window;
                isDragging = true;
                offsetX = e.clientX - window.getBoundingClientRect().left;
                offsetY = e.clientY - window.getBoundingClientRect().top;
                window.style.zIndex = 1000; // Bring active window to front
            }
        });

        // Prevent dragging when clicking on window controls
        window.querySelector('.window-controls').addEventListener('mousedown', (e) => {
            e.stopPropagation();
        });

        // Minimize button
        minimizeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            window.style.display = 'none';
            taskbarItem.classList.add('active');
        });

        // Maximize button
        maximizeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (window.style.width === '100vw') {
                window.style.width = '';
                window.style.height = '';
                window.style.position = '';
                window.style.top = '';
                window.style.left = '';
                window.querySelector('.window-controls').style.display = 'flex';
            } else {
                window.style.width = '100vw';
                window.style.height = '100vh';
                window.style.position = 'fixed';
                window.style.top = '0';
                window.style.left = '0';
                window.querySelector('.window-controls').style.display = 'none';
            }
            window.style.display = 'block';
            taskbarItem.classList.remove('active');
        });

        // Close button
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            window.style.display = 'none';
            taskbarItem.style.display = 'none';
        });

        // Taskbar item click event
        taskbarItem.addEventListener('click', () => {
            if (window.style.display === 'none') {
                window.style.display = 'block';
                taskbarItem.classList.remove('active');
            } else {
                window.style.display = 'none';
                taskbarItem.classList.add('active');
            }
        });
    });





    // Add Windows 95 startup sound
    const startupSound = new Audio('windows95.mp3');
    startupSound.play();

    // Start button functionality
    const startButton = document.getElementById('start-button');
    const startTable = document.querySelector('.start-table');
    
    // Ensure the start table is initially hidden
    startTable.style.display = 'none';
    
    startButton.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent the click from being detected on the body
        if (startTable.style.display === 'none') {
            startTable.style.display = 'table';
        } else {
            startTable.style.display = 'none';
        }
    });

    // Close start menu when clicking outside
    document.body.addEventListener('click', () => {
        startTable.style.display = 'none';
    });

    // Newsletter popup functionality
    const newsletterWindow = document.getElementById('newsletter-window');
    let newsletterShown = false;

    // Function to show newsletter
    function showNewsletter() {
        if (!hasSignedUp) {
            newsletterWindow.style.display = 'block';
            newsletterShown = true;
        }
    }

    // Function to hide newsletter
    function hideNewsletter() {
        newsletterWindow.style.display = 'none';
        newsletterShown = false;
    }

    // Set initial display state to 'none'
    hideNewsletter();

    // Show newsletter window after 5 seconds
    setTimeout(showNewsletter, 5000);

    // Keep the scroll event listener for hiding the newsletter
    window.addEventListener('scroll', () => {
        const scrollPosition = window.innerHeight + window.scrollY;
        const bodyHeight = document.body.offsetHeight;

        if (scrollPosition < bodyHeight - 300 && newsletterShown) {
            hideNewsletter();
        }
    });

    // Close newsletter window when close button is clicked
    const newsletterCloseBtn = newsletterWindow.querySelector('.close');
    newsletterCloseBtn.addEventListener('click', hideNewsletter);

    // Handle newsletter form submission
    const newsletterForm = document.getElementById('newsletter-form');
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);

        fetch(form.action, {
            method: form.method,
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        }).then(response => {
            if (response.ok) {
                hasSignedUp = true; // Set the flag to true after successful submission
                hideNewsletter();
                alert('Thank you for subscribing to our newsletter!');
            } else {
                throw new Error('Form submission failed');
            }
        }).catch(error => {
            console.error('Error:', error);
            alert('There was an error submitting your email. Please try again later.');
        });
    });
});

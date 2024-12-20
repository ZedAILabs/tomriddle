document.addEventListener('DOMContentLoaded', () => {
    // Initialize Stripe with your publishable key
    const stripe = Stripe('pk_live_51JafFPK8JIgzIqJoNaPdEDfpHo8yxpZM0739JTVt2aF9Zf42cmXhQAJmcXNbhNM3k4ammPksHAj2cAnor8bnwyop008jvHuxR9');
    const elements = stripe.elements();
    const cardElement = elements.create('card', {
        style: {
            base: {
                fontFamily: '"MS Sans Serif", sans-serif',
                fontSize: '14px',
                color: '#000',
                '::placeholder': {
                    color: '#666'
                }
            }
        }
    });

    // Mount Stripe Card element
    cardElement.mount('#stripe-card-element');

    // Initialize PayPal
    paypal.Buttons({
        style: {
            layout: 'horizontal',
            color: 'blue',
            shape: 'rect',
            label: 'pay'
        },
        createOrder: function(data, actions) {
            const checkoutData = JSON.parse(localStorage.getItem('checkoutData'));
            return actions.order.create({
                purchase_units: [{
                    amount: {
                        value: checkoutData.total.toFixed(2),
                        currency_code: 'AUD'
                    }
                }]
            });
        },
        onApprove: function(data, actions) {
            return actions.order.capture().then(function(details) {
                handleSuccessfulPayment('paypal', details);
            });
        }
    }).render('#paypal-btn-container');

    // Handle Stripe card payment
    document.getElementById('stripe-submit-btn').addEventListener('click', async (e) => {
        e.preventDefault();
        const form = document.getElementById('checkout-form');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const checkoutData = JSON.parse(localStorage.getItem('checkoutData'));
        
        try {
            const { paymentIntent, error } = await stripe.confirmCardPayment(
                'CLIENT_SECRET', // This should come from your server
                {
                    payment_method: {
                        card: cardElement,
                        billing_details: {
                            name: form.name.value,
                            email: form.email.value
                        }
                    }
                }
            );

            if (error) {
                showError(error.message);
            } else {
                handleSuccessfulPayment('stripe', paymentIntent);
            }
        } catch (err) {
            showError('An error occurred during payment processing.');
        }
    });

    // Handle successful payment
    function handleSuccessfulPayment(provider, details) {
        localStorage.removeItem('cart');
        localStorage.removeItem('checkoutData');

        const successWindow = document.createElement('div');
        successWindow.className = 'window';
        successWindow.innerHTML = `
            <div class="window-header">
                <span class="window-title">Order Confirmed</span>
                <div class="window-controls">
                    <button class="close">×</button>
                </div>
            </div>
            <div class="window-content">
                <h3>Thank you for your order!</h3>
                <p>Your payment has been processed successfully.</p>
                <p>Order ID: ${details.id || 'N/A'}</p>
                <button onclick="window.location.href='index.html'">Return to Store</button>
            </div>
        `;
        document.body.appendChild(successWindow);
    }

    function showError(message) {
        const errorWindow = document.createElement('div');
        errorWindow.className = 'window error-window';
        errorWindow.innerHTML = `
            <div class="window-header">
                <span class="window-title">Error</span>
                <div class="window-controls">
                    <button class="close">×</button>
                </div>
            </div>
            <div class="window-content">
                <p>${message}</p>
                <button onclick="this.parentElement.parentElement.remove()">OK</button>
            </div>
        `;
        document.body.appendChild(errorWindow);
    }
});
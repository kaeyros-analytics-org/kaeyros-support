const form = document.getElementById('loginForm');

form.addEventListener('submit', async (event) => {
    event.preventDefault(); 
  
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const response = await fetch('api/customers/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });

    

    const result = await response.json();
    if (response.ok) {
        alert('Login successful!');
        window.location.href = './html/home.html';
    } else {
        alert('Login failed: ' + result.message);
    }
});
document.getElementById('loginForm').addEventListener('submit', function(event) {
  event.preventDefault(); // Prevent form from submitting the traditional way

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const loginData = { email, password };

  // Send POST request to the login endpoint
  fetch('api/customers/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(loginData),
  })
    .then(response => response.json())
    .then(data => {
      if (data.token) {
        // Store the token in localStorage
        localStorage.setItem('authToken', data.token);
        //   alert('login succesful');
        // Redirect to the home page or dashboard
        window.location.href = '/home.html';
      } else {
        alert(data.msg || 'Login failed');
      }
    })
    .catch(err => {
      console.error('Error during login:', err);
      alert('Something went wrong. Please try again.');
    });
});


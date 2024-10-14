// Modal and related DOM elements
const modal = document.getElementById('myModal');
const modal2 = document.getElementById('myModal2');
const closeButton = document.querySelector('.close');

// Page load initialization
document.addEventListener('DOMContentLoaded', () => {
  const ticketForm = document.getElementById('ticketForm');
  const customersBtn = document.getElementById('customersBtn');
  const customerForm = document.getElementById('customerForm');
  const ticketsBtn = document.getElementById('ticketsBtn');
  const ticketsTableContainer = document.getElementById('ticketsTableContainer');
  const customersTableContainer = document.getElementById('customersTableContainer');

  let isAdmin = false;

  const token = getToken();
  if (!token) {
    alert('No token found. Please log in.');
    return;
  }

  // Fetch user role
  fetch('/api/customers/get-role', {
    headers: {
      'auth-token': token
    }
  })
    .then(response => response.json())
    .then(data => {
      if (data.role === 'admin') {
        ticketForm.style.display = 'none';
        customerForm.style.display = 'block';
        customersBtn.style.display = 'block';
        isAdmin = true;
        fetchCustomers(); 
      } else {
        customerForm.style.display = 'none';
        ticketForm.style.display = 'block';
        customersBtn.style.display = 'none';
        isAdmin = false; 
      }
    })
    .catch(error => {
      console.error('Error fetching role:', error);
    });

  // Toggle between customers and tickets
  customersBtn.addEventListener('click', function () {
    if (isAdmin) {
      ticketsTableContainer.style.display = 'none';
      customersTableContainer.style.display = 'block';
      customersBtn.style.display = 'none';
      ticketsBtn.style.display = 'block';
    }
  });

  ticketsBtn.addEventListener('click', function () {
    ticketsTableContainer.style.display = 'block';
    customersTableContainer.style.display = 'none';
    ticketsBtn.style.display = 'none';
    customersBtn.style.display = isAdmin ? 'block' : 'none';
  });
});


// Create a new ticket
ticketForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const project = document.getElementById('project').value;
  const subject = document.getElementById('subject').value;
  const priority = document.querySelector('input[name="priority"]:checked').value;
  const type = document.getElementById('type').value;
  const description = document.getElementById('description').value;

  const token = getToken();

  if (!token) {
    alert("No token provided. Please log in.");
    return;
  }

  try {
    const response = await fetch('/api/tickets/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': token
      },
      body: JSON.stringify({ project, subject, priority, type, description })
    });

    if (response.ok) {
      alert('Ticket created successfully!');
      fetchTickets(); 
    } else {
      const result = await response.json();
      alert('Ticket creation failed: ' + result.msg);
    }
  } catch (error) {
    console.error('Error creating ticket:', error);
  }
});

// Fetch and display tickets
async function fetchTickets() {
  const token = getToken();

  if (!token) {
    alert("No token provided. Please log in.");
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/api/tickets/all", {
      headers: {
        'auth-token': token
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch tickets');
    }

    const tickets = await response.json();
    const tableBody = document.querySelector(".tickets-table tbody");
    tableBody.innerHTML = "";

    let openTicketsCount = 0;
    let processedTicketsCount = 0;

    tickets.forEach(ticket => {
      const row = document.createElement("tr");

      const createCell = (text) => {
        const cell = document.createElement("td");
        cell.textContent = text;
        return cell;
      };

      row.appendChild(createCell(ticket.ticket_id));
      row.appendChild(createCell(ticket.project));
      row.appendChild(createCell(ticket.subject));
      row.appendChild(createCell(ticket.priority));
      row.appendChild(createCell(ticket.type));
      row.appendChild(createCell(new Date(ticket.created_at).toLocaleDateString()));

      tableBody.appendChild(row);

      // When a row is clicked, show the modal and populate ticket data and responses
      row.addEventListener('click', function () {
        modal.style.display = 'flex';
        displayTicketDetails(ticket);
      });

      // Count open and processed tickets
      if (ticket.status === 'open') {
        openTicketsCount++;
      } else if (ticket.status === 'processed') {
        processedTicketsCount++;
      }
    });

    document.getElementById('ticketCount').textContent = tickets.length;
    document.getElementById('openTicketCount').textContent = openTicketsCount;
    document.getElementById('processedTicketCount').textContent = processedTicketsCount;
  } catch (error) {
    console.error("Error fetching tickets:", error);
    alert("An error occurred while fetching the tickets.");
  }
}

fetchTickets();

// Display ticket details in the modal and fetch responses
function displayTicketDetails(ticket) {
  const recupIdSubjecDiv = document.querySelector('.recup-id-subjec');
  const boss = document.querySelector('.boss');
  const boss1 = document.querySelector('.boss1');
  const sendMessageButton = document.getElementById('responseBtn');

  // Clear previous event listeners to avoid duplication
  sendMessageButton.replaceWith(sendMessageButton.cloneNode(true));
  const newSendMessageButton = document.getElementById('responseBtn');

  // Write ticket information in modal
  recupIdSubjecDiv.innerHTML = `<p><strong style='font-size: 30px; display: flex; color: #FF5F00; gap: 60px;'> ${ticket.ticket_id} ${ticket.subject}</strong></p>`;
  boss1.innerHTML = `<p>${ticket.type}</p>`;
  boss.innerHTML = `<p>${ticket.priority}</p>`;

  const ticketId = ticket.id; // Ensure correct ticketId is used

  // Fetch ticket responses and display them
  const token = getToken();

  fetch(`/api/responses/${ticketId}/responses`, {
    method: 'GET',
    headers: {
      'auth-token': token,
      'Content-Type': 'application/json'
    }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(responses => {
      console.log('Received responses:', responses); // Log raw response data

      if (!Array.isArray(responses)) {
        throw new TypeError('Expected an array of responses.');
      }

      const accordionContainer = document.querySelector('.accordion-container');
      accordionContainer.innerHTML = ''; // Clear previous responses

      // Add ticket activity (creation)
      accordionContainer.innerHTML += `
        <div class="accordion">
          <p>Ticket Created: ${new Date(ticket.created_at).toLocaleString()}</p>
          <img src="../image/arrow.jpg" class="arrow" />
        </div>
        <div class="panel">
          <p>${ticket.description}</p>
        </div>`;

      // Add all the responses to the accordion
      responses.forEach(response => {
        const sender = response.sender === 'admin' ? 'Admin Response' : 'User Message';
        const responseClass = response.sender === 'admin' ? 'admin-response' : 'user-response';
        
        accordionContainer.innerHTML += `
          <div class="accordion">
            <p>${sender}</p>
            <img src="../image/arrow.jpg" class="arrow" />
          </div>
          <div class="panel">
            <p class="${responseClass}">${response.response}</p>
          </div>`;
      });

      
      addAccordionFunctionality();
    })
    .catch(err => {
      console.error('Failed to fetch responses:', err); 
    });

// Event listener for sending a response
newSendMessageButton.addEventListener('click', function () {
  const responseTextArea = document.getElementById('response'); 
  const responseContent = responseTextArea.value;

  if (!responseContent.trim()) {
    alert('Response cannot be empty.');
    return;
  }


  const payload = {
    response: responseContent,
    images: null // Image uploading can be added later
  };

  const token = getToken();

  // Send the response to the backend
  fetch(`/api/responses/${ticketId}/responses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'auth-token': token 
    },
    body: JSON.stringify(payload)
  })
    .then(response => response.json())
    .then(data => {
      if (data.msg === 'Response sent successfully.') {
        responseTextArea.value = ''; 
        displayTicketDetails(ticket);
      }
    })
    .catch(err => console.error('Failed to send response:', err));
});
}


function getToken() {
  return localStorage.getItem('token');
}



// Accordion toggle functionality
function addAccordionFunctionality() {
  const accordions = document.querySelectorAll('.accordion');
  accordions.forEach(accordion => {
    accordion.addEventListener('click', () => {
      const panel = accordion.nextElementSibling;
      accordion.classList.toggle('active');
      if (panel.style.maxHeight) {
        panel.style.maxHeight = null;
      } else {
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });
}




// Modal close functionality
closeButton.addEventListener('click', () => {
  modal.style.display = 'none';
});

window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = 'none';
  }
};

// Utility: Get token from local storage
function getToken() {
  return localStorage.getItem('token');
}




////////////////////////////////////////////
///////--------CUSTOMERS-----------/////////
////////////////////////////////////////////


//////////----REGISTER A NEW CUSTOMER----//////////

document.getElementById('customerForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const phone_number = document.getElementById('phone_number').value;
  const project = document.getElementById('project1').value;
  const password = document.getElementById('password').value;

  console.log('Selected project:', project1);

  if (!name || !email || !project || !phone_number || !password) {
    alert("Please fill all the fields.");
    return;
  }

  try {
    const response = await fetch('api/customers/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, phone_number, project, password})
    });

    if (response.ok) {
      alert('Customer registered successfully!');
      document.getElementById('customerForm').reset();
      fetchCustomers(); 
    } else {
      const result = await response.json();
      alert('Registration failed: ' + result.msg);
    }
  } catch (error) {
    console.error('Error registering customer:', error);
  }
});


//////////----FETCH AND DISPLAY ALL CUSTOMERS----//////////
async function fetchCustomers() {
  try {
    const response = await fetch('api/customers/all', {
      headers: {
        'auth-token': getToken()
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch customers');
    }

    const result = await response.json();
    const customers = result.customers;

    const tableBody = document.querySelector('#customersTable tbody');
    tableBody.innerHTML = ''; 

    if (customers.length === 0) {
      alert('No customers found.');
      return;
    }

    customers.forEach(customer => {
      const row = document.createElement('tr');
    
      // Assign a unique ID to the row based on the customer ID
      row.id = `customer-row-${customer.id}`;
    
      const createCell = (text) => {
        const cell = document.createElement('td');
        cell.textContent = text;
        return cell;
      };
    
      row.appendChild(createCell(customer.id));
      row.appendChild(createCell(customer.project));
      row.appendChild(createCell(customer.name));
      row.appendChild(createCell(customer.email));
      row.appendChild(createCell(customer.phone_number));
      row.appendChild(createCell(new Date(customer.created_at).toLocaleDateString())); 
    
      const deleteBtn = document.querySelector('#deleteCustomersBtn');
    
      row.addEventListener('click', function () {
        modal2.style.display = 'flex';
    
        const recupIdSubjecDiv = document.getElementById('recup-id-subjec2');
        const boss = document.getElementById('boss2');
        const boss1 = document.getElementById('boss12');
    
        // write customer information in modal
        recupIdSubjecDiv.innerHTML = `
          <p><strong style='font-size: 30px;'> ${customer.id  } ${customer.email}</strong></p>`;
        boss1.innerHTML = `<p><b>${customer.name}</b></p>`;
        boss.innerHTML = `<p><b>${customer.project}</b></p>`;
    
        // Store customer ID in the delete button dataset for deletion
        deleteBtn.dataset.customerId = customer.id; 
      });
    
      tableBody.appendChild(row);
    });
    
  } catch (error) {
    if (isAdmin) { 
      console.error('Error fetching customers:', error);
      alert('An error occurred while fetching customers.');
    }
  }
}



fetchCustomers();


function getToken() {
  return localStorage.getItem('auth-token');
}


window.addEventListener('click', function (event) {
  if (event.target === modal2) {
    modal2.style.display = 'none';
  }
});


//////////----DELETE CUSTOMERS----//////////

function getToken() {
  return localStorage.getItem('token');
}

function addDeleteButtonListener(deleteCustomersBtn) {
  deleteCustomersBtn.addEventListener('click', async () => {
    const customerId = deleteCustomersBtn.dataset.customerId; // Get the customer ID from the dataset

    if (!customerId) {
      alert("Customer ID is missing.");
      return;
    }

    const token = getToken();
    if (!token) {
      alert("No token provided. Please log in.");
      return;
    }

    const confirmDelete = confirm("Are you sure you want to delete this customer?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'DELETE',
        headers: {
          'auth-token': token
        }
      });

      if (response.ok) {
        alert('Customer deleted successfully.');
        
        // Close the modal
        document.getElementById('myModal2').style.display = 'none';
        
        // Dynamically remove the row associated with the deleted customer
        const rowToDelete = document.getElementById(`customer-row-${customerId}`);
        if (rowToDelete) {
          rowToDelete.remove();
        } else {
          console.error(`Row for customer ID ${customerId} not found.`);
        }
      } else {
        const result = await response.json();
        alert('Failed to delete customer: ' + result.msg);
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('An error occurred while deleting the customer.');
    }
  });
}

// Initialize delete button listener
const deleteBtn = document.querySelector('#deleteCustomersBtn');
addDeleteButtonListener(deleteBtn);



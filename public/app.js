
document.addEventListener("DOMContentLoaded", async () => {
  
    const sidebarLinks = document.querySelectorAll(".menu-btn");
    const role = await getUserRole();
    displayMenuBasedOnRole(role);
    const pages = document.querySelectorAll('.page');
    
   
    document.getElementById("logout").addEventListener("click", () => {
       localStorage.clear()
       window.location.href = '/index.html';
    });
    sidebarLinks.forEach(link => {
      link.addEventListener("click", (e) => {
        sidebarLinks.forEach(link => link.classList.remove("active"));
        e.currentTarget.classList.add("active");
        loadDashboardStats();

   
        // Get target ID from the data-target attribute
        const target = e.currentTarget.getAttribute('data-target');
        // const newUrl = `/home.html/${target}`; //new URL
        // window.history.pushState({}, '', newUrl);

        //   // Handle URL changes
        // window.addEventListener('popstate', (event) => {
        //   const path = window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1);
        //   displaySection(path); 
        // });
   
        // Find the active page and remove the 'active' class
        const activePage = document.querySelector('.page.active');
        if (activePage) {
          activePage.classList.remove('active');
        }
   
        // Add active class to the target page
        const targetPage = document.getElementById(target);
        targetPage.classList.add('active');
   
        // Set the display of pages
        pages.forEach(page => {
         if (page.id === target) {
          page.style.display = 'block';
          document.getElementById("create-ticket-section").style.display = "none";
          document.getElementById("create-customer-section").style.display = "none";
         } else {
          page.style.display = 'none';
          
         }
        });
   
      });
    });
   
    // Initially display the dashboard for admin, and tickets for other users
    if (role === 'admin') {
      document.getElementById('dashboard').style.display = 'block';
      document.querySelector('.menu-btn[data-target="dashboard"]').classList.add('active'); 
    } else {
      document.getElementById('tickets-section').style.display = 'block';
      document.querySelector('.menu-btn[data-target="tickets-section"]').classList.add('active');
    }
   
    loadDashboardStats();
});  

let currentRole = null;

   
///GET USER ROLE
async function getUserRole() {
  try {
   const response = await fetch('/api/customers/get-role', {
    headers: { 'auth-token': localStorage.getItem('authToken') },
   });
   if (!response.ok) throw new Error("Failed to fetch user role");
   const data = await response.json();
   currentRole = data.role; // Assign the role to the global variable
   return data.role;
  } catch (error) {
   console.error('Error fetching user role:', error);
  }
 }
   
   function displayMenuBasedOnRole(role) {
     if (role === 'admin') {
       document.getElementById("admin-menu").classList.remove("hidden");
       document.getElementById("admin-header").classList.remove("hidden");
     } else {
       document.getElementById("user-menu").classList.remove("hidden");
     }
   }
 
   
/////GET USER INFORMATION
   async function getUserProfile() {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
        console.error("No auth token found, redirecting to login.");
        window.location.href = '/index.html';
        return;
    }

    try {
        const response = await fetch('/api/customers/profile', {
          headers: { 'auth-token': localStorage.getItem('authToken') },
        });

        if (!response.ok) throw new Error("Failed to fetch user profile");

        const userData = await response.json();
        
        if (userData) {
            // Display user information in the sidebar
            console.log("User data fetched:", userData); // Debug log
            document.getElementById('profile-pic').src = userData.image || './images/default-profile.jpg';
            document.getElementById('user-name').innerText = userData.name;
            document.getElementById('user-project').innerText = userData.project;
            document.getElementById("admin-name").innerText = userData.name;

        }
    } catch (err) {
        console.error('Error fetching profile:', err);
    }
}
window.onload = getUserProfile;


///LOAD DASHBOARD STATS
async function loadDashboardStats() {
  try {
      const stats = await fetchStats();

      // Set top-level statistics
      document.getElementById("total-tickets").innerText = stats.totalTickets;
      document.getElementById("open-tickets").innerText = stats.openTickets;
      document.getElementById("closed-tickets").innerText = stats.closedTickets;
      document.getElementById("num-customers").innerText = stats.numCustomers;

      // Render top donut charts
      renderPercentageDonutChart("total-tickets-chart", stats.totalTickets, 100, ['#0f2a97']);
      renderPercentageDonutChart("open-tickets-chart", stats.openTickets, (stats.openTickets / stats.totalTickets) * 100, ['#0f2a97', '#ddd']);
      renderPercentageDonutChart("closed-tickets-chart", stats.closedTickets, (stats.closedTickets / stats.totalTickets) * 100, ['#f80e06', '#ddd']);

      // Render additional stats donut charts
      renderDonutChartWithLabels("tickets-department-chart", stats.ticketsByDepartment, "tickets-department-labels");
      renderDonutChartWithLabels("tickets-type-chart", stats.ticketsByType, "tickets-type-labels");
      renderDonutChartWithLabels("top-creators-chart", stats.topCreators, "top-creators-labels");

  } catch (error) {
      console.error("Error loading dashboard stats:", error);
  }
}

async function fetchStats() {
  const token = localStorage.getItem('authToken');
  try {
      const response = await fetch('/api/tickets/stats', {
          headers: { 'auth-token': token }
      });
      if (!response.ok) throw new Error("Failed to fetch stats");

      return await response.json();
  } catch (error) {
      console.error("Error fetching stats:", error);
  }
}

function renderPercentageDonutChart(canvasId, value, percentage, colors) {
  const ctx = document.getElementById(canvasId).getContext("2d");

  new Chart(ctx, {
     type: 'doughnut',
     data: {
        datasets: [{
           data: [percentage, 100 - percentage],
           backgroundColor: colors,
        }],
     },
     options: {
        responsive: true,
        cutoutPercentage: 70, // For Chart.js 3.x, else use cutout
        plugins: {
           legend: { display: false },
           tooltip: { enabled: false },
           doughnutlabel: {
              labels: [
                 {
                    text: `${percentage.toFixed(1)}%`,
                    font: { size: 20, weight: 'bold' },
                    color: '#333',
                 },
              ],
           },
        },
     },
  });
}


function renderDonutChartWithLabels(canvasId, data, labelContainerId) {
  const ctx = document.getElementById(canvasId).getContext("2d");

  const totalValue = data.reduce((acc, item) => acc + item.count, 0);
  const colors = ['#0f2a97', '#f80e06', '#008080', '#FFD700', '#FF69B4'];

  // Sort the data by percentage from highest to lowest
  data.sort((a, b) => {
    const percentageA = (a.count / totalValue) * 100;
    const percentageB = (b.count / totalValue) * 100;
    return percentageB - percentageA; // Sort in descending order
  });

  new Chart(ctx, {
      type: 'doughnut',
      data: {
          labels: data.map(item => item.name),
          datasets: [{
              data: data.map(item => item.count),
              backgroundColor: colors,
          }],
      },
      options: {
          responsive: true,
          cutout: '60%',
          plugins: {
              legend: { display: false },
              tooltip: {
                  callbacks: {
                      label: function (tooltipItem) {
                          const item = data[tooltipItem.dataIndex];
                          const percentage = ((item.count / totalValue) * 100).toFixed(1);
                          return `${item.name}: ${percentage}% (${item.count})`;
                      }
                  }
              }
          },
      },
  });

  const labelContainer = document.getElementById(labelContainerId);
  labelContainer.innerHTML = ''; // Clear previous labels

  data.forEach((item, index) => {
      const percentage = ((item.count / totalValue) * 100).toFixed(1);

      const labelItem = document.createElement('div');
      labelItem.classList.add('label-item');
      labelItem.innerHTML = `
          <span class="color-box" style="background-color: ${colors[index]};"></span>
          <span>${item.name}: ${percentage}% (${item.count})</span>
      `;
      labelContainer.appendChild(labelItem);
  });
}



document.getElementById("create-ticket-btn").addEventListener("click", () => {
  document.getElementById("tickets-section").style.display = "none";
  document.getElementById("create-ticket-section").style.display = "block";
});


document.getElementById("create-customer-btn").addEventListener("click", () => {
    // Show customer creation form and hide customers table
    document.getElementById("customers-section").style.display = "none";
    document.getElementById("create-customer-section").style.display = "block";
});



////////////////////////////////////////////
//////////////// TICKETS ///////////////////
////////////////////////////////////////////

// CREATE A NEW TICKET
const backButton = document.getElementById('back-btn');
const ticketForm = document.getElementById('ticketForm');
const ticketsTableBody = document.querySelector("#ticketsTable tbody");


backButton.addEventListener('click', () => {
  document.getElementById("create-ticket-section").style.display = 'none';
  document.getElementById('tickets-section').style.display = 'block';
});


ticketForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const project = document.getElementById('project').value;
  const subject = document.getElementById('subject').value;
  const priority = document.querySelector('input[name="priority"]:checked').value;
  const type = document.getElementById('type').value;
  const department = document.getElementById('department').value;
  const description = document.getElementById('description').value;

  const token = localStorage.getItem('authToken');

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
      body: JSON.stringify({ project, subject, priority, type, description, department })
    });

    if (response.ok) {
      alert('Ticket created successfully!');
      document.getElementById("tickets-section").style.display = "block";
      document.getElementById("create-ticket-section").style.display = "none";

      fetchTickets(); 
    } else {
      const result = await response.json();
      alert('Ticket creation failed: ' + result.msg);
    }
  } catch (error) {
    console.error('Error creating ticket:', error);
  }
});


// FETCH AND DISPLAY TICKETS  AND FILTER OPTIONS
async function fetchTickets(filterStatus = "", filterPriority = "") { 
  try {
   const queryParams = new URLSearchParams({
    status: filterStatus,     
    priority:filterPriority 
   });
   const url = `/api/tickets/all?${queryParams.toString()}`; 
 
   const response = await fetch(url, {
    headers: { 'auth-token': localStorage.getItem('authToken') },
   });
   if (!response.ok) throw new Error("Failed to fetch tickets");
   const tickets = await response.json();
   ticketsTableBody.innerHTML = ''; 
   tickets.forEach(ticket => {
    appendTicketRow(ticket);
   });
  } catch (error) {
   console.error("Error fetching tickets:", error);
  }
 }
 
 //  status filter
 const statusFilterSelect = document.getElementById("status-filter");
 statusFilterSelect.addEventListener("change", () => {
  const selectedStatus = statusFilterSelect.value;
  const selectedPriority = priorityFilterSelect.value;
  fetchTickets(selectedStatus, selectedPriority); 
 });

//  priority filter
 const priorityFilterSelect = document.getElementById("priority-filter");
 priorityFilterSelect.addEventListener("change", () => {
     const selectedStatus = statusFilterSelect.value;
     const selectedPriority = priorityFilterSelect.value;
     fetchTickets(selectedStatus, selectedPriority);
 });

// Function to append a single ticket row to the table
function setStatusColor(status) {
  return status === 'open' ? 'green' : 'red';
}

function appendTicketRow(ticket) {
  const row = document.createElement("tr");
  row.dataset.ticketId = ticket.id;

  row.innerHTML = `
    <td>${ticket.ticket_id}</td>
    <td>${ticket.project}</td>
    <td>${ticket.subject}</td>
    <td>${ticket.priority}</td>
    <td>${ticket.type}</td>
    <td>${formatDate1(ticket.created_at)}</td>
    <td style="color: ${setStatusColor(ticket.status)}">${ticket.status}</td> 
    <td class="notification-cell">
      <span class="notification-badge" id="notify-${ticket.ticket_id}" style="display: none;">0</span>
    </td>
  `;

  row.addEventListener('click', function () {
    openTicketModal(ticket);
  });

  ticketsTableBody.appendChild(row);

  function formatDate1(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()); 

    return `${day}/${month}/${year}`;
  }

// OPEN TICKET MODAL
function openTicketModal(ticket) {
  
  const closeButton = document.getElementById('close-modal');
  const modal = document.getElementById("ticket-modal");
  const status1 = document.querySelector('.ticket-status');
  const responseTextArea = document.getElementById('response');
  const sendMessageButton = document.getElementById('send-response');
 
  // Set ticket information
  document.getElementById("ticket-id-subject").textContent = `${ticket.ticket_id} - ${ticket.subject}`;
  document.getElementById("ticket-type").textContent = ticket.type;
  document.getElementById("ticket-priority").textContent = ticket.priority;
  document.getElementById("ticket-department").textContent = ticket.department;


// Remove previous event listener to avoid duplicate calls
const newSendMessageHandler = async function () {
  const responseContent = responseTextArea.value;

  if (!responseContent.trim()) {
    alert('Response cannot be empty.');
    return;
  }

  const payload = {
    response: responseContent,
    images: null 
  };

  const token = localStorage.getItem('authToken');

  try {
    // Send the response to the backend
    const response = await fetch(`/api/responses/${ticketId}/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': token 
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (data.msg === 'Response sent successfully.') {
      responseTextArea.value = '';
      openTicketModal(ticket); 
    }
  } catch (err) {
    console.error('Failed to send response:', err);
  }
};

// Clear any previous event listener and add the new one
sendMessageButton.removeEventListener('click', newSendMessageHandler);
  sendMessageButton.addEventListener('click', newSendMessageHandler, { once: true });

 // Update status dropdown and color
 const statusDropdown = document.createElement("select");
 statusDropdown.name = "status";
 statusDropdown.classList.add("status-dropdown");

 // 'open' option
 const openOption = document.createElement("option");
 openOption.value = "open";
 openOption.textContent = "Open";
 openOption.style.color = "green";
 openOption.classList.add("status-option")

 // 'closed' option
 const closedOption = document.createElement("option");
 closedOption.value = "closed";
 closedOption.textContent = "Closed";
 closedOption.style.color = "red";
closedOption.classList.add("status-option")


 // Append the options to the dropdown
 statusDropdown.appendChild(openOption);
 statusDropdown.appendChild(closedOption);

 statusDropdown.value = ticket.status;

 updateDropdownColor(statusDropdown);

 // Event Listener for Status Change
 statusDropdown.addEventListener('change', async function () {
  const newStatus = statusDropdown.value;

  try {
   await updateTicketStatus(ticket.id, newStatus); 
   ticket.status = newStatus; 
   updateDropdownColor(statusDropdown); // Update dropdown color

   // Update the status in the table without reloading the page
   const tableRow = document.querySelector(`tr[data-ticket-id="${ticket.id}"]`);
   if (tableRow) {
    const statusCell = tableRow.querySelector('td:nth-child(7)');
    statusCell.textContent = newStatus;
    statusCell.style.color = newStatus === 'open' ? 'green' : 'red';
   }

   console.log("Ticket status updated to:", newStatus);
  } catch (error) {
   console.error('Error updating ticket status:', error);
   alert('Failed to update ticket status');
  }
 });

 status1.innerHTML = '';
 status1.appendChild(statusDropdown);

 function updateDropdownColor(dropdown) {
  const selectedValue = dropdown.value;
  dropdown.style.color = selectedValue === 'open' ? 'green' : 'red';
  dropdown.style.backgroundColor = selectedValue === 'open' ? 'rgb(231, 252, 229)' : 'rgb(247, 220, 220)';
}


 
// Function to update ticket status in the backend
async function updateTicketStatus(ticketId, newStatus) {
  const token = localStorage.getItem('authToken');
  try {
    const response = await fetch(`api/tickets/${ticketId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': token
      },
      body: JSON.stringify({ status: newStatus })
    });

    if (!response.ok) {
      throw new Error('Failed to update ticket status');
      
    }

    return await response.json();
  } catch (error) {
    throw new Error('Error updating ticket status');
  }
}

document.getElementById('ticket-footer').innerHTML = `
        TICKET ${ticket.ticket_id} IS UP TO DATE `;

        const ticketId = ticket.id; 


// CHANGE ASSIGNED TO
  if (currentRole === 'admin') { 
   const assignedSelect = document.getElementById("ticket-assigned-select");
   assignedSelect.style.display = "block";
   document.getElementById("ticket-assigned-display").style.display = "none";

  assignedSelect.addEventListener('change', () => {
    updateAssignedTo(ticketId);
   });


  } else {
   document.getElementById("ticket-assigned-display").textContent = ticket.assigned_to || "Unassigned";
  }

  function updateAssignedTo(ticketId) {
    const assignedTo = document.getElementById('ticket-assigned-select').value;
    const token = localStorage.getItem('authToken');
  
    fetch(`/api/tickets/assign/${ticketId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': token
      },
      body: JSON.stringify({ assigned_to: assignedTo })
    })
    .then(response => response.ok ? console.log('Ticket assigned' ) : response.json().then(result => alert(result.msg)))
    .catch(error => console.error('Error updating assigned_to:', error));
  }


 
  modal.style.display = "flex";

  closeButton.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = 'none';
    }
  };


// Load ticket activity
const token = localStorage.getItem('authToken');
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
    console.log('Received responses:', responses); 

    if (!Array.isArray(responses)) {
      throw new TypeError('Expected an array of responses.');
    }

    const ticketActivity = document.querySelector('.ticket-activity');
    ticketActivity.innerHTML = ''; 

    // Format date 
    function formatDate(dateString) {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = String(date.getFullYear()).slice(-2); 
      const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      return `${day}/${month}/${year} ${time}`;
    }
    

    // ticket activity (creation)
    ticketActivity.innerHTML += `
    <div class="activity-item" id="ticket-created">
      <div class="activity-header">
        <span class="activity-label">Ticket Created - </span>
        <span class="activity-date">${formatDate(ticket.created_at)}</span>
      </div>
      <div class="activity-content">${ticket.description}</div>
    </div>`;

    // Add all the responses to the message box
    responses.forEach(response => {
      const sender = response.sender === 'admin' ? '<span style=" color: green; font-size: 17px;">Admin Response</span>' : '<span style="color: #1E90FF; font-size: 17px;">User Message</span>' ;
      const responseClass = response.sender === 'admin' ? 'admin-response' : 'user-response';
      const dateTime = formatDate(response.created_at);
    
      ticketActivity.innerHTML += `
      <div class="activity-item">
        <div class="activity-header ${responseClass}"  > <p>${sender} - <span style="font-size: 11px; color: grey;">${dateTime}</span></p> </div>
        <div class="activity-content">
          <p>${response.response}</p>
        </div>
      </div>
      <p></p>`;
    });

  })
  
  .catch(err => {
    console.error('Failed to fetch responses:', err); 
  });
  
}

}


fetchTickets();


//////////////////////////////////////////////
//////////////// CUSTOMERS ///////////////////
//////////////////////////////////////////////

//REGISTER A NEW CUSTOMER
const customersForm = document.getElementById('customerForm');
const customersTableBody = document.querySelector("#customersTable tbody");

customersForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const phone_number = document.getElementById('phone_number').value;
  const project = document.getElementById('project1').value;
  const country = document.getElementById('country').value;
  const city = document.getElementById('city').value;
  const password = document.getElementById('password').value;
  // const image = document.getElementById('image').value;


  const token = localStorage.getItem('authToken');

  if (!token) {
    alert("No token provided. Please log in.");
    return;
  }

  if (!name || !email || !country || !city || !project || !phone_number || !password) {
    alert("Please fill all the fields.");
    return;
  }

  try {
    const response = await fetch('/api/customers/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': token
      },
      body: JSON.stringify({ name, email, phone_number, project, country, city, password })
    });

    if (response.ok) {
      alert('Customer registered successfully!');
      localStorage.setItem('customerId', result.customer.id);
      document.getElementById("customers-section").style.display = "block";
      document.getElementById("create-customer-section").style.display = "none";
      fetchCustomers(); 
    } else {
      const result = await response.json();
      alert('Customer registration failed: ' + result.msg);
    }
  } catch (error) {
    console.error('Error registering customer:', error);
  }
});


async function fetchCustomers() {
  try {
    const response = await fetch('/api/customers/all', {
      headers: { 'auth-token': localStorage.getItem('authToken') },
    });
    if (!response.ok) throw new Error("Failed to fetch customers");
    
    const customers = await response.json();
    customersTableBody.innerHTML = '';

    customers.forEach(customer => {
      appendCustomerRow(customer);
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
  }
}



// Function to append a single customer row to the table
function appendCustomerRow(customer) {
  const row = document.createElement("tr");

  row.id = `customer-row-${customer.id}`;
  
  row.dataset.customerId = customer.customer_id;

  row.innerHTML = `
    <td>${customer.project}</td>
    <td>${customer.name}</td>
    <td>${customer.email}</td>
    <td>${customer.city}</td>
    <td>${customer.ticket_count}</td>
  `;

  row.addEventListener('click', function () {
    openCustomerModal(customer);
  });

  customersTableBody.appendChild(row);


function openCustomerModal(customer) {
  const closeButton = document.getElementById('close-modal1');
  const modal = document.getElementById("customer-modal");

  console.log(customer);
 
  // Set ticket information
  document.getElementById("customer-id-name").textContent = `#${customer.id} --- ${customer.name}`;
  document.getElementById("customer-email").textContent = customer.email;
  document.getElementById("customer-project").textContent = customer.project;
  document.getElementById("customer-phone").textContent = customer.phone_number;
  document.getElementById("customer-country").textContent = customer.country;
  document.getElementById("customer-city").textContent = customer.city;

  modal.style.display = "flex";
  deleteBtn.dataset.customerId = customer.id;

  closeButton.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = 'none';
    }
  };

  document.getElementById('customer-footer').innerHTML = `
        CUSTOMER ${customer.name} IS UP TO DATE `;


};
}

fetchCustomers();

//////////----DELETE CUSTOMERS----//////////

function addDeleteButtonListener(deleteCustomersBtn) {
  deleteCustomersBtn.addEventListener('click', async () => {
    const customerId = deleteCustomersBtn.dataset.customerId; // Get the customer ID from the dataset

    if (!customerId) {
      alert("Customer ID is missing.");
      return;
    }
 
   const token = localStorage.getItem('authToken');
   if (!token) {
    alert("No token provided. Please log in.");
    return;
   }
 
   const confirmDelete = confirm("Are you sure you want to delete this customer?");
   if (!confirmDelete) return;
 
   try {
    const response = await fetch(`/api/customers/${customerId}`, { // Adjust endpoint if needed
     method: 'DELETE',
     headers: {
      'auth-token': token
     }
    });
 
    if (response.ok) {
     alert('Customer deleted successfully.');
 
     // Close the modal if it's open
     document.getElementById('customer-modal').style.display = 'none';
 
     // Remove the row from the DOM
     const rowToDelete = document.getElementById(`customer-row-${customerId}`);
     if (rowToDelete) {
      rowToDelete.remove();
      console.log(`Row for customer ID ${customerId} removed successfully.`);
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
 
 // ... (your existing code) ...
 




// Initialize delete button listener
const deleteBtn = document.querySelector('#deleteCustomersBtn');
addDeleteButtonListener(deleteBtn);


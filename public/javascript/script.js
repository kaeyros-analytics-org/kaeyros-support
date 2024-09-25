const ticketForm = document.getElementById('ticketForm');
const modal = document.getElementById('myModal');
const closeButton = document.querySelector('.close');

// Function to get token from localStorage
function getToken() {
  return localStorage.getItem('token');
}

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
      fetchTickets(); // Fetch the tickets again to display the new ticket in the table
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
    console.log("Fetched tickets:", tickets);

    const tableBody = document.querySelector(".tickets-table tbody");
    tableBody.innerHTML = ""; // Clear the table before appending new rows

    let openTicketsCount = 0;
    let processedTicketsCount = 0;

    tickets.forEach(ticket => {
      const row = document.createElement("tr");

      const createCell = (text) => {
        const cell = document.createElement("td");
        cell.textContent = text;
        return cell;
      };

      row.appendChild(createCell(ticket.id));
      row.appendChild(createCell(ticket.project));
      row.appendChild(createCell(ticket.subject));
      row.appendChild(createCell(ticket.priority));
      row.appendChild(createCell(ticket.type));
      row.appendChild(createCell(new Date(ticket.created_at).toLocaleDateString()));

      tableBody.appendChild(row);

      // Add a click event to each row to show the modal and populate data
      row.addEventListener('click', function () {
        modal.style.display = 'block';

        const recupIdSubjecDiv = document.querySelector('.recup-id-subjec');
        const boss = document.querySelector('.boss');
        const boss1 = document.querySelector('.boss1');

        // Populate modal with ticket information
        recupIdSubjecDiv.innerHTML = `
          <p><strong style='font-size: 30px;'> ${ticket.id} ${ticket.subject}</strong></p>`;
        boss1.innerHTML = `<p><b>${ticket.type}</b></p>`;
        boss.innerHTML = `<p><b>${ticket.priority}</b></p>`;
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

fetchTickets(); // Initial fetching of tickets

// Modal close functionality
closeButton.addEventListener('click', function () {
  modal.style.display = 'none';
});

// Close the modal when clicking outside the modal content
window.addEventListener('click', function (event) {
  if (event.target === modal) {
    modal.style.display = 'none';
  }
});

//create a new ticket
const form = document.getElementById('ticketForm');

form.addEventListener('submit', async (event) => {
  event.preventDefault(); 

  const project = document.getElementById('project').value;
  const subject = document.getElementById('subject').value;
  const priority = document.getElementById('priority').value;
  const type = document.getElementById('type').value;
  const description = document.getElementById('description').value;


    const response = await fetch('api/tickets/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ project, subject, priority, type, description })
    });

    if (response.ok) {
      alert('Ticket created successfully!');
  } else {
      const result = await response.json();
      alert('Ticket creation failed: ' + result.msg); 
  }
  
});






async function fetchTickets() {
    try {
        const response = await fetch("http://localhost:3000/api/tickets/all");
        
        if (!response.ok) {
            throw new Error('Not ok');
        }

        const tickets = await response.json();
        console.log("Fetched tickets:", tickets);

        const tableBody = document.querySelector(".tickets-table tbody");
        tableBody.innerHTML = "";

        tickets.forEach(ticket => {
            const row = document.createElement("tr");

            const createCell = (text) => {
                const cell = document.createElement("td");
                cell.textContent = text;
                return cell;
            };

            row.appendChild(createCell(ticket.name));
            row.appendChild(createCell(ticket.project));
            row.appendChild(createCell(ticket.subject));
            row.appendChild(createCell(ticket.priority));
            row.appendChild(createCell(ticket.type));
            row.appendChild(createCell(ticket.status));
            row.appendChild(createCell(ticket.created_at));


            tableBody.appendChild(row);

            document.getElementById('ticketCount').textContent = tableBody.rows.length;
        });
    } catch (error) {
        console.error("Error fetching tickets:", error);
        alert("Une erreur s'est produite lors de la récupération des tickets.");
    }
}


fetchTickets();

document.addEventListener('DOMContentLoaded', function() {
    const ticketForm = document.getElementById('ticketForm');
    const tableBody = document.getElementById('prizesTable').getElementsByTagName('tbody')[0];

    // Charger les données à partir du localStorage lors du chargement de la page
    const savedTickets = JSON.parse(localStorage.getItem('tickets')) || [];
    savedTickets.forEach(ticket => {
        addRowToTable(ticket);
    });

    ticketForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Empêche le rechargement de la page

        // Récupérer les valeurs des champs
        const projet = document.getElementById('projet').value;
        const subject = document.getElementById('name-ticket').value;
        const priority = document.querySelector('input[name="priority"]:checked') ? document.querySelector('input[name="priority"]:checked').value : 'None';
        const ticketType = document.getElementById('cars').value;

        // Générer la date actuelle (format : YYYY-MM-DD)
        const today = new Date();
        const date = today.toISOString().slice(0, 10);

        const newTicket = { projet, subject, priority, ticketType, date };

        // Ajouter les informations dans le tableau
        addRowToTable(newTicket);
        
        // Enregistrer le nouveau ticket dans localStorage
        savedTickets.push(newTicket);
        localStorage.setItem('tickets', JSON.stringify(savedTickets));

        // Réinitialiser le formulaire
        this.reset();
    });

    function addRowToTable(ticket) {
        const newRow = tableBody.insertRow();
        newRow.innerHTML = `
            <td>${tableBody.rows.length + 1}</td>
            <td>${ticket.projet}</td>
            <td>${ticket.subject}</td>
            <td>${ticket.priority}</td>
            <td>${ticket.ticketType}</td>
            <td>${ticket.date}</td>
            `
        ;

        // Mettre à jour le nombre de tickets
        document.getElementById('ticketCount').textContent = tableBody.rows.length;
    }
});

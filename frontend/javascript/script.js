let dropdown = document.querySelectorAll('.dropdown');
dropdown.forEach(item => {
  item.addEventListener('click', function(e){
    e.stopPropagation(); // empêche la propagation du clic
    this.querySelector('.dropdown-menu').classList.toggle('show');
  })
});

// Fermer le menu déroulant en cliquant en dehors
document.addEventListener('click', function(e) {
  dropdown.forEach(item => {
    if (!item.contains(e.target)) {
      item.querySelector('.dropdown-menu').classList.remove('show');
    }
  })
});












// main.js
console.log("From JS File")

const API_URL = 'https://gutendex.com/books';
let books = [];
let filteredBooks = [];
let currentPage = 1;
const booksPerPage = 15;

// DOM Elements
const booksContainer = document.getElementById('booksContainer');
const paginationContainer = document.getElementById('pagination1');
const searchBar = document.getElementById('searchBar');
const genreFilter = document.getElementById('genreFilter');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const currentPageSpan = document.getElementById('currentPage');
const spinner = document.getElementById('spinner');

// Fetch books from API
async function fetchBooks(page = 1) {
    try {
        showSpinner();

        const response = await fetch(`${API_URL}?page=${page}`);
        const data = await response.json();

        // Debugging Logs
        console.log("API Response Data:", data);
        console.log("Results from API:", data.results);

        // Check if data.results exists and is an array
        if (!data || !Array.isArray(data.results)) {
            throw new Error("Invalid API response");
        }

        hideSpinner();

        books = data.results;
        filteredBooks = books;
        displayBooks(filteredBooks);
        populateGenres();
        loadPreferences();
        updatePagination(); // Update the pagination control state
    } catch (error) {
        hideSpinner();
        console.log('Error fetching books:', error);
        booksContainer.innerHTML = '<p>Error fetching books. Please try again later.</p>';
    }
}

function displayBooks(books = []) {
    if (!books || books.length === 0) {
        booksContainer.innerHTML = '<p>No books available.</p>';
        return;
    }

    booksContainer.innerHTML = '';  // Clear the container
    paginationContainer.innerHTML = ''; 

        // Calculate pagination based on filteredBooks
        const totalBooks = filteredBooks.length;
        const totalPages = Math.ceil(totalBooks / booksPerPage);
    
        // Ensure currentPage is within bounds
        currentPage = Math.max(1, Math.min(currentPage, totalPages));

    const start = (currentPage - 1) * booksPerPage;
    const end = start + booksPerPage;

    const paginatedBooks = books.slice(start, end);  // Slicing the array safely

    paginatedBooks.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.classList.add('book-card');

        // Wishlist Icon
        const wishlistIcon = document.createElement('span');
        wishlistIcon.classList.add('wishlist-icon');
        wishlistIcon.innerHTML = '&#10084;';
        if (isWishlisted(book.id)) {
            wishlistIcon.classList.add('active');
        }
        wishlistIcon.addEventListener('click', () => toggleWishlist(book, wishlistIcon));

        // Book Cover Image
        const img = document.createElement('img');
        img.src = book.formats['image/jpeg'] || '';
        img.alt = `${book.title} cover`;

        // Book Details
        const details = document.createElement('div');
        details.classList.add('book-details');

        const title = document.createElement('h3');
        title.textContent = book.title;

        const author = document.createElement('p');
        author.textContent = `Author: ${book.authors.map(a => a.name).join(', ')}`;

        const genres = document.createElement('p');
        genres.textContent = `Genres: ${book.subjects.slice(0, 3).join(', ')}`;

        details.appendChild(title);
        details.appendChild(author);
        details.appendChild(genres);

        // Append elements to book card
        bookCard.appendChild(wishlistIcon);
        bookCard.appendChild(img);
        bookCard.appendChild(details);

        // Add link to book detail page
        bookCard.addEventListener('click', (e) => {
            if (!e.target.classList.contains('wishlist-icon')) {
                window.location.href = `book.html?id=${book.id}`;
            }
        });

        booksContainer.appendChild(bookCard);
    });

    updatePagination(totalPages);
}


// Function to show the spinner
function showSpinner() {
    spinner.style.display = 'block';
}

// Function to hide the spinner
function hideSpinner() {
    spinner.style.display = 'none';
}

// Save preferences
function savePreferences(query, genre) {
    localStorage.setItem('searchQuery', query);
    localStorage.setItem('selectedGenre', genre);
}

function loadPreferences() {
    const savedQuery = localStorage.getItem('searchQuery') || '';
    const savedGenre = localStorage.getItem('selectedGenre') || '';
    searchBar.value = savedQuery;
    genreFilter.value = savedGenre;
    
    // Ensure preferences load and call filterBooks
    filterBooks(savedQuery.toLowerCase(), savedGenre);
}


// Populate Genres Dropdown
function populateGenres() {
    const genres = new Set();
    books.forEach(book => {
        book.subjects.forEach(subject => genres.add(subject));
    });

    genres.forEach(genre => {
        const option = document.createElement('option');
        option.value = genre;
        option.textContent = genre;
        genreFilter.appendChild(option);
    });
}

// Search Functionality
searchBar.addEventListener('input', () => {
    const query = searchBar.value.toLowerCase();
    savePreferences(query, genreFilter.value);
    filterBooks(query, genreFilter.value);
});

// Genre Filter Functionality
genreFilter.addEventListener('change', () => {
    const selectedGenre = genreFilter.value;
    savePreferences(searchBar.value.toLowerCase(), selectedGenre);
    filterBooks(searchBar.value.toLowerCase(), selectedGenre);
});


function filterBooks(query, genre) {
    // Filter books based on search query and genre
    filteredBooks = books.filter(book => {
        const matchesTitle = book.title.toLowerCase().includes(query);
        const matchesGenre = genre === '' || book.subjects.includes(genre);
        return matchesTitle && matchesGenre;
    });

    if (!filteredBooks) filteredBooks = []; // Ensure filteredBooks is always an array

    currentPage = 1;
    displayBooks(filteredBooks);  // Pass the filteredBooks array to displayBooks
}


// Wishlist Functions
function getWishlist() {
    const wishlist = localStorage.getItem('wishlist');
    return wishlist ? JSON.parse(wishlist) : [];
}

function isWishlisted(bookId) {
    const wishlist = getWishlist();
    return wishlist.includes(bookId);
}

function toggleWishlist(book, icon) {
    let wishlist = getWishlist();
    if (isWishlisted(book.id)) {
        wishlist = wishlist.filter(id => id !== book.id);
        icon.classList.remove('active');
    } else {
        wishlist.push(book.id);
        icon.classList.add('active');
    }
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

// Pagination Functions
// function updatePagination(totalPages) {
//     currentPageSpan.innerText = currentPage;
//     prevPageBtn.disabled = currentPage === 1;
//     // nextPageBtn.disabled = filteredBooks.length < booksPerPage;
//     nextPageBtn.disabled = books.length < booksPerPage;
//     console.log("from update pagination",books.length, booksPerPage)
// }

// prevPageBtn.addEventListener('click', () => {
//     if (currentPage > 1) {
//         currentPage--;
//         fetchBooks(currentPage);
//         currentPageSpan.innerText = currentPage; 
//         console.log(currentPage)
//     }
// });

// nextPageBtn.addEventListener('click', () => {
//     currentPage++;
//     fetchBooks(currentPage);
//     currentPageSpan.innerText = currentPage;
//     console.log(currentPage)
// });
// Pagination Functions
function updatePagination(totalPages) {
    // currentPageSpan.innerText = `Page ${currentPage} of ${totalPages}`;
    currentPageSpan.innerText = `${currentPage}`;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages; // Disable next button if on the last page
}

prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        displayBooks(filteredBooks); // Show books for the updated page
    }
});

nextPageBtn.addEventListener('click', () => {
    const totalPages = Math.ceil(filteredBooks.length / booksPerPage); // Calculate total pages from filteredBooks
    if (currentPage < totalPages) {
        currentPage++;
        displayBooks(filteredBooks); // Show books for the updated page
    }
});

// Initialize
fetchBooks(currentPage);

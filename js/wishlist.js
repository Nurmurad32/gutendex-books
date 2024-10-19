// wishlist.js

const WISHLIST_API_URL = 'https://gutendex.com/books';
const wishlistContainer = document.getElementById('wishlistContainer');
const spinner = document.getElementById('spinner');

// Function to show the spinner
function showSpinner() {
    spinner.style.display = 'block';
}

// Function to hide the spinner
function hideSpinner() {
    spinner.style.display = 'none';
}

// Fetch wishlisted books
async function fetchWishlistBooks() {
    showSpinner();
    const wishlist = getWishlist();
    if (wishlist.length === 0) {
        hideSpinner();
        wishlistContainer.innerHTML = '<p>Your wishlist is empty.</p>';
        return;
    }

    try {
        const promises = wishlist.map(id => fetch(`${WISHLIST_API_URL}/${id}`).then(res => res.json()));
        const books = await Promise.all(promises);
        hideSpinner();
        displayWishlistBooks(books);
    } catch (error) {
        console.error('Error fetching wishlist books:', error);
        wishlistContainer.innerHTML = '<p>Error fetching wishlist books. Please try again later.</p>';
    }
}

// Display wishlisted books
function displayWishlistBooks(books) {
    wishlistContainer.innerHTML = '';
    books.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.classList.add('book-card');

        // Wishlist Icon
        const wishlistIcon = document.createElement('span');
        wishlistIcon.classList.add('wishlist-icon', 'active');
        wishlistIcon.innerHTML = '&#10084;'; // Heart symbol
        wishlistIcon.addEventListener('click', () => toggleWishlist(book.id, wishlistIcon));

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

        wishlistContainer.appendChild(bookCard);
    });
}

// Wishlist Functions
function getWishlist() {
    const wishlist = localStorage.getItem('wishlist');
    return wishlist ? JSON.parse(wishlist) : [];
}

function toggleWishlist(bookId, icon) {
    let wishlist = getWishlist();
    if (wishlist.includes(bookId)) {
        wishlist = wishlist.filter(id => id !== bookId);
        icon.classList.remove('active');
        // Remove the book card from DOM
        icon.parentElement.remove();
        if (wishlist.length === 0) {
            wishlistContainer.innerHTML = '<p>Your wishlist is empty.</p>';
        }
    }
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

// Initialize
fetchWishlistBooks();

// book.js

const bookDetailsContainer = document.getElementById('bookDetails');

// Get book ID from URL
const urlParams = new URLSearchParams(window.location.search);
const bookId = urlParams.get('id');

if (bookId) {
    fetchBookDetails(bookId);
} else {
    bookDetailsContainer.innerHTML = '<p>Book not found.</p>';
}

// Fetch book details
async function fetchBookDetails(id) {
    try {
        const response = await fetch(`https://gutendex.com/books/${id}`);
        if (!response.ok) throw new Error('Book not found');
        const book = await response.json();
        displayBookDetails(book);
    } catch (error) {
        console.error('Error fetching book details:', error);
        bookDetailsContainer.innerHTML = '<p>Error fetching book details. Please try again later.</p>';
    }
}

// Display book details
function displayBookDetails(book) {
    const detailHTML = `
        <div class="book-detail">
            <img src="${book.formats['image/jpeg'] || ''}" alt="${book.title} cover">
            <div class="detail-info">
                <h2>${book.title}</h2>
                <p><strong>Author:</strong> ${book.authors.map(a => a.name).join(', ')}</p>
                <p><strong>Genres:</strong> ${book.subjects.join(', ')}</p>
                <p><strong>ID:</strong> ${book.id}</p>
                <button id="wishlistBtn" class="${isWishlisted(book.id) ? 'active' : ''}">&#10084; ${isWishlisted(book.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}</button>
            </div>
        </div>
    `;
    bookDetailsContainer.innerHTML = detailHTML;

    // Wishlist Button
    const wishlistBtn = document.getElementById('wishlistBtn');
    wishlistBtn.addEventListener('click', () => {
        toggleWishlist(book.id, wishlistBtn);
    });
}

// Wishlist Functions
function getWishlist() {
    const wishlist = localStorage.getItem('wishlist');
    return wishlist ? JSON.parse(wishlist) : [];
}

function isWishlisted(bookId) {
    const wishlist = getWishlist();
    return wishlist.includes(parseInt(bookId));
}

function toggleWishlist(bookId, button) {
    let wishlist = getWishlist();
    if (wishlist.includes(parseInt(bookId))) {
        wishlist = wishlist.filter(id => id !== parseInt(bookId));
        button.classList.remove('active');
        button.innerHTML = '&#10084; Add to Wishlist';
    } else {
        wishlist.push(parseInt(bookId));
        button.classList.add('active');
        button.innerHTML = '&#10084; Remove from Wishlist';
    }
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

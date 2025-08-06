
// DOM Elements
const recipesContainer = document.getElementById('recipesContainer');
const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');
const recipeDetailContent = document.getElementById('recipeDetailContent');
const backBtn = document.getElementById('backBtn');
const recipeDetailPage = document.getElementById('recipeDetailPage');
const mainPage = document.getElementById('mainPage');
const categoryCards = document.querySelectorAll('.category-card');
const resultsSection = document.getElementById('resultsSection');
const resultsTitle = document.getElementById('resultsTitle');
const welcomeMessage = document.getElementById('welcomeMessage');
const loadingOverlay = document.getElementById('loadingOverlay');
const featuredCategories = document.querySelector('.featured-categories');

// API Configuration
const API_KEY = import.meta.env.VITE_API_KEY;
const BASE_URL = 'https://api.spoonacular.com/recipes';

// State variables
let currentRecipes = [];
let currentCategory = '';

// Initialize the app
function init() {
    setupEventListeners();
    // Start with empty results and show categories
    welcomeMessage.classList.remove('hidden');
    resultsSection.classList.add('hidden');
    featuredCategories.classList.remove('hidden');
}

// Set up event listeners
function setupEventListeners() {
    // Search functionality
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });

    // Trending tags
    document.querySelectorAll('.tag-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            searchInput.value = e.target.dataset.query;
            handleSearch();
        });
    });

    // Category cards
    categoryCards.forEach(card => {
        card.addEventListener('click', (e) => {
            currentCategory = e.currentTarget.dataset.query;
            loadCategoryRecipes(currentCategory);
        });
    });

    // Back button
    backBtn.addEventListener('click', () => {
        recipeDetailPage.classList.add('hidden');
        mainPage.classList.remove('hidden');
        featuredCategories.classList.remove('hidden');
    });
}

// Load recipes for a category
async function loadCategoryRecipes(category) {
    try {
        showLoading(true);
        welcomeMessage.classList.add('hidden');
        resultsSection.classList.remove('hidden');
        featuredCategories.classList.add('hidden');
        resultsTitle.textContent = `${category.charAt(0).toUpperCase() + category.slice(1)} Recipes`;

        const response = await fetch(
            `${BASE_URL}/complexSearch?cuisine=${category}&number=12&apiKey=${API_KEY}`
        );

        if (!response.ok) throw new Error('Failed to fetch recipes');

        const data = await response.json();
        currentRecipes = data.results || [];

        if (currentRecipes.length === 0) {
            showNoResults();
        } else {
            displayRecipes(currentRecipes);
        }
    } catch (error) {
        console.error('Error loading recipes:', error);
        showError(error);
    } finally {
        showLoading(false);
    }
}

// Handle search
async function handleSearch() {
    const query = searchInput.value.trim();
    if (!query) return;

    try {
        showLoading(true);
        welcomeMessage.classList.add('hidden');
        resultsSection.classList.remove('hidden');
        featuredCategories.classList.add('hidden');
        resultsTitle.textContent = `Results for "${query}"`;
        
        const response = await fetch(
            `${BASE_URL}/complexSearch?query=${query}&number=12&apiKey=${API_KEY}`
        );

        if (!response.ok) throw new Error('Search failed');

        const data = await response.json();
        currentRecipes = data.results || [];

        if (currentRecipes.length === 0) {
            showNoResults();
        } else {
            displayRecipes(currentRecipes);
        }
    } catch (error) {
        console.error('Search error:', error);
        showError(error);
    } finally {
        showLoading(false);
    }
}

// Display recipes in grid
function displayRecipes(recipes) {
    recipesContainer.innerHTML = '';
    
    recipes.forEach(recipe => {
        const recipeCard = document.createElement('div');
        recipeCard.className = 'recipe-card';
        recipeCard.innerHTML = `
            <div class="recipe-image" style="background-image: url('${recipe.image}')"></div>
            <div class="recipe-info">
                <h3>${recipe.title}</h3>
                <div class="recipe-meta">
                    <span><i class="fas fa-clock"></i> ${recipe.readyInMinutes || 'N/A'} mins</span>
                    <span><i class="fas fa-utensils"></i> ${recipe.servings || 'N/A'} servings</span>
                </div>
            </div>
        `;
        recipeCard.addEventListener('click', () => showRecipeDetail(recipe.id));
        recipesContainer.appendChild(recipeCard);
    });
}

// Show recipe details
async function showRecipeDetail(recipeId) {
    try {
        showLoading(true);
        mainPage.classList.add('hidden');
        featuredCategories.classList.add('hidden');
        recipeDetailPage.classList.remove('hidden');

        const response = await fetch(
            `${BASE_URL}/${recipeId}/information?includeNutrition=false&apiKey=${API_KEY}`
        );

        if (!response.ok) throw new Error('Failed to load recipe details');

        const recipe = await response.json();

        recipeDetailContent.innerHTML = `
            <div class="recipe-detail">
                <h2>${recipe.title}</h2>
                <div class="recipe-image" style="background-image: url('${recipe.image}')"></div>
                <div class="recipe-meta">
                    <span><i class="fas fa-clock"></i> ${recipe.readyInMinutes || 'N/A'} mins</span>
                    <span><i class="fas fa-utensils"></i> ${recipe.servings || 'N/A'} servings</span>
                    <span><i class="fas fa-heart"></i> ${recipe.aggregateLikes || '0'} likes</span>
                </div>
                <div class="recipe-section">
                    <h3><i class="fas fa-carrot"></i> Ingredients</h3>
                    <ul>
                        ${recipe.extendedIngredients.map(ing => 
                            `<li>${ing.amount} ${ing.unit} ${ing.name}</li>`
                        ).join('')}
                    </ul>
                </div>
                <div class="recipe-section">
                    <h3><i class="fas fa-list-ol"></i> Instructions</h3>
                    <div class="instructions">
                        ${recipe.instructions || 'No instructions available'}
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading recipe details:', error);
        recipeDetailContent.innerHTML = `
            <div class="error-state">
                <h2><i class="fas fa-exclamation-triangle"></i> Error Loading Recipe</h2>
                <p>${error.message || 'Failed to load recipe details'}</p>
            </div>
        `;
    } finally {
        showLoading(false);
    }
}

// Helper functions
function showLoading(show) {
    loadingOverlay.classList.toggle('hidden', !show);
}

function showError(error) {
    recipesContainer.innerHTML = `
        <div class="error-state">
            <h2><i class="fas fa-exclamation-triangle"></i> Error</h2>
            <p>${error.message || 'An error occurred'}</p>
            <button class="retry-btn" onclick="window.location.reload()">
                <i class="fas fa-sync-alt"></i> Try Again
            </button>
        </div>
    `;
}

function showNoResults() {
    recipesContainer.innerHTML = `
        <div class="error-state">
            <h2><i class="fas fa-search"></i> No Recipes Found</h2>
            <p>Try a different search term or category</p>
        </div>
    `;
}

// Initialize the app
document.addEventListener('DOMContentLoaded', init);
<script lang="ts">
  import { getFirestore, collection, query, where, getDocs, doc, deleteDoc, updateDoc, setDoc } from 'firebase/firestore';
  import { firebaseConfig } from "$lib/firebaseConfig";
  import { initializeApp, getApps, getApp } from "firebase/app";
  import { getAuth, onAuthStateChanged } from 'firebase/auth';
  import { onMount } from 'svelte';

  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  const db = getFirestore(app);
  const auth = getAuth(app);

  interface MyStory {
    id?: string;
    title: string;
    author: string;
    genre: string;
    description: string;
    coverImage?: string;
    purchaseUrl?: string;
    createdAt: Date;
    storyBy: string;
    likesCount: number;
    addedToSavelist: boolean;
  }

  let userEmail: string = "";
  let userStories: MyStory[] = [];
  let loading: boolean = true;
  let selectedStory: MyStory | null = null; // Track the story being edited

  onMount(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        userEmail = user.email || "Anonymous";
        await fetchUserStories(userEmail);
      } else {
        userEmail = "Anonymous";
        loading = false;
      }
    });
  });

  async function fetchUserStories(email: string): Promise<void> {
    loading = true;
    try {
      const q = query(collection(db, "storyList"), where("storyBy", "==", email));
      const querySnapshot = await getDocs(q);
      userStories = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as MyStory)
      }));
    } catch (error) {
      console.error("Error fetching user story:", error);
    }
    loading = false;
  }

  async function deleteStory(id: string): Promise<void> {
    try {
      const storyRef = doc(db, "storyList", id);
      await deleteDoc(storyRef);
      userStories = userStories.filter(story => story.id !== id);
    } catch (error) {
      console.error("Error deleting story:", error);
    }
  }

  function openEditModal(story: MyStory): void {
    selectedStory = { ...story }; // Make a copy of the story to be edited
  }

  async function updateStory(story: MyStory): Promise<void> {
    try {
      const storyRef = doc(db, "storyList", story.id!);
      await updateDoc(storyRef, { ...story });

      // Update the story in the userStories array instantly
      userStories = userStories.map(s => s.id === story.id ? { ...s, ...story } : s);

      // Close the modal by setting selectedStory to null
      selectedStory = null;
    } catch (error) {
      console.error("Error updating story:", error);
    }
  }
</script>

<!-- Edit Modal -->
{#if selectedStory}
  <div class="modal-overlay" role="button" tabindex="0" aria-label="Close modal" on:click={() => selectedStory = null} on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') selectedStory = null; }}>
    <div class="modal-content" on:click|stopPropagation>
      <h3>Edit Story</h3>
      
      <label for="title">Title</label>
      <input id="title" bind:value={selectedStory.title} type="text" />

      <label for="description">Description</label>
      <textarea id="description" bind:value={selectedStory.description}></textarea>

      <!-- Add Field for Cover Image URL -->
      <label for="coverImage">Cover Image URL</label>
      <input id="coverImage" bind:value={selectedStory.coverImage} type="text" placeholder="Enter image URL" />

      <div>
        <button class="btn-link" on:click={() => { if (selectedStory) updateStory(selectedStory); }}>Save</button>
        <button class="btn-link" on:click={() => selectedStory = null}>Cancel</button>
      </div>
    </div>
  </div>
{/if}

<!-- The rest of your layout code remains the same -->



<nav class="navbar bg-gray-800 text-white shadow-lg">
  <div class="container mx-auto px-4 flex justify-between items-center py-2">
    <div>
      <a href="/main">
        <img src="/images/logo1.png" alt="Plotify App Logo" class="h-8 sm:h-10 lg:h-12" />
      </a>
    </div>
    <div class="flex space-x-4 items-center">
      <a href="/createStory" class="btn-link">+create</a>
      <a href="/" class="btn-link">Logout</a>
    </div>
  </div>
</nav>

<div class="container mx-auto px-2 sm:px-4 lg:px-8">
  <h2 class="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center">My Stories</h2>

  {#if loading}
    <div class="loading-dots">
      <div class="dots">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
      <p class="please-wait">Please wait...</p>
    </div>
  {:else if userStories.length > 0}
    <div class="grid grid-cols-1 gap-4 sm:gap-6">
      {#each userStories as story}
        <div class="card p-3 sm:p-6">
          <div class="flex flex-row gap-3 sm:gap-6">
            {#if story.coverImage}
              <div class="image-container">
                <img src={story.coverImage} alt="{story.title} cover" class="cover-image" />
              </div>
            {/if}
            <div class="flex flex-col space-y-1 sm:space-y-2 flex-1 min-w-0">
              <h3 class="font-semibold text-lg sm:text-xl truncate">{story.title}</h3>
              <p class="text-sm sm:text-base m-0 line-clamp-3"><strong>Description:</strong> {story.description}</p>

              <!-- Edit and Delete Buttons -->
              <div class="mt-4">
                <button class="btn-link mr-2" on:click={() => openEditModal(story)}>Edit</button>
                <button class="btn-link text-red-600" on:click={() => deleteStory(story.id!)}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <p class="text-center">No stories found.</p>
  {/if}
</div>

<style>
  /* Modal Styles */
  /* Define your brown color palette */
:root {
  --brown-light: #D7B89E;  /* Light Brown */
  --brown-medium: #A57C52; /* Medium Brown */
  --brown-dark: #6F4F34;   /* Dark Brown */
  --brown-accent: #8B5E3C;  /* Accent Brown */
  --white: #ffffff;
}

/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
  border-radius: 8px;
  padding: 20px;
}

.modal-content {
  background-color: var(--white);
  padding: 20px;
  border-radius: 8px;
  width: 100%;
  max-width: 600px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* Modal Header */
.modal-content h3 {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--brown-dark);
  margin-bottom: 16px;
}

/* Form Labels */
label {
  font-size: 1rem;
  font-weight: bold;
  color: var(--brown-medium);
  margin-bottom: 4px;
  display: block;
}

/* Input and Textarea Fields */
input[type="text"],
textarea {
  width: 100%;
  padding: 8px;
  margin-bottom: 16px;
  border: 2px solid var(--brown-light);
  border-radius: 4px;
  background-color: #f5f5f5;
  color: var(--brown-dark);
}

textarea {
  height: 150px;
}

/* Buttons */
button {
  background-color: var(--brown-accent);
  color: var(--white);
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-weight: bold;
  font-size: 1rem;
}

button:hover {
  background-color: var(--brown-dark);
}

button:focus {
  outline: none;
}

/* Cancel Button */
button.btn-link {
  background-color: transparent;
  color: var(--brown-medium);
  border: 2px solid var(--brown-medium);
}

button.btn-link:hover {
  background-color: var(--brown-medium);
  color: var(--white);
}

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-content {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    max-width: 400px;
    width: 100%;
  }

  /* Existing styles for the page */
  .navbar {
    background-color: #c6b2a2;
    color: white;
  }

  .btn-link {
    text-decoration: none;
    color: white;
    font-size: 0.875rem;
    font-weight: 500;
    padding: 0.5rem 0.75rem;
    border-radius: 4px;
    transition: background-color 0.2s;
  }

  .btn-link:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .image-container {
    flex-shrink: 0;
    width: 12rem;
  }

  .cover-image {
    width: 100%;
    height: auto;
    aspect-ratio: 5/3;
    object-fit: cover;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.9);
    border-radius: 4px;
  }

  .card {
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    height: 100%;
  }

  .loading-dots {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    margin: 2rem 0;
  }

  .dots {
    display: flex;
    gap: 8px;
  }

  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: #FF3D00;
    animation: bounce 0.5s ease-in-out infinite;
  }

  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }
</style>

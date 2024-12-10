<script lang="ts">
  import { Toast } from 'flowbite-svelte';
  import { CheckCircleSolid } from 'flowbite-svelte-icons';
  import { getFirestore, collection, addDoc, updateDoc } from 'firebase/firestore';
  import { firebaseConfig } from "$lib/firebaseConfig";
  import { initializeApp, getApps, getApp } from "firebase/app";
  import { getAuth } from 'firebase/auth';
  import { Modal, Input, Label, Button } from 'flowbite-svelte';

  // Firebase initialization
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  const db = getFirestore(app);
  const auth = getAuth(app);

  // Form variables
  let title = "";
  let description = "";
  let coverImage = "";
  let storyBy = "";

  // Modal and Toast visibility
  let formModalOpen = true;
  let showToast = false;

  async function addStory() {
    try {
      const user = auth.currentUser;
      storyBy = user ? user.email || "Unknown" : "Anonymous";

      const newStory = {
        title,
        description,
        coverImage: coverImage || undefined,
        createdAt: new Date(),
        storyBy,
        likesCount: 0,
        addedToSavelist: false,
      };

      // Add document to Firestore
      const docRef = await addDoc(collection(db, "storyList"), newStory);
      await updateDoc(docRef, { storyId: docRef.id });

      clearForm();
      formModalOpen = false;
      showToast = true; // Show Toast
      setTimeout(() => (showToast = false), 3000); // Hide Toast after 3 seconds
    } catch (error) {
      console.error("Error adding story:", error);
      alert("Failed to add story. Please try again.");
    }
  }

  // Clear form function
  function clearForm() {
    title = "";
    description = "";
    coverImage = "";
    storyBy = "";
  }
  
</script>

<main>
  <nav class="navbar bg-gray-800 text-white shadow-lg">
    <div class="container mx-auto px-4 flex justify-between items-center py-2">
      <div>
        <!-- Logo -->
        <a href="/main">
          <img src="/images/logo1.png" alt="Plotify App Logo" class="h-8 sm:h-10 lg:h-12" />
        </a>
            </div>
      <div class="flex space-x-4 items-center">
        <!-- Search Input -->
   
        <!-- Create Link -->
        <!-- My Stories Link -->
        <!-- Logout Link -->
        <a href="/" class="btn-link">Logout</a>
      </div>
    </div>
  </nav>
  <div class="container mx-auto px-2 sm:px-4 lg:px-8 min-h-screen py-4 sm:py-6">
    <div class="max-w-md mx-auto bg-white rounded-lg shadow-lg">
      <div class="p-3 sm:p-6 space-y-3 sm:space-y-4">
        <h3 class="text-lg sm:text-xl font-medium text-[#4e3b31] text-center">Add Story</h3>

        <!-- Form -->
        <form on:submit|preventDefault={addStory} class="space-y-2 sm:space-y-3">
          <div class="space-y-2 sm:space-y-3">
            <Label for="title" class="block text-sm sm:text-base text-[#4e3b31]">Title</Label>
            <Input 
              id="title" 
              type="text" 
              class="form-input w-full text-sm sm:text-base focus:border-[#9b7653]" 
              placeholder="Enter story title" 
              bind:value={title} 
              required 
            />
        
            <Label for="description" class="block text-sm sm:text-base text-[#4e3b31]">Body</Label>
            <textarea 
              id="description" 
              class="form-textarea w-full p-2 sm:p-3 border border-gray-300 rounded-md text-sm sm:text-base focus:border-[#9b7653]" 
              placeholder="Enter your story" 
              bind:value={description} 
              required
            ></textarea>
        
            <Label for="coverImage" class="block text-sm sm:text-base text-[#4e3b31]">Cover Image URL</Label>
            <Input 
              id="coverImage" 
              type="text" 
              class="form-input w-full text-sm sm:text-base focus:border-[#9b7653]" 
              placeholder="Enter cover image URL" 
              bind:value={coverImage} 
            />
        
            <div class="pt-2">
              <Button type="submit" class="w-full sm:w-auto bg-[#9b7653] text-white rounded transition hover:bg-[#a67c5c] hover:opacity-90">
                Submit
              </Button>
            </div>
          </div>
        </form>
        
      </div>
    </div>
  </div>

  {#if showToast}
    <div class="fixed bottom-4 right-4 z-50">
      <Toast color="green" class="w-auto">
        <svelte:fragment slot="icon">
          <CheckCircleSolid class="w-5 h-5" />
          <span class="sr-only">Check icon</span>
        </svelte:fragment>
        Story added successfully.
      </Toast>
    </div>
  {/if}
</main>

<style>
   :root {
    --brown-light: #c6b2a2;
    --brown-medium: #a67c5c;
    --brown-dark: #855c3b;
    --brown-darker: #6d462a;
    --brown-base: #9b7653;
  }
 
  .text-white {
    color: white;
  }

  .navbar {
    background-color: #c6b2a2; /* Tailwind's bg-gray-800 */
    color: white;
  }

  .btn-link {
    text-decoration: none;
    color: white;
    font-size: 0.875rem; /* sm:text-sm */
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

  .form-textarea {
      resize: vertical;
    min-height: 100px;
    padding: 0.5rem 0.75rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.375rem;
    transition: border-color 0.2s ease-in-out;
    @media (min-width: 640px) {
      min-height: 120px;
    }
  }
  .form-textarea:focus {
    outline: none;
    border-color: #6d462a;
  }

  .form-textarea {
    width: 100%;
    padding: 0.5rem 1rem;
    border: 1px solid var(--brown-medium);
    border-radius: 8px;
    transition: border-color 0.2s;
  }

  .form-textarea:focus {
    border-color: var(--brown-dark);
    outline: none;
  }

  .form-textarea {
    resize: vertical;
    min-height: 120px;
  }

</style>

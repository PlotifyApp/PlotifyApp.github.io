<script lang="ts">
  import { getFirestore, collection, addDoc } from 'firebase/firestore';
  import { firebaseConfig } from "$lib/firebaseConfig";
  import { initializeApp, getApps, getApp } from "firebase/app";
  import { createUserWithEmailAndPassword } from 'firebase/auth';
  import { getAuth } from 'firebase/auth';
  import { Button, Label, Input } from 'flowbite-svelte';
  import { EnvelopeSolid, LockSolid, UserSolid } from 'flowbite-svelte-icons';

  // Firebase initialization
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  const db = getFirestore(app);
  const auth = getAuth(app);

  let email = "";
  let password = "";
  let confirmPassword = "";
  let errorMessage = "";
  let successMessage = "";
  let isLoading = false; // Add isLoading variable

  // Validation function
  function isEmailValid(email: string) {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
  }

  async function registerUser() {
    if (!isEmailValid(email)) {
      errorMessage = "Please enter a valid email address.";
      return;
    }

    if (password !== confirmPassword) {
      errorMessage = "Passwords do not match!";
      return;
    }

    // Firebase authentication logic
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Add user to Firestore (including username)
      await addDoc(collection(db, "users"), {
        email,
        createdAt: new Date(),
        uid: user.uid,
      });

      // Clear the form and provide feedback
      email = "";
      password = "";
      confirmPassword = "";
      errorMessage = "";
      successMessage = "Plotify Account Created!";
    } catch (error: unknown) {
      console.error("Error during registration:", error);

      if (error instanceof Error) {
        if (error.message.includes('email-already-in-use')) {
          errorMessage = "This email is already in use. Please use a different email.";
        } else if (error.message.includes('weak-password')) {
          errorMessage = "Password is too weak. Please use a stronger password.";
        } else {
          errorMessage = error.message;
        }
      } else {
        errorMessage = "An unknown error occurred.";
      }
    }
  }
</script>

<main class="min-h-screen flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8 relative">
  <div class="absolute inset-0 area">
    <ul class="circles">
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
    </ul>
  </div>
  
  <div class="max-w-md w-full space-y-4 bg-white rounded-xl shadow-lg p-6 sm:p-8 z-10">
    <!-- Logo/Brand section -->
    <div class="text-center space-y-1">
      <img 
        class="h-20 w-auto mx-auto" 
        src="images/logo1.png" 
        alt="Logo" 
      />
      <h2 class="text-2xl sm:text-3xl font-bold text-brown-800">Join Plotify</h2>
      <p class="text-sm text-brown-600">Start sharing your stories today!</p>
    </div>

    <form on:submit|preventDefault={registerUser} class="space-y-4">
      <!-- Email Input -->
      <div class="space-y-1">
        <Label class="block text-sm font-medium text-brown-700" for="email">
          Email Address
        </Label>
        <div class="relative">
          <EnvelopeSolid class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brown-400" />
          <Input
            id="email"
            type="email"
            bind:value={email}
            class="pl-10 border-brown-300 focus:border-brown-600 focus:ring-brown-600"
            placeholder="name@example.com"
            required
          />
        </div>
      </div>

      <!-- Password Input -->
      <div class="space-y-1">
        <Label class="block text-sm font-medium text-brown-700" for="password">
          Password
        </Label>
        <div class="relative">
          <LockSolid class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brown-400" />
          <Input
            id="password"
            type="password"
            bind:value={password}
            class="pl-10 border-brown-300 focus:border-brown-600 focus:ring-brown-600"
            placeholder="••••••••"
            required
          />
        </div>
      </div>

      <!-- Confirm Password Input -->
      <div class="space-y-1">
        <Label class="block text-sm font-medium text-brown-700" for="confirmPassword">
          Confirm Password
        </Label>
        <div class="relative">
          <LockSolid class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brown-400" />
          <Input
            id="confirmPassword"
            type="password"
            bind:value={confirmPassword}
            class="pl-10 border-brown-300 focus:border-brown-600 focus:ring-brown-600"
            placeholder="••••••••"
            required
          />
        </div>
      </div>

      <!-- Error/Success Messages -->
      {#if errorMessage}
  <div class="bg-brown-light border-l-4 border-brown-base p-4">
    <p class="text-brown-dark text-sm">{errorMessage}</p>
  </div>
{/if}

{#if successMessage}
  <div class="bg-brown-light border-l-4 border-brown-base p-4">
    <p class="text-brown-dark text-sm">{successMessage}</p>
  </div>
{/if}


      <!-- Register Button -->
      <Button
        type="submit"
        class="w-full bg-brown-base text-white hover:bg-brown-darker"
        disabled={isLoading}
      >
      {#if isLoading}
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p class="please-wait">Creating Plotify Account...</p>
      </div>
        {:else}
          Create Account
        {/if}
      </Button>

      <!-- Login Link -->
      <div class="text-center pt-2">
        <span class="text-sm text-gray-600">Already have an account?</span>
        <a href="/login" class="ml-1 text-sm font-medium text-yellow-600 hover:text-yellow-500">
          Sign in
        </a>
      </div>
    </form>
  </div>
</main>

<style>
  
  
  /* CSS for the brown circular spinner */
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
}

.spinner {
  border: 8px solid #f3f3f3; /* Light grey background color */
  border-top: 8px solid #855c3b; /* Dark brown color for the spinner */
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.please-wait {
  margin-top: 10px;
  color: #855c3b; /* Dark brown color */
  font-size: 16px;
}

  :root {
    --brown-light: #f3e8e0; /* Very light brown */
    --brown-base: #c6b2a2; /* Base brown */
    --brown-medium: #a58d7a; /* Medium brown */
    --brown-dark: #7c5f4c; /* Dark brown */
    --brown-darker: #5b4234; /* Darker brown */
  }

  body, html {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    font-family: 'Poppins', sans-serif;
    overflow: hidden;
    background: var(--brown-light);
  }

  .area {
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 1;
    overflow: hidden;
  }

  .circles {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: space-around;
    align-items: center;
    z-index: 1;
    list-style: none;
    padding: 0;
    margin: 0;
    pointer-events: none;
  }

  .circles li {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    background: radial-gradient(circle, var(--brown-medium), var(--brown-darker));
    animation: move 25s linear infinite;
    opacity: 0.8;
    filter: blur(8px);
  }

  .circles li:nth-child(1) { width: 80px; height: 80px; animation-duration: 15s; }
  .circles li:nth-child(2) { width: 120px; height: 120px; animation-duration: 25s; }
  .circles li:nth-child(3) { width: 100px; height: 100px; animation-duration: 20s; }
  .circles li:nth-child(4) { width: 90px; height: 90px; animation-duration: 15s; }
  .circles li:nth-child(5) { width: 110px; height: 110px; animation-duration: 30s; }
  .circles li:nth-child(6) { width: 130px; height: 130px; animation-duration: 20s; }
  .circles li:nth-child(7) { width: 70px; height: 70px; animation-duration: 10s; }
  .circles li:nth-child(8) { width: 80px; height: 80px; animation-duration: 25s; }
  .circles li:nth-child(9) { width: 150px; height: 150px; animation-duration: 40s; }
  .circles li:nth-child(10) { width: 60px; height: 60px; animation-duration: 35s; }

  @keyframes move {
    0% { transform: translateY(0) rotate(0deg); }
    100% { transform: translateY(-1000px) rotate(360deg); }
  }

  .text-brown-800 {
    color: #4e3629;
  }

  .text-brown-600 {
    color: #7c5c3e;
  }

  .text-brown-700 {
    color: #5c3e28;
  }
  
  :global(input:focus) {
    border-color: var(--brown-dark);
    box-shadow: 0 0 0 1px var(--brown-dark);
  }

  :global(button:hover) {
    opacity: 0.9;
  }
</style>

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
      successMessage = "User registered successfully!";
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

<main class="min-h-screen flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-4 bg-brown-100 rounded-xl shadow-lg p-6 sm:p-8">
    <!-- Logo/Brand section -->
    <div class="text-center space-y-1">
      <img 
        class="h-14 w-auto mx-auto" 
        src="images/logo1.png" 
        alt="Logo" 
      />
      <h2 class="text-2xl sm:text-3xl font-bold text-brown-800">Create Account</h2>
      <p class="text-sm text-brown-600">Please fill in the details below</p>
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
            class="pl-10"
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
            class="pl-10"
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
            class="pl-10"
            placeholder="••••••••"
            required
          />
        </div>
      </div>

      <!-- Error/Success Messages -->
      {#if errorMessage}
        <div class="bg-brown-50 border-l-4 border-brown-500 p-4">
          <p class="text-brown-700 text-sm">{errorMessage}</p>
        </div>
      {/if}

      {#if successMessage}
        <div class="bg-brown-50 border-l-4 border-brown-500 p-4">
          <p class="text-brown-700 text-sm">{successMessage}</p>
        </div>
      {/if}

      <!-- Register Button -->
      <Button
  type="submit"
  class="w-full bg-brown-base text-white hover:bg-brown-darker"
  disabled={isLoading}
>
  {#if isLoading}
    <div class="flex items-center justify-center">
      <div class="animate-spin h-5 w-5 mr-3 border-2 border-white border-t-transparent rounded-full"></div>
      Signing in...
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
  :global(body) {
    background-color: #f5f3f0; /* A soft light brown */
  }

  /* Optional: Style the input focus states */
  :global(input:focus) {
    border-color: #6a4e23; /* Dark brown */
    box-shadow: 0 0 0 1px #6a4e23;
  }

  /* Button Hover state */
  :global(button:hover) {
    opacity: 0.9;
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
</style>

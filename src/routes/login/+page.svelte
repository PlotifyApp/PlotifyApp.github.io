<script lang="ts">
  import { Button, Label, Input, Checkbox } from 'flowbite-svelte';
  import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
  import { firebaseConfig } from "$lib/firebaseConfig";
  import { initializeApp, getApps, getApp } from "firebase/app";
  import { goto } from '$app/navigation';
  import { EnvelopeSolid, LockSolid } from 'flowbite-svelte-icons'; // Import icons

  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  const auth = getAuth(app);

  let email = "";
  let password = "";
  let errorMessage = "";
  let isLoading = false; // Add loading state
  let rememberMe = false; // Add remember me state

  async function loginUser() {
    isLoading = true;
    errorMessage = ""; // Clear previous errors
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (rememberMe) {
        // Implement remember me functionality
        localStorage.setItem('userEmail', email);
      }
      goto('/main');
    } catch (error: any) {
      // More user-friendly error messages
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = "Please enter a valid email address.";
          break;
        case 'auth/user-disabled':
          errorMessage = "This account has been disabled.";
          break;
        case 'auth/user-not-found':
          errorMessage = "No account found with this email.";
          break;
        case 'auth/wrong-password':
          errorMessage = "Incorrect password.";
          break;
        default:
          errorMessage = "Failed to login. Please try again.";
      }
    } finally {
      isLoading = false;
    }
  }
</script>

<main class="min-h-screen flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-4 bg-white rounded-xl shadow-lg p-6 sm:p-8">
    <!-- Fixed Logo/Brand section -->
    <div class="text-center space-y-1">
      <img 
        class="h-20 w-auto mx-auto" 
        src="images/logo1.png" 
        alt="Logo" 
      />
      <h2 class="text-2xl sm:text-3xl font-bold text-brown-800">Welcome Back</h2>
      <p class="text-sm text-brown-600">Please sign in to continue</p>
    </div>

    <form on:submit|preventDefault={loginUser} class="space-y-4">
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

      <!-- Error Message -->
      {#if errorMessage}
        <div class="bg-red-50 border-l-4 border-red-500 p-4">
          <p class="text-red-700 text-sm">{errorMessage}</p>
        </div>
      {/if}

      <!-- Remember Me & Forgot Password -->
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <Checkbox bind:checked={rememberMe} id="remember-me">
            <span class="text-sm text-brown-700">Remember me</span>
          </Checkbox>
        </div>
      </div>

      <!-- Login Button -->
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
        Sign in
      {/if}
    </Button>
    


      <!-- Register Link -->
      <div class="text-center pt-2">
        <span class="text-sm text-gray-600">Don't have an account?</span>
        <a href="/register" class="ml-1 text-sm font-medium text-yellow-600 hover:text-yellow-500">
          Create one now
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

  .bg-brown-700 {
    background-color: #4e3629;
  }

  .bg-brown-800 {
    background-color: #3b271d;
  }

  .border-brown-300 {
    border-color: #d5b59a;
  }

  .focus\:border-brown-600 {
    border-color: #6a4e23;
  }

  .focus\:ring-brown-600 {
    box-shadow: 0 0 0 1px #6a4e23;
  }

  .text-brown-400 {
    color: #a88b6f;
  }
</style>

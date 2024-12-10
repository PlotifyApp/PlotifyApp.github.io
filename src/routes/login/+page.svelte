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

    <!-- Fixed Logo/Brand section -->
    <div class="text-center space-y-1">
      <img 
        class="h-20 w-auto mx-auto" 
        src="images/logo1.png" 
        alt="Logo" 
      />
      <h2 class="text-2xl sm:text-3xl font-bold text-brown-800">Log In</h2> <!-- Applying brown-800 -->
      <p class="text-sm text-brown-600">Continue sharing your stories!</p> <!-- Applying brown-600 -->
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

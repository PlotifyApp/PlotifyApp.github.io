<script lang="ts">
	import '../app.css';
	import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
	import { firebaseConfig } from "$lib/firebaseConfig";
	import { initializeApp, getApps, getApp } from "firebase/app";
	import { onMount } from 'svelte';
	
	// Firebase initialization
	const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
	const auth = getAuth(app);
	
	let isAuthenticated = false;
	let showLoginMessage = false; 
	
	// Check authentication state
	onMount(() => {
	  onAuthStateChanged(auth, (user) => {
	    if (user) {
	      isAuthenticated = true;
	    } else {
	      isAuthenticated = false;
	    }
	  });
	});
</script>
  <main class="min-h-screen">


  
	<!-- Login Message -->
	{#if showLoginMessage}
	  <div class="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
		<p>Please log in to access this section.</p>
	  </div>
	{/if}
  
	
	<slot />
  </main>
  
  
  <style>

	
	:global(body) {
	  background-color: #faf1e8;
	}
	

	/* Tooltip for mobile */
	@media (max-width: 639px) {
		
	}
</style>

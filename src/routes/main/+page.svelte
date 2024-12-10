<script lang="ts">
  import { onMount } from 'svelte';
  import { getFirestore, collection, query, getDocs, orderBy, updateDoc, doc, arrayUnion, arrayRemove, increment, getDoc, Timestamp } from 'firebase/firestore';
  import { firebaseConfig } from "$lib/firebaseConfig";
  import { initializeApp, getApps, getApp } from "firebase/app";
  import { getAuth, onAuthStateChanged } from "firebase/auth";
  import { HeartSolid, CirclePlusSolid, CheckCircleSolid } from 'flowbite-svelte-icons';
  import { Modal } from 'flowbite-svelte';
  import dayjs from 'dayjs';
  import 'dayjs/locale/en'; 

  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  const db = getFirestore(app);
  const auth = getAuth(app);

  interface Story {
    id: string;
    title: string;
    author: string;
    genre: string;
    description: string;
    coverImage?: string;
    purchaseUrl?: string;
    createdAt: Date;
    storyBy: string;
    upvotesCount: number;
    downvotesCount: number;
    upvotedBy: (string | null)[]; 
    downvotedBy: (string | null)[];
    comments: Comment[];
  }

  interface Comment {
    id: string;
    commenter: string;
    text: string;
    createdAt: Timestamp;
    showActions?: boolean;  // Add this to manage button visibility
  }

  let stories: Story[] = [];
  let currentUserEmail: string | null = null;
  let isLoading = true;
  let isModalOpen = false;
  let modalMessage = '';
  let searchQuery = '';
  let filteredStories = stories;
  let newCommentText = ''; 
  let editingCommentId: string | null = null;  // Track which comment is being edited
  let commentText: string = ''; // Hold the text of the comment being edited
  let showComments = false; // Tracks visibility of comments


  function showAlert(message: string): void {
    modalMessage = message;
    isModalOpen = true;
    setTimeout(() => {
      isModalOpen = false;
    }, 3000);
  }
  function toggleCommentActions(comment: Comment) {
  comment.showActions = !comment.showActions;
}
onMount(async () => {
  updateCurrentUserEmail();
  await fetchStories();
  isLoading = false;
});


  function updateCurrentUserEmail() {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        currentUserEmail = user.email;
      } else {
        currentUserEmail = null;
      }
    });
  }

  async function addComment(storyId: string, commentText: string) {
    if (!currentUserEmail) {
      showAlert("Please log in to comment!");
      return;
    }

    if (!commentText.trim()) {
      showAlert("Comment cannot be empty!");
      return;
    }

    try {
      const storyRef = doc(db, "storyList", storyId);
      const newComment: Comment = {
        id: `${storyId}_comment_${new Date().getTime()}`,
        commenter: currentUserEmail,
        text: commentText,
        createdAt: Timestamp.fromDate(new Date()), // Firestore Timestamp
      };

      // Add comment to Firestore
      await updateDoc(storyRef, {
        comments: arrayUnion(newComment),
      });

      // Update the local state to reflect the new comment
      stories = [
        ...stories.map((story) =>
          story.id === storyId
            ? { ...story, comments: [...(story.comments || []), newComment] }
            : story
        ),
      ];

      showAlert("Comment added successfully!");
    } catch (error) {
      console.error("Error adding comment:", error);
      showAlert("Failed to add comment. Please try again later.");
    }
  }

  async function editComment(storyId: string, commentId: string, newText: string) {
  if (!currentUserEmail) {
    showAlert("Please log in to edit your comment!");
    return;
  }

  try {
    const storyRef = doc(db, "storyList", storyId);

    // Update the comment in Firestore
    const storyDoc = await getDoc(storyRef);
    const storyData = storyDoc.data();
    if (storyData) {
      const updatedComments = storyData.comments.map((comment: Comment) =>
        comment.id === commentId ? { ...comment, text: newText } : comment
      );

      await updateDoc(storyRef, {
        comments: updatedComments,
      });

      // Update the local state to reflect the edited comment
      stories = stories.map((story) =>
        story.id === storyId
          ? { ...story, comments: updatedComments }
          : story
      );

      showAlert("Comment updated successfully!");

      // Reset the editing state
      editingCommentId = null; // Close the textarea
      commentText = ""; // Clear the comment text
    }
  } catch (error) {
    console.error("Error updating comment:", error);
    showAlert("Failed to update comment. Please try again later.");
  }
}

async function deleteComment(storyId: string, commentId: string) {
  if (!currentUserEmail) {
    showAlert("Please log in to delete your comment!");
    return;
  }

  try {
    const storyRef = doc(db, "storyList", storyId);

    // Remove the comment from Firestore
    const storyDoc = await getDoc(storyRef);
    const storyData = storyDoc.data();
    if (storyData) {
      const filteredComments = storyData.comments.filter(
        (comment: Comment) => comment.id !== commentId
      );

      await updateDoc(storyRef, {
        comments: filteredComments,
      });

      // Update the local state to reflect the deleted comment
      stories = stories.map((story) =>
        story.id === storyId
          ? { ...story, comments: filteredComments }
          : story
      );

      showAlert("Comment deleted successfully!");
    }
  } catch (error) {
    console.error("Error deleting comment:", error);
    showAlert("Failed to delete comment. Please try again later.");
  }
}

async function fetchStories() {
    try {
      const q = query(collection(db, "storyList"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      const savelistDocSnap = currentUserEmail
        ? await getDoc(doc(db, "userSavelists", currentUserEmail))
        : null;
      const userSavelist = savelistDocSnap?.exists() ? savelistDocSnap.data().plotIds || [] : [];

      stories = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || "Untitled",
          author: data.author || "Unknown Author",
          genre: data.genre || "Unknown Genre",
          description: data.description || "No description provided",
          coverImage: data.coverImage || "",
          purchaseUrl: data.purchaseUrl || "",
          createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
          storyBy: data.storyBy || "Unknown",
          upvotesCount: data.upvotesCount || 0,
          downvotesCount: data.downvotesCount || 0,
          upvotedBy: data.upvotedBy || [],
          downvotedBy: data.downvotedBy || [],
          addedToSavelist: userSavelist.includes(doc.id),
          content: data.content || "No content available",
          comments: data.comments || []
        } as Story;
      });

      filteredStories = [...stories];
    } catch (error) {
      console.error("Error fetching stories:", error);
      showAlert("Failed to fetch stories. Please try again later.");
    }
  }

  function searchStories() {
  const searchTerm = searchQuery.toLowerCase().trim();
  console.log("Search term:", searchTerm); // Log the search term

  // Filter stories based on the search query
  filteredStories = stories.filter((rec) => {
    return (
      rec.title.toLowerCase().includes(searchTerm) ||
      rec.author.toLowerCase().includes(searchTerm) ||
      rec.description.toLowerCase().includes(searchTerm) ||
      rec.genre.toLowerCase().includes(searchTerm)
    );
  });

  console.log("Filtered stories:", filteredStories); // Log filtered stories
}




  async function toggleVote(plotId: string, voteType: 'upvote' | 'downvote') {
    if (!currentUserEmail) {
      showAlert("Please log in first!");
      return;
    }

    const plotRef = doc(db, "storyList", plotId);

    try {
      const plotSnap = await getDoc(plotRef);
      const storyData = plotSnap.data();

      if (!storyData) return;

      const currentUpvotedBy = storyData.upvotedBy || [];
      const currentDownvotedBy = storyData.downvotedBy || [];

      let updatedUpvotedBy = [...currentUpvotedBy];
      let updatedDownvotedBy = [...currentDownvotedBy];
      let upvotesChange = 0;
      let downvotesChange = 0;

      if (voteType === 'upvote') {
        if (currentUpvotedBy.includes(currentUserEmail)) {
          updatedUpvotedBy = updatedUpvotedBy.filter(email => email !== currentUserEmail);
          upvotesChange = -1;
        } else {
          updatedUpvotedBy.push(currentUserEmail);
          upvotesChange = 1;

          if (currentDownvotedBy.includes(currentUserEmail)) {
            updatedDownvotedBy = updatedDownvotedBy.filter(email => email !== currentUserEmail);
            downvotesChange = -1;
          }
        }
      } else if (voteType === 'downvote') {
        if (currentDownvotedBy.includes(currentUserEmail)) {
          updatedDownvotedBy = updatedDownvotedBy.filter(email => email !== currentUserEmail);
          downvotesChange = -1;
        } else {
          updatedDownvotedBy.push(currentUserEmail);
          downvotesChange = 1;

          if (currentUpvotedBy.includes(currentUserEmail)) {
            updatedUpvotedBy = updatedUpvotedBy.filter(email => email !== currentUserEmail);
            upvotesChange = -1;
          }
        }
      }

      await updateDoc(plotRef, {
        upvotedBy: updatedUpvotedBy,
        downvotedBy: updatedDownvotedBy,
        upvotesCount: increment(upvotesChange),
        downvotesCount: increment(downvotesChange),
      });

      stories = stories.map((rec) =>
        rec.id === plotId
          ? {
              ...rec,
              upvotedBy: updatedUpvotedBy,
              downvotedBy: updatedDownvotedBy,
              upvotesCount: Math.max(0, rec.upvotesCount + upvotesChange),
              downvotesCount: Math.max(0, rec.downvotesCount + downvotesChange),
            }
          : rec
      );
    } catch (error) {
      console.error("Error toggling vote:", error);
      showAlert("Failed to update votes. Please try again later.");
    }
  }
</script>



<nav class="navbar bg-gray-800 text-white shadow-lg">
  <div class="container mx-auto px-4 flex justify-between items-center py-2">
    <div>
      <!-- Logo -->
      <img src="/images/logo1.png" alt="Plotify App Logo" class="h-8 sm:h-10 lg:h-12" />
    </div>
    <div class="flex space-x-4 items-center">
      <!-- Search Input -->
      <input
        type="text"
        placeholder="Search stories"
        class="p-2 rounded-md text-black"
        bind:value={searchQuery}
        on:input={searchStories}
      />
      
      <!-- Create Link -->
      <a href="/createStory" class="btn-link">+create</a>
      <!-- My Stories Link -->
      <a href="/myStories" class="btn-link">My Stories</a> <!-- New link to My Stories -->
      <!-- Logout Link -->
      <a href="/" class="btn-link">Logout</a>
    </div>
  </div>
</nav>

<style>
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

  .image-container {
    flex-shrink: 0;
    width: 70%;
  }

  .cover-image {
    width: 70%;
    height: auto;
    aspect-ratio: 4/2;

    object-fit: cover;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.9);
    border-radius: 4px;
  }

  .card {
    background-color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding-top: 12px;
    padding-bottom: 12px;
    border-radius: 12px;
  }

  .btn {
  background-color: transparent;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  transition: background-color 0.2s;
}

.btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}
:root {
  --brown-light: #f3e8e0; /* Very light brown */
  --brown-base: #c6b2a2; /* Base brown (your given color) */
  --brown-medium: #a58d7a; /* Medium brown */
  --brown-dark: #7c5f4c; /* Dark brown */
  --brown-darker: #5b4234; /* Darker brown */
}

.comments {
  margin-top: 1rem;
  padding: 0.7rem;
  background-color: white; /* Light brown background for the comments section */
  border: 1px solid var(--brown-base); /* Base brown border for separation */
  border-radius: 0.5rem; /* Rounded corners */
}

.comment {
  margin-bottom: 1rem; /* Space between comments */
  padding: 0.5rem;
  background-color: var(--brown-light);/* White background for each comment for contrast */
  border: 1px solid var(--brown-base); /* Base brown border for each comment */
  border-radius: 0.5rem; /* Rounded corners */
}

.comment p {
  margin: 0.25rem 0;
  font-size: 0.875rem; /* Slightly smaller text */
  color: rgb(88, 72, 53); /* Dark brown text */
}
.comment h6 {
  margin: 0.25rem 0;
  font-weight: 500;
  font-size: 0.94rem; /* Slightly smaller text */
  color: rgb(71, 60, 45); /* Dark brown text */
}
.comment .timestamp {
  font-size: 0.75rem;
  color: var(--brown-medium); /* Medium brown for timestamps */
}

.comment button {
  margin-right: 0.5rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
}

.comment button.text-blue-500 {
  color: var(--brown-darker); /* Darker brown for edit */
  background-color: transparent;
}

.comment button.text-blue-500:hover {
  background-color: var(--brown-light); /* Light brown on hover */
}

.comment button.text-red-500 {
  color: var(--brown-dark); /* Dark brown for delete */
  background-color: transparent;
}

.comment button.text-red-500:hover {
  background-color: var(--brown-medium); /* Medium brown on hover */
}

textarea {
  width: 100%;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  padding: 0.5rem;
  border: 2px solid var(--brown-base); /* Base brown border */
  border-radius: 0.375rem; /* Rounded corners */
}

textarea:focus {
  outline: none;
  border-color: var(--brown-dark); /* Dark brown focus border */
  box-shadow: 0 0 0 3px rgba(124, 95, 76, 0.3); /* Dark brown shadow */
}

button {
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
  margin-top: 0.5rem;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
}

button:hover {
  opacity: 0.9; /* Slight fade on hover for all buttons */
}

button.bg-blue-500 {
  background-color: var(--brown-medium); /* Medium brown for submit */
}

button.bg-blue-500:hover {
  background-color: var(--brown-dark); /* Darker brown on hover */
}

button.bg-green-500 {
  background-color: var(--brown-base); /* Base brown for save */
}

button.bg-green-500:hover {
  background-color: var(--brown-medium); /* Medium brown on hover */
}

button.bg-red-500 {
  background-color: var(--brown-darker); /* Darker brown for cancel */
}

button.bg-red-500:hover {
  background-color: var(--brown-dark); /* Darker brown on hover */
}



  @media (min-width: 640px) {
    .image-container {
      width: 100%;
    }

    .card {
      padding: 16px;
    }
  }

  @media (min-width: 1024px) {
    .image-container {
      width: 100%;
    }
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

  .dot:nth-child(2) {
    animation-delay: 0.1s;
    background-color: #FF6B00;
  }

  .dot:nth-child(3) {
    animation-delay: 0.2s;
    background-color: #FF9100;
  }
  
/* General styling for the story text */
.story-text {
  font-size: .9rem; /* Larger text (equivalent to 20px) */
  color: #7b4f24; /* Brown color */
  margin: 0;
  word-wrap: break-word;
}



  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  .please-wait {
    color: #666;
    font-size: 0.9rem;
    font-weight: 500;
  }
  .justify-text {
  text-align: justify;
}

</style>
{#if isLoading}
  <div class="loading-dots">
    <div class="dots">
      <div class="dot"></div>
      <div class="dot"></div>
      <div class="dot"></div>
    </div>
    <p class="please-wait">Please wait...</p>
  </div>
{:else}
  <div class="container mx-auto px-1 sm:px-4 lg:px-8 py-4 sm:py-6">
    <div class="flex flex-col space-y-4 sm:space-y-6">
      <!-- Replace this part with filteredStories instead of stories -->
      {#each filteredStories as story}
      <div class="card px-2 sm:px-4">
        <div class="flex flex-col h-full">
          <!-- Text Content Section -->
          <div class="flex flex-col space-y-1 sm:space-y-2 flex-1 min-w-0">
            <p class="story-text">Story by {story.storyBy}</p>
            <h3 class="story-text"><strong>{story.title}</strong></h3>
            <p class="story-text justify-text">{story.description}</p>
          </div>
      
          <!-- Image Section Below Text -->
          {#if story.coverImage}
          <div class="image-container mt-4"> <!-- Add margin to separate from text -->
            <img 
              src={story.coverImage} 
              alt="{story.title} cover" 
              class="cover-image w-full h-auto object-cover" 
            />
          </div>
          {/if}
 
          <!-- Buttons Section -->
          <div class="mt-3 sm:mt-4 flex justify-start items-center space-x-3 sm:space-x-4 pt-2 border-t">
            <!-- Upvote Button -->
            <button
              class="btn flex items-center space-x-1"
              on:click={() => toggleVote(story.id, 'upvote')}
            >
              <img src="/images/upvote.png" alt="Upvote" class="w-5 h-5" />
              <span>{story.upvotesCount}</span>
            </button>

            <!-- Downvote Button -->
            <button
              class="btn flex items-center space-x-1"
              on:click={() => toggleVote(story.id, 'downvote')}
            >
              <img src="/images/downvote.png" alt="Downvote" class="w-5 h-5" />
              <span>{story.downvotesCount}</span>
            </button>

            <button 
              class="flex items-center text-gray-600 hover:text-gray-800"
              on:click={() => (showComments = !showComments)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-6 h-6"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 20.25c4.97 0 9-2.98 9-6.75s-4.03-6.75-9-6.75S3 9.98 3 13.5s4.03 6.75 9 6.75zM12 20.25L6.75 16.5m5.25 3.75l5.25-3.75"
                />
              </svg>
              <span class="ml-2">{story.comments.length}</span>
            </button>
          </div>

          {#if showComments}
            <div class="comments">
              {#each story.comments as comment (comment.id)}
                <div class="comment">
                  <p>{comment.commenter}</p>
                  {#if editingCommentId === comment.id}
                    <!-- Edit Form -->
                    <textarea 
                      bind:value={commentText}
                      class="w-full p-2 mt-2 rounded border-2 border-gray-300"
                    ></textarea>
                    <button
                      class="bg-green-500 text-white px-4 py-2 mt-2 rounded"
                      on:click={async () => {
                        await editComment(story.id, comment.id, commentText);
                        editingCommentId = null; // Reset edit mode
                        commentText = ""; // Clear the input
                      }}
                    >
                      Save Changes
                    </button>
                    <button
                      class="bg-red-500 text-white px-4 py-2 mt-2 rounded"
                      on:click={() => { editingCommentId = null; commentText = comment.text; }}
                    >
                      Cancel
                    </button>
                  {:else}
                    <h6>{comment.text}</h6>
                    <p class="timestamp">{dayjs(comment.createdAt.toDate()).format('hh:mm A')}</p>
                    {#if comment.commenter === currentUserEmail}
                      <!-- Edit and Delete buttons -->
                      <button
                        class="text-blue-500"
                        on:click={() => { editingCommentId = comment.id; commentText = comment.text; }}
                      >
                        Edit
                      </button>
                      <button
                        class="text-red-500"
                        on:click={() => deleteComment(story.id, comment.id)}
                      >
                        Delete
                      </button>
                    {/if}
                  {/if}
                </div>
              {/each}

              <!-- Comment Box -->
              <textarea 
                bind:value={newCommentText}
                class="w-full p-2 mt-2 rounded border-2 border-gray-300" 
                placeholder="Write your comment here..." 
                rows="4"
              ></textarea>

              <!-- Submit Button -->
              <button 
                class="bg-blue-500 text-white px-4 py-2 mt-2 rounded"
                on:click={async () => {
                  await addComment(story.id, newCommentText);
                  newCommentText = ""; // Clear the text area after submission
                }}
              >
                Submit Comment
              </button>
            </div>
          {/if}

        </div>
      </div>
      {/each}
    </div>
  </div>
{/if}

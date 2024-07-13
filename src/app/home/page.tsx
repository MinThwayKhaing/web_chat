"use client";

import { useAuth } from '../components/AuthProvider';
import { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from 'react-query';

type Comment = {
  id: number;
  postId: number;
  body: string;
  userId: number;
};

type User = {
  id: number;
  username: string;
};

type Advi = {
  id: number;
  title: string;
  body: string;
  likes: number;
  likedByUser: boolean;
  comments: Comment[];
  userId: number;
  username: string;
};

const fetchPosts = async ({ pageParam = 1 }) => {
  const res = await fetch(`https://jsonplaceholder.typicode.com/posts?_page=${pageParam}&_limit=10`);
  return res.json();
};

const fetchUsers = async () => {
  const res = await fetch('https://jsonplaceholder.typicode.com/users');
  return res.json();
};

const fetchComments = async () => {
  const res = await fetch('/api/comments');
  return res.json();
};

const updateLike = async (postId: number, likes: number) => {
  const res = await fetch('/api/comments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ type: 'like', postId, likes }),
  });
  return res.json();
};

const HomePage = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [advis, setAdvis] = useState<Advi[]>([]);

  const { data: users } = useQuery('users', fetchUsers);
  const { data: comments } = useQuery('comments', fetchComments);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery('posts', fetchPosts, {
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.length === 10) return pages.length + 1;
      return undefined;
    },
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
  }, [user, router]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 2 && hasNextPage) {
        fetchNextPage();
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasNextPage, fetchNextPage]);

  useEffect(() => {
    if (data?.pages && users && comments) {
      const allPosts = data.pages.flat().map((post: Advi) => ({
        ...post,
        username: users.find((u: User) => u.id === post.userId)?.username || 'Unknown',
        comments: comments.filter((comment: Comment) => comment.postId === post.id),
        likes: comments.find((comment: Comment) => comment.id === post.id)?.like || 0,
        likedByUser: false,
      }));
      setAdvis(allPosts);
    }
  }, [data, users, comments]);

  const handleGoToPost = (id: number) => {
    router.push(`/post/${id}`);
  };

  const handleCreatePost = () => {
    const newAdvi = {
      id: advis.length + 1, // This is just for demonstration. In a real app, IDs should be handled by the backend.
      title: newTitle,
      body: newContent,
      likes: 0,
      likedByUser: false,
      comments: [],
      userId: user?.id ?? 0,
      username: user?.username ?? '',
    };
    setAdvis([newAdvi, ...advis]);
    setNewTitle('');
    setNewContent('');
  };

  const handleLikePost = (postId: number) => {
    setAdvis((prevAdvis) =>
      prevAdvis.map((post) =>
        post.id === postId && post.userId !== user?.id
          ? {
              ...post,
              likes: post.likedByUser ? post.likes - 1 : post.likes + 1,
              likedByUser: !post.likedByUser,
            }
          : post
      )
    );
    const post = advis.find((advi) => advi.id === postId);
    if (post) {
      updateLike(postId, post.likedByUser ? post.likes - 1 : post.likes + 1);
    }
    queryClient.invalidateQueries(['post', postId]);
  };

  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-400 to-blue-600 p-4">
      <div className="bg-white rounded-lg p-6 shadow-lg max-w-2xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Welcome, {user.username}</h1>
          <button
            onClick={logout}
            className="bg-red-500 text-white rounded py-2 px-4 hover:bg-red-600 transition duration-200"
          >
            Logout
          </button>
        </div>
        <p className="text-center mb-4">Your role is: {user.userrole}</p>

        {user.userrole === 'admin' && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Create New Post</h2>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Title"
              className="w-full p-2 mb-2 border border-gray-300 rounded"
            />
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Content"
              className="w-full p-2 mb-2 border border-gray-300 rounded"
            />
            <button
              onClick={handleCreatePost}
              className="bg-green-500 text-white rounded py-2 px-4 hover:bg-green-600 transition duration-200"
            >
              Create Post
            </button>
          </div>
        )}

        <div className="space-y-6">
          {advis.map((advi) => (
            <div key={advi.id} className="bg-gray-100 p-4 rounded shadow flex flex-col">
              <div>
                <h2 className="text-xl font-semibold mb-2">{advi.title}</h2>
                <p className="mb-4">{advi.body}</p>
                <p className="text-sm text-gray-500">Posted by {advi.username}</p>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex space-x-4">
                  {advi.userId !== user?.id && (
                    <button
                      onClick={() => handleLikePost(advi.id)}
                      className={`rounded py-1 px-4 ${advi.likedByUser ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
                    >
                      {advi.likedByUser ? 'Unlike' : 'Like'} {advi.likes}
                    </button>
                  )}
                  <button
                    onClick={() => handleGoToPost(advi.id)}
                    className="bg-green-500 text-white rounded py-1 px-4 hover:bg-green-600 transition duration-200"
                  >
                    Comment
                  </button>
                </div>
              </div>
              {advi.comments.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h3 className="font-semibold">Latest Comments:</h3>
                  {advi.comments.slice(-2).map((comment) => (
                    <div key={comment.id} className="bg-gray-200 p-2 rounded">
                      <p>{comment.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {isFetchingNextPage && <p>Loading more...</p>}
        </div>
      </div>
    </div>
  );
};

export default HomePage;

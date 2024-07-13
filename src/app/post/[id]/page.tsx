"use client";
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../../components/AuthProvider';

type Comment = {
  id: number;
  postId: number;
  body: string;
  userId: number;
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

const fetchPost = async (id: number): Promise<Advi> => {
  const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`);
  return res.json();
};

const addComment = async (comment: Omit<Comment, 'id'>) => {
  const res = await fetch('/api/comments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(comment),
  });
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

const PostDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const postId = Number(params.id);
  const queryClient = useQueryClient();
  const { data: post, isLoading } = useQuery(['post', postId], () => fetchPost(postId), {
    enabled: !!postId,
  });
  const [newComment, setNewComment] = useState('');
  const { user } = useAuth();

  const addCommentMutation = useMutation(addComment, {
    onSuccess: () => {
      queryClient.invalidateQueries('comments');
      queryClient.invalidateQueries(['post', postId]);
      router.push('/home'); // Redirect to home page
    },
  });

  const handleLikePost = () => {
    if (post && post.userId !== user?.id) {
      const updatedPost = {
        ...post,
        likedByUser: !post.likedByUser,
        likes: post.likedByUser ? post.likes - 1 : post.likes + 1,
      };
      updateLike(postId, updatedPost.likes);
      queryClient.setQueryData(['post', postId], updatedPost);
      queryClient.invalidateQueries('posts');
    }
  };

  const handleAddComment = () => {
    if (post && post.userId !== user?.id) {
      const newCommentObj: Omit<Comment, 'id'> = {
        postId,
        body: newComment,
        userId: user?.id ?? 1,
      };
      addCommentMutation.mutate(newCommentObj);
      setNewComment('');
    }
  };

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (!post) {
    return <p>Post not found</p>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-400 to-blue-600 p-4">
      <div className="bg-white rounded-lg p-6 shadow-lg max-w-2xl w-full">
        <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
        <p className="mb-4">{post.body}</p>
        <p className="text-sm text-gray-500">Posted by {post.username}</p>
        <div className="flex space-x-4">

          <button onClick={() => router.back()} className="bg-blue-500 text-white rounded py-2 px-4 hover:bg-blue-600 transition duration-200">
            Back
          </button>
        </div>
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Comments</h2>
          {post.comments && post.comments.length > 0 ? (
            post.comments.map((comment: Comment) => (
              <div key={comment.id} className="bg-gray-200 p-2 rounded mb-2">
                <p>{comment.body}</p>
              </div>
            ))
          ) : (
            <p>No comments yet.</p>
          )}
          {post.userId !== user?.id && (
            <>
              <textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              />
              <button
                onClick={handleAddComment}
                className="bg-green-500 text-white rounded py-2 px-4 hover:bg-green-600 transition duration-200 mt-2"
              >
                Add Comment
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetailPage;

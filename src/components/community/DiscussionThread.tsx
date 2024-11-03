import React from 'react';
import { MessageCircle, ThumbsUp, Flag, Share2 } from 'lucide-react';

interface ThreadProps {
  post: any;
  onReply: (content: string) => void;
  onLike: () => void;
  onShare: () => void;
  onReport: () => void;
}

export default function DiscussionThread({ post, onReply, onLike, onShare, onReport }: ThreadProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const handleSubmitReply = () => {
    if (replyContent.trim()) {
      onReply(replyContent);
      setReplyContent('');
      setShowReplyForm(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Thread content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <div className="flex justify-between mb-4">
          <div>
            <h3 className="font-semibold">{post.title}</h3>
            <p className="text-sm text-gray-500">{post.author}</p>
          </div>
          <div className="flex space-x-2">
            <button onClick={onLike}>
              <ThumbsUp className="h-5 w-5" />
            </button>
            <button onClick={onShare}>
              <Share2 className="h-5 w-5" />
            </button>
            <button onClick={onReport}>
              <Flag className="h-5 w-5" />
            </button>
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-300">{post.content}</p>
      </div>

      {/* Reply form */}
      {showReplyForm && (
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            className="w-full p-2 rounded-lg"
            placeholder="Write your reply..."
          />
          <div className="flex justify-end space-x-2 mt-2">
            <button
              onClick={() => setShowReplyForm(false)}
              className="px-4 py-2 text-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitReply}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
            >
              Reply
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 
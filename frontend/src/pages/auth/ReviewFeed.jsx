
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Star,
  Heart,
  MessageCircle,
  Clock3,
  Search,
  Plus,
  Utensils,
  MapPin,
  ArrowRight,
  Send,
  Reply,
  Pencil,
  Trash2,
  X,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'

function formatTime(date) {
  if (!date) return ''

  const value = new Date(date)
  if (Number.isNaN(value.getTime())) return ''

  const diff = Math.max(0, Date.now() - value.getTime())
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} minutes ago`
  if (hours < 24) return `${hours} hours ago`
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`

  return value.toLocaleDateString()
}

function getInitials(name) {
  if (!name || name === 'Anonymous') return 'A'

  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}

function CommentItem({
  comment,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  onRequireLogin,
}) {
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(comment.body)
  const [replying, setReplying] = useState(false)
  const [replyText, setReplyText] = useState('')

  const isOwner =
    currentUserId &&
    Number(currentUserId) === Number(comment.user_id)

  const saveEdit = async () => {
    if (!editText.trim()) return

    await onEdit(comment.id, editText.trim())
    setEditing(false)
  }

  const submitReply = async (event) => {
    event.preventDefault()

    if (!currentUserId) {
      onRequireLogin()
      return
    }

    if (!replyText.trim()) return

    await onReply(comment.id, replyText.trim())
    setReplyText('')
    setReplying(false)
  }

  return (
    <div className="border-l-2 border-gray-100 pl-4">
      <div className="rounded-xl bg-gray-50 p-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-gray-800">
              {comment.user_name}
            </p>
            {comment.is_edited === 1 && (
              <span className="text-xs text-gray-400">Edited</span>
            )}
          </div>

          {isOwner && comment.status === 'published' && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditText(comment.body)
                  setEditing(!editing)
                }}
                className="text-gray-400 hover:text-orange-600"
                title="Edit comment"
              >
                <Pencil size={14} />
              </button>

              <button
                type="button"
                onClick={() => onDelete(comment.id)}
                className="text-gray-400 hover:text-red-600"
                title="Delete comment"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>

        {editing ? (
          <div className="mt-2 space-y-2">
            <textarea
              value={editText}
              onChange={(event) => setEditText(event.target.value)}
              rows={2}
              className="w-full rounded-lg border border-gray-200 bg-white p-2 text-sm outline-none focus:border-orange-400"
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={saveEdit}
                className="rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-medium text-white"
              >
                Save
              </button>

              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-lg border px-3 py-1.5 text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-1 text-sm leading-6 text-gray-600">
            {comment.body}
          </p>
        )}

        {comment.status === 'published' && (
          <button
            type="button"
            onClick={() => {
              if (!currentUserId) {
                onRequireLogin()
                return
              }
              setReplying(!replying)
            }}
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-orange-600"
          >
            <Reply size={13} />
            Reply
          </button>
        )}

        {replying && (
          <form onSubmit={submitReply} className="mt-3 flex gap-2">
            <input
              value={replyText}
              onChange={(event) => setReplyText(event.target.value)}
              placeholder="Write a reply..."
              className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400"
            />

            <button
              type="submit"
              className="rounded-lg bg-orange-600 px-3 text-white"
            >
              <Send size={15} />
            </button>
          </form>
        )}
      </div>

      {comment.replies?.length > 0 && (
        <div className="mt-3 space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              onRequireLogin={onRequireLogin}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ReviewCard({
  review,
  liked,
  comments,
  commentsLoaded,
  currentUserId,
  onLike,
  onLoadComments,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onRequireLogin,
}) {
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')

  const toggleComments = () => {
    const next = !showComments
    setShowComments(next)

    if (next && !commentsLoaded) {
      onLoadComments(review.id)
    }
  }

  const submitComment = async (event) => {
    event.preventDefault()

    if (!currentUserId) {
      onRequireLogin()
      return
    }

    if (!commentText.trim()) return

    await onAddComment(review.id, commentText.trim())
    setCommentText('')
    setShowComments(true)
  }

  const name = review.reviewer_name || 'Anonymous'

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-100 font-semibold text-orange-700">
            {getInitials(name)}
          </div>

          <div>
            <h3 className="font-semibold text-gray-900">{name}</h3>

            <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
              <Clock3 size={13} />
              {formatTime(review.created_at)}
              {review.is_edited === 1 && (
                <span className="ml-1">· Edited</span>
              )}
            </p>
          </div>
        </div>

        {review.is_anonymous === 1 && (
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
            Anonymous
          </span>
        )}
      </div>

      <div className="mt-5 rounded-xl bg-gray-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {review.food_item_name}
            </p>

            <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
              <MapPin size={13} />
              {review.shop_name}
            </p>
          </div>

          <div className="flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5">
            {[1, 2, 3, 4, 5].map((number) => (
              <Star
                key={number}
                size={15}
                className={
                  number <= Number(review.rating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-gray-300'
                }
              />
            ))}

            <span className="ml-1 text-sm font-semibold text-gray-700">
              {Number(review.rating).toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-gray-600">
        {review.body}
      </p>

      {review.image_url && (
        <img
          src={review.image_url}
          alt="Review"
          className="mt-4 max-h-72 w-full rounded-xl object-cover"
          onError={(event) => {
            event.currentTarget.style.display = 'none'
          }}
        />
      )}

      <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
        <button
          type="button"
          onClick={onLike}
          className={`flex items-center gap-2 text-sm font-medium transition ${
            liked ? 'text-rose-600' : 'text-gray-500 hover:text-rose-600'
          }`}
        >
          <Heart size={18} className={liked ? 'fill-current' : ''} />
          {Number(review.like_count || 0)} Likes
        </button>

        <button
          type="button"
          onClick={toggleComments}
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-orange-600"
        >
          <MessageCircle size={18} />
          Comments
        </button>
      </div>

      {showComments && (
        <div className="mt-5 border-t border-gray-100 pt-5">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="font-semibold text-gray-900">
              Comments
            </h4>

            <button
              type="button"
              onClick={() => setShowComments(false)}
              className="text-gray-400 hover:text-gray-700"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={submitComment} className="mb-5 flex gap-2">
            <input
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              placeholder="Write a comment..."
              className="min-w-0 flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
            />

            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-orange-600 px-4 text-sm font-medium text-white hover:bg-orange-700"
            >
              <Send size={16} />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>

          {!commentsLoaded ? (
            <p className="py-5 text-center text-sm text-gray-400">
              Loading comments...
            </p>
          ) : comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  currentUserId={currentUserId}
                  onReply={(parentId, body) =>
                    onAddComment(review.id, body, parentId)
                  }
                  onEdit={onEditComment}
                  onDelete={onDeleteComment}
                  onRequireLogin={onRequireLogin}
                />
              ))}
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-gray-400">
              No comments yet. Be the first to comment!
            </p>
          )}
        </div>
      )}
    </article>
  )
}

export default function ReviewFeed() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [reviews, setReviews] = useState([])
  const [likedReviews, setLikedReviews] = useState({})
  const [comments, setComments] = useState({})
  const [loadedComments, setLoadedComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const currentUserId = user?.id || null

  useEffect(() => {
    let active = true

    const fetchReviews = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await api.get('/reviews', {
          params: {
            page: 1,
            limit: 50,
            ...(search.trim() ? { search: search.trim() } : {}),
          },
        })

        if (!active) return

        const reviewList = response.data.reviews || []
        setReviews(reviewList)

        if (currentUserId) {
          const reactionResults = await Promise.all(
            reviewList.map(async (review) => {
              try {
                const result = await api.get(
                  `/reviews/${review.id}/reaction`
                )

                return [
                  review.id,
                  {
                    liked: result.data.is_liked,
                    count: Number(result.data.like_count || 0),
                  },
                ]
              } catch {
                return [
                  review.id,
                  {
                    liked: false,
                    count: Number(review.like_count || 0),
                  },
                ]
              }
            })
          )

          if (active) {
            setLikedReviews(Object.fromEntries(
              reactionResults.map(([id, data]) => [id, data.liked])
            ))

            setReviews((previous) =>
              previous.map((review) => {
                const reaction = Object.fromEntries(reactionResults)[review.id]
                return reaction
                  ? { ...review, like_count: reaction.count }
                  : review
              })
            )
          }
        } else {
          setLikedReviews({})
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
            'Failed to load reviews. Please try again.'
          )
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchReviews()

    return () => {
      active = false
    }
  }, [search, currentUserId])

  const handleLike = async (reviewId) => {
    if (!currentUserId) {
      navigate('/login')
      return
    }

    try {
      const response = await api.post(`/reviews/${reviewId}/reaction`)

      setLikedReviews((previous) => ({
        ...previous,
        [reviewId]: response.data.is_liked,
      }))

      setReviews((previous) =>
        previous.map((review) =>
          review.id === reviewId
            ? { ...review, like_count: response.data.like_count }
            : review
        )
      )
    } catch (err) {
      window.alert(
        err.response?.data?.message || 'Could not update like.'
      )
    }
  }

  const loadComments = async (reviewId) => {
    try {
      const response = await api.get(
        `/comments/review/${reviewId}`
      )

      setComments((previous) => ({
        ...previous,
        [reviewId]: response.data.comments || [],
      }))

      setLoadedComments((previous) =>
        previous.includes(reviewId)
          ? previous
          : [...previous, reviewId]
      )
    } catch (err) {
      window.alert(
        err.response?.data?.message || 'Could not load comments.'
      )
      setLoadedComments((previous) => [...previous, reviewId])
    }
  }

  const handleAddComment = async (reviewId, body, parentId = null) => {
    if (!currentUserId) {
      navigate('/login')
      return
    }

    try {
      await api.post('/comments', {
        review_id: reviewId,
        parent_comment_id: parentId,
        body,
      })

      await loadComments(reviewId)
    } catch (err) {
      window.alert(
        err.response?.data?.message || 'Could not add comment.'
      )
    }
  }

  const handleEditComment = async (commentId, body) => {
    try {
      await api.put(`/comments/${commentId}`, { body })

      setComments((previous) => {
        const updateTree = (items) =>
          items.map((item) => ({
            ...item,
            body: item.id === commentId ? body : item.body,
            is_edited: item.id === commentId ? 1 : item.is_edited,
            replies: updateTree(item.replies || []),
          }))

        return Object.fromEntries(
          Object.entries(previous).map(([reviewId, items]) => [
            reviewId,
            updateTree(items),
          ])
        )
      })
    } catch (err) {
      window.alert(
        err.response?.data?.message || 'Could not edit comment.'
      )
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return
    }

    try {
      await api.delete(`/comments/${commentId}`)

      setComments((previous) => {
        const updateTree = (items) =>
          items.map((item) => ({
            ...item,
            body:
              item.id === commentId
                ? 'This comment was deleted.'
                : item.body,
            status:
              item.id === commentId
                ? 'removed'
                : item.status,
            replies: updateTree(item.replies || []),
          }))

        return Object.fromEntries(
          Object.entries(previous).map(([reviewId, items]) => [
            reviewId,
            updateTree(items),
          ])
        )
      })
    } catch (err) {
      window.alert(
        err.response?.data?.message || 'Could not delete comment.'
      )
    }
  }

  const handleCreateReview = () => {
    if (!currentUserId) {
      navigate('/login')
      return
    }

    navigate('/reviews/new')
  }

  return (
    <div className="space-y-8 pb-10">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-600 to-amber-500 px-6 py-10 text-white sm:px-10 sm:py-14">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-xs font-medium">
            <Utensils size={14} />
            Your Campus Food Community
          </span>

          <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-5xl">
            Discover food.
            <br />
            Share your experience.
          </h1>

          <p className="mt-4 max-w-lg text-sm leading-7 text-orange-50 sm:text-base">
            Explore honest food reviews from students and find the best
            places to eat around your campus.
          </p>

          <button
            type="button"
            onClick={handleCreateReview}
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-orange-700 shadow-sm hover:bg-orange-50"
          >
            <Plus size={18} />
            Write a Review
          </button>
        </div>

        <div className="pointer-events-none absolute -right-10 -top-12 hidden h-72 w-72 rounded-full border-[35px] border-white/10 sm:block" />
        <div className="pointer-events-none absolute -bottom-24 right-36 hidden h-56 w-56 rounded-full bg-white/10 sm:block" />
      </section>

      <section>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-orange-600">
              CampusBite Community
            </p>

            <h2 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
              Latest Food Reviews
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              See what students are saying about campus food.
            </p>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search food or shop..."
              className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-orange-400"
            />
          </div>
        </div>
      </section>

      <section className="space-y-5">
        {loading ? (
          <div className="rounded-2xl border bg-white px-5 py-12 text-center text-sm text-gray-500">
            Loading reviews...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-10 text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button
              type="button"
              onClick={() => setSearch((value) => value)}
              className="mt-3 text-sm font-semibold text-orange-600"
            >
              Try again
            </button>
          </div>
        ) : reviews.length > 0 ? (
          reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              liked={Boolean(likedReviews[review.id])}
              comments={comments[review.id] || []}
              commentsLoaded={loadedComments.includes(review.id)}
              currentUserId={currentUserId}
              onLike={() => handleLike(review.id)}
              onLoadComments={loadComments}
              onAddComment={handleAddComment}
              onEditComment={handleEditComment}
              onDeleteComment={handleDeleteComment}
              onRequireLogin={() => navigate('/login')}
            />
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-12 text-center">
            <Search size={30} className="mx-auto text-gray-300" />
            <h3 className="mt-3 font-semibold text-gray-800">
              No reviews found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Try another search or be the first to write a review.
            </p>
          </div>
        )}
      </section>

      <section className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-orange-100 bg-orange-50 p-6 text-center sm:flex-row sm:text-left">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            Tried something delicious?
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Help other students discover great campus food.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreateReview}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-700"
        >
          Share Your Review
          <ArrowRight size={17} />
        </button>
      </section>
    </div>
  )
}

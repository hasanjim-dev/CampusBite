
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
  RefreshCw,
  Sparkles,
  MessageSquare,
  Image as ImageIcon,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'

const API_BASE_URL = (import.meta.env.VITE_API_URL || '')
  .replace(/\/api\/?$/, '')

function getImageUrl(imageUrl) {
  if (!imageUrl) return ''

  if (/^https?:\/\//i.test(imageUrl)) {
    return imageUrl
  }

  return `${API_BASE_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`
}

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
    <div className="border-l-2 border-orange-100 pl-3 sm:pl-4">
      <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-bold text-gray-900">
                {comment.user_name}
              </p>

              {comment.is_shop_owner && (
                <span className="rounded-full bg-orange-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-orange-700">
                  Shop Owner
                </span>
              )}

              {comment.is_edited === 1 && (
                <span className="text-[11px] text-gray-400">
                  Edited
                </span>
              )}
            </div>
          </div>

          {isOwner && comment.status === 'published' && (
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setEditText(comment.body)
                  setEditing(!editing)
                }}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-orange-50 hover:text-orange-600"
                title="Edit comment"
              >
                <Pencil size={14} />
              </button>

              <button
                type="button"
                onClick={() => onDelete(comment.id)}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                title="Delete comment"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>

        {editing ? (
          <div className="mt-3 space-y-3">
            <textarea
              value={editText}
              onChange={(event) => setEditText(event.target.value)}
              rows={3}
              className="w-full resize-y rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-700 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
            />

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={saveEdit}
                className="rounded-xl bg-orange-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-orange-700"
              >
                Save changes
              </button>

              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p
            className={`mt-2 whitespace-pre-wrap text-sm leading-7 text-gray-600 ${
              comment.is_shop_owner ? 'font-semibold text-gray-800' : ''
            }`}
          >
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
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg text-xs font-bold text-orange-600 transition hover:text-orange-800"
          >
            <Reply size={14} />
            Reply
          </button>
        )}

        {replying && (
          <form onSubmit={submitReply} className="mt-3 flex gap-2">
            <input
              value={replyText}
              onChange={(event) => setReplyText(event.target.value)}
              placeholder="Write a reply..."
              className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
            />

            <button
              type="submit"
              disabled={!replyText.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-600 text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
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

  const reviewImages =
    Array.isArray(review.image_urls) && review.image_urls.length > 0
      ? review.image_urls
      : review.image_url
        ? [review.image_url]
        : []

  const rating = Number(review.rating) || 0

  return (
    <article className="group overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-orange-100 hover:shadow-xl hover:shadow-orange-900/5">
      <div className="p-5 sm:p-7">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 text-base font-extrabold text-orange-700 ring-4 ring-orange-50">
              {getInitials(name)}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate text-sm font-bold text-gray-900 sm:text-base">
                  {name}
                </h3>

                {review.is_anonymous === 1 && (
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-500">
                    Anonymous
                  </span>
                )}
              </div>

              <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-400">
                <Clock3 size={13} />
                {formatTime(review.created_at)}
                {review.is_edited === 1 && (
                  <span className="ml-1">· Edited</span>
                )}
              </p>
            </div>
          </div>

          <div className="hidden shrink-0 items-center gap-1 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-700 sm:inline-flex">
            <Sparkles size={13} />
            Student Review
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-orange-100/70 bg-gradient-to-r from-orange-50/80 to-amber-50/50 p-4 sm:p-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-orange-600 shadow-sm">
                  <Utensils size={17} />
                </span>

                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold text-gray-900 sm:text-base">
                    {review.food_item_name}
                  </p>

                  <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                    <MapPin size={13} className="shrink-0 text-orange-500" />
                    <span className="truncate">{review.shop_name}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 self-start rounded-xl border border-white bg-white px-3 py-2 shadow-sm sm:self-auto">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((number) => (
                  <Star
                    key={number}
                    size={15}
                    className={
                      number <= rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-200'
                    }
                  />
                ))}
              </div>

              <span className="text-sm font-extrabold tabular-nums text-gray-800">
                {rating.toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-gray-600 sm:text-[15px]">
          {review.body}
        </p>

        {reviewImages.length > 0 && (
          <div
            className={`mt-5 grid gap-3 ${
              reviewImages.length === 1
                ? 'grid-cols-1'
                : 'grid-cols-2'
            }`}
          >
            {reviewImages.map((imageUrl, index) => (
              <div
                key={`${review.id}-${index}`}
                className="group/image relative overflow-hidden rounded-2xl bg-gray-100"
              >
                <img
                  src={getImageUrl(imageUrl)}
                  alt={`Review image ${index + 1}`}
                  loading="lazy"
                  className="max-h-80 min-h-36 w-full object-cover transition duration-500 group-hover/image:scale-105"
                  onError={(event) => {
                    event.currentTarget.style.display = 'none'
                  }}
                />

                <div className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
                  <span className="flex items-center gap-1">
                    <ImageIcon size={11} />
                    Photo {index + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={onLike}
            className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition ${
              liked
                ? 'bg-rose-50 text-rose-600'
                : 'text-gray-500 hover:bg-rose-50 hover:text-rose-600'
            }`}
          >
            <Heart
              size={19}
              className={liked ? 'fill-current' : ''}
            />
            <span>{Number(review.like_count || 0)} Likes</span>
          </button>

          <button
            type="button"
            onClick={toggleComments}
            className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition ${
              showComments
                ? 'bg-orange-50 text-orange-700'
                : 'text-gray-500 hover:bg-orange-50 hover:text-orange-700'
            }`}
          >
            <MessageCircle size={19} />
            <span>{Number(review.comment_count || 0)} Comments</span>
          </button>
        </div>

        {showComments && (
          <div className="mt-5 border-t border-gray-100 pt-5">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                  <MessageSquare size={17} />
                </span>

                <div>
                  <h4 className="text-sm font-extrabold text-gray-900">
                    Community Discussion
                  </h4>
                  <p className="text-xs text-gray-400">
                    Share your thoughts
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowComments(false)}
                className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                title="Close comments"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={submitComment} className="mb-5 flex gap-2">
              <input
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                placeholder="Write something..."
                className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
              />

              <button
                type="submit"
                disabled={!commentText.trim()}
                className="flex shrink-0 items-center gap-2 rounded-xl bg-orange-600 px-4 py-3 text-sm font-bold text-white shadow-sm shadow-orange-600/20 transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send size={16} />
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>

            {!commentsLoaded ? (
              <div className="flex items-center justify-center gap-2 rounded-2xl bg-gray-50 py-8 text-sm text-gray-400">
                <RefreshCw size={15} className="animate-spin" />
                Loading comments...
              </div>
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
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/70 px-4 py-8 text-center">
                <MessageCircle
                  size={25}
                  className="mx-auto text-gray-300"
                />
                <p className="mt-2 text-sm font-bold text-gray-600">
                  No comments yet
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Be the first to join the conversation!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

function ReviewSkeleton() {
  return (
    <div className="animate-pulse rounded-3xl border border-gray-100 bg-white p-5 sm:p-7">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-2xl bg-gray-100" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-32 rounded bg-gray-100" />
          <div className="h-2.5 w-24 rounded bg-gray-100" />
        </div>
      </div>

      <div className="mt-6 h-20 rounded-2xl bg-gray-100" />
      <div className="mt-5 space-y-2">
        <div className="h-3 w-full rounded bg-gray-100" />
        <div className="h-3 w-5/6 rounded bg-gray-100" />
        <div className="h-3 w-2/3 rounded bg-gray-100" />
      </div>

      <div className="mt-6 flex justify-between border-t border-gray-100 pt-4">
        <div className="h-8 w-24 rounded-lg bg-gray-100" />
        <div className="h-8 w-28 rounded-lg bg-gray-100" />
      </div>
    </div>
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
  const [retryKey, setRetryKey] = useState(0)

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
            setLikedReviews(
              Object.fromEntries(
                reactionResults.map(([id, data]) => [id, data.liked])
              )
            )

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
  }, [search, currentUserId, retryKey])

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

      setLoadedComments((previous) =>
        previous.includes(reviewId)
          ? previous
          : [...previous, reviewId]
      )
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

      setReviews((previous) =>
        previous.map((review) =>
          review.id === reviewId
            ? {
                ...review,
                comment_count: Number(review.comment_count || 0) + 1,
              }
            : review
        )
      )

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
            body:
              Number(item.id) === Number(commentId)
                ? body
                : item.body,
            is_edited:
              Number(item.id) === Number(commentId)
                ? 1
                : item.is_edited,
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

    const containsComment = (items) =>
      items.some(
        (item) =>
          Number(item.id) === Number(commentId) ||
          containsComment(item.replies || [])
      )

    const affectedReviewId = Object.entries(comments).find(
      ([, items]) => containsComment(items)
    )?.[0]

    try {
      await api.delete(`/comments/${commentId}`)

      setComments((previous) => {
        const updateTree = (items) =>
          items.map((item) => ({
            ...item,
            body:
              Number(item.id) === Number(commentId)
                ? 'This comment was deleted.'
                : item.body,
            status:
              Number(item.id) === Number(commentId)
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

      if (affectedReviewId) {
        setReviews((previous) =>
          previous.map((review) =>
            Number(review.id) === Number(affectedReviewId)
              ? {
                  ...review,
                  comment_count: Math.max(
                    0,
                    Number(review.comment_count || 0) - 1
                  ),
                }
              : review
          )
        )
      }
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
    <div className="mx-auto max-w-6xl space-y-9 pb-12">
      <section className="relative isolate overflow-hidden rounded-[2rem] bg-gradient-to-br from-orange-600 via-orange-500 to-amber-400 px-6 py-10 text-white shadow-xl shadow-orange-600/10 sm:px-10 sm:py-14 lg:px-14">
        <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full border-[40px] border-white/10" />
        <div className="pointer-events-none absolute -bottom-36 right-1/4 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute right-10 top-1/2 hidden -translate-y-1/2 rotate-12 text-white/10 lg:block">
          <Utensils size={190} strokeWidth={1} />
        </div>

        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-4 py-2 text-xs font-bold tracking-wide text-white backdrop-blur-sm">
            <Sparkles size={14} />
            YOUR CAMPUS FOOD COMMUNITY
          </span>

          <h1 className="mt-6 text-4xl font-black leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl">
            Good food.
            <br />
            Great stories.
          </h1>

          <p className="mt-5 max-w-lg text-sm leading-7 text-orange-50 sm:text-base">
            Discover what students are eating, explore honest food
            experiences and find your next favourite campus meal.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleCreateReview}
              className="inline-flex items-center gap-2.5 rounded-xl bg-white px-5 py-3.5 text-sm font-extrabold text-orange-700 shadow-lg shadow-orange-900/10 transition hover:-translate-y-0.5 hover:bg-orange-50"
            >
              <Plus size={19} />
              Write a Review
            </button>

            <div className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-3.5 text-sm font-semibold text-white backdrop-blur-sm">
              <Heart size={17} />
              Real student experiences
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-9 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/20 pt-5 text-xs font-medium text-orange-50 sm:mt-11">
          <span className="flex items-center gap-2">
            <Star size={14} className="fill-current" />
            Honest ratings
          </span>
          <span className="flex items-center gap-2">
            <MessageCircle size={14} />
            Community discussions
          </span>
          <span className="flex items-center gap-2">
            <Utensils size={14} />
            Campus food discovery
          </span>
        </div>
      </section>

      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-orange-600">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
            CampusBite Community
          </p>

          <h2 className="mt-2 text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
            Latest Food Reviews
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Discover what your campus community is talking about.
          </p>
        </div>

        <div className="relative w-full sm:max-w-sm">
          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search food or shop..."
            className="w-full rounded-2xl border border-gray-200 bg-white py-3.5 pl-11 pr-11 text-sm text-gray-700 shadow-sm outline-none transition placeholder:text-gray-400 hover:border-orange-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </section>

      <section className="space-y-5">
        {loading ? (
          <>
            <ReviewSkeleton />
            <ReviewSkeleton />
          </>
        ) : error ? (
          <div className="rounded-3xl border border-red-100 bg-white px-5 py-14 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <RefreshCw size={24} />
            </div>

            <h3 className="mt-4 text-lg font-extrabold text-gray-900">
              Couldn't load reviews
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              {error}
            </p>

            <button
              type="button"
              onClick={() => setRetryKey((value) => value + 1)}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-700"
            >
              <RefreshCw size={16} />
              Try Again
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
          <div className="rounded-3xl border border-dashed border-gray-200 bg-white px-5 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
              <Search size={27} />
            </div>

            <h3 className="mt-5 text-lg font-extrabold text-gray-900">
              {search ? 'No reviews found' : 'No reviews yet'}
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
              {search
                ? 'We could not find any reviews matching your search. Try another food or shop name.'
                : 'Be the first to share your campus food experience with the community.'}
            </p>

            {search ? (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="mt-5 rounded-xl border border-gray-200 px-5 py-3 text-sm font-bold text-gray-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
              >
                Clear Search
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCreateReview}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-700"
              >
                <Plus size={17} />
                Write First Review
              </button>
            )}
          </div>
        )}
      </section>

      <section className="relative overflow-hidden rounded-3xl border border-orange-100 bg-gradient-to-r from-orange-50 via-white to-amber-50 p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-orange-100/60 blur-2xl" />

        <div className="relative flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-orange-700">
              <Heart size={12} />
              Share the experience
            </div>

            <h3 className="mt-3 text-xl font-black tracking-tight text-gray-900 sm:text-2xl">
              Tried something delicious?
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Your review could help another student discover their next
              favourite meal.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCreateReview}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-orange-600 px-5 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-orange-600/15 transition hover:-translate-y-0.5 hover:bg-orange-700"
          >
            Share Your Review
            <ArrowRight size={17} />
          </button>
        </div>
      </section>
    </div>
  )
}

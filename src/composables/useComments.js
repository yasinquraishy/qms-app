import { get, post, put, del } from '@/api'

const symbol = Symbol('useComments')

function CommentsState() {
  const comments = ref([])
  const loading = ref(false)

  async function fetchComments({ objectType, objectId, userId } = {}) {
    const params = { objectType, objectId }
    if (userId) params.userId = userId

    const data = await get('/v1/services/comments', {
      params,
      loader: loading,
    })
    comments.value = data.comments || []
  }

  async function createComment({ body, objectType, objectId }) {
    const data = await post('/v1/services/comments', {
      body,
      objectType,
      objectId,
    })

    comments.value.push(data.comment)
    return { comment: data.comment }
  }

  async function updateComment(id, { body }) {
    const data = await put(`/v1/services/comments/${id}`, { body })

    const index = comments.value.findIndex((c) => c.id === id)
    if (index !== -1) comments.value[index] = data.comment

    return { comment: data.comment }
  }

  async function deleteComment(id) {
    await del(`/v1/services/comments/${id}`)

    comments.value = comments.value.filter((c) => c.id !== id)
    return { success: true }
  }

  function getCommentForObject(objectId) {
    return comments.value.find((c) => c.objectId === objectId) || null
  }

  return {
    comments,
    loading,
    fetchComments,
    createComment,
    updateComment,
    deleteComment,
    getCommentForObject,
  }
}

export function provideComments() {
  const state = CommentsState()
  provide(symbol, state)
  return state
}

export function useComments() {
  return inject(symbol, CommentsState())
}

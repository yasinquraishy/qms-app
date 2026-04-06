import { currentCompany } from '@/utils/currentCompany.js'
import { get, post, put, del } from '@/api'

const symbol = Symbol('useComments')

function CommentsState() {
  const comments = ref([])
  const loading = ref(false)

  async function fetchComments({ objectType, objectId, userId } = {}) {
    const companyId = currentCompany.value?.id
    if (!companyId) return

    const params = { companyId, objectType, objectId }
    if (userId) params.userId = userId

    const data = await get('/v1/services/comments', {
      params,
      loader: loading,
    })
    comments.value = data.comments || []
  }

  async function createComment({ body, objectType, objectId }) {
    const companyId = currentCompany.value?.id
    if (!companyId) return { error: 'Company ID is required' }

    const data = await post('/v1/services/comments', {
      body,
      objectType,
      objectId,
      companyId,
    })

    comments.value.push(data.comment)
    return { comment: data.comment }
  }

  async function updateComment(id, { body }) {
    const companyId = currentCompany.value?.id
    if (!companyId) return { error: 'Company ID is required' }

    const data = await put(`/v1/services/comments/${id}`, { body, companyId })

    const index = comments.value.findIndex((c) => c.id === id)
    if (index !== -1) comments.value[index] = data.comment

    return { comment: data.comment }
  }

  async function deleteComment(id) {
    const companyId = currentCompany.value?.id
    if (!companyId) return { error: 'Company ID is required' }

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

import { currentCompany } from '@/utils/currentCompany.js'
import { get, post, del } from '@/api'
import { getSocket } from '@/api/socket.js'

const symbol = Symbol('useDocumentMessages')

function DocumentMessagesState() {
  const messages = ref([])
  const loading = ref(false)
  const documentId = ref(null)

  async function fetchMessages(docId) {
    const companyId = currentCompany.value?.id
    if (!companyId || !docId) return

    const data = await get('/v1/services/comments', {
      params: { companyId, objectType: 'Document', objectId: docId },
      loader: loading,
    })
    messages.value = data.comments || []
  }

  async function sendMessage(docId, body) {
    const companyId = currentCompany.value?.id
    if (!companyId || !docId) return { error: 'Missing required fields' }

    const data = await post('/v1/services/comments', {
      body,
      objectType: 'Document',
      objectId: docId,
      companyId,
    })

    // Add optimistically (or from response)
    if (data.comment) {
      const exists = messages.value.some((m) => m.id === data.comment.id)
      if (!exists) messages.value.push(data.comment)
    }

    return { comment: data.comment }
  }

  async function deleteMessage(id) {
    const companyId = currentCompany.value?.id
    if (!companyId) return { error: 'Company ID is required' }

    await del(`/v1/services/comments/${id}`, { params: { companyId } })
    messages.value = messages.value.filter((m) => m.id !== id)
    return { success: true }
  }

  function joinRoom(docId) {
    documentId.value = docId
    const socket = getSocket()
    if (socket) {
      socket.emit('join-document', docId)
      socket.on('comment:new', handleNewComment)
    }
  }

  function leaveRoom() {
    const socket = getSocket()
    if (socket && documentId.value) {
      socket.emit('leave-document', documentId.value)
      socket.off('comment:new', handleNewComment)
    }
    documentId.value = null
  }

  function handleNewComment(comment) {
    if (comment.objectType !== 'Document' || comment.objectId !== documentId.value) return
    const exists = messages.value.some((m) => m.id === comment.id)
    if (!exists) messages.value.push(comment)
  }

  return {
    messages,
    loading,
    fetchMessages,
    sendMessage,
    deleteMessage,
    joinRoom,
    leaveRoom,
  }
}

export function provideDocumentMessages() {
  const state = DocumentMessagesState()
  provide(symbol, state)
  return state
}

export function useDocumentMessages() {
  return inject(symbol)
}

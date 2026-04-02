function createTagElement(text) {
  return `<span class="highlight" data-type="tag" data-id="${text}">${text}</span>`
}

function processTag(text) {
  return text.replace(/%([^%]+)%/g, (match, p1) => {
    // Extract the word inside the `%` symbols (the captured group 2, p2)
    // Return the new HTML element with the word wrapped in <mark>
    return createTagElement(p1)
  })
}

function processParagraph(text) {
  text = processTag(text)

  return `<p>${text}</p>`
}

export function processPlainText(text) {
  // will be used in advance usage
  // const div = document.createElement('div')
  // div.innerHTML = text
  // div.childNodes.forEach(child => {
  //   if (child.nodeType === Node.TEXT_NODE) {
  //    child.replaceWith()
  //   }
  // })
  if (!text) {
    return ''
  }

  return text.split('\n').filter(Boolean).map(processParagraph).join('')
}

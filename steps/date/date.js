
async function validator (promptContext) {
  // Check whether the input could be recognized as an integer.
  if (!promptContext.recognized.succeeded) {
    await promptContext.context.sendActivity(
      "I'm sorry, I do not understand. Please enter the date or time for your reservation.")
    return false
  }

  // Check whether any of the recognized date-times are appropriate,
  // and if so, return the first appropriate date-time.
  const earliest = Date.now() + (60 * 60 * 1000)
  let value = null
  promptContext.recognized.value.forEach(candidate => {
    // TODO: update validation to account for time vs date vs date-time vs range.
    const time = new Date(candidate.value || candidate.start)
    if (earliest < time.getTime()) {
      value = candidate
    }
  })
  if (value) {
    promptContext.recognized.value = [value]
    return true
  }

  await promptContext.context.sendActivity(
    "I'm sorry, we can't take reservations earlier than an hour from now.")
  return false
}

module.exports = {
  validator
}

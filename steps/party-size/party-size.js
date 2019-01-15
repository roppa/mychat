const PARTY_SIZE_PROMPT = 'partySizePrompt'

async function prompt (stepContext) {
  // Prompt for the party size. The result of the prompt is returned to the next step of the waterfall.
  return stepContext.prompt(
    PARTY_SIZE_PROMPT, {
      prompt: 'How many people is the reservation for?',
      retryPrompt: 'How large is your party?'
    })
}

async function validator (promptContext) {
  // Check whether the input could be recognized as an integer.
  if (!promptContext.recognized.succeeded) {
    await promptContext.context.sendActivity(
      "I'm sorry, I do not understand. Please enter the number of people in your party.")
    return false
  }
  if (promptContext.recognized.value % 1 !== 0) {
    await promptContext.context.sendActivity(
      "I'm sorry, I don't understand fractional people.")
    return false
  }
  // Check whether the party size is appropriate.
  var size = promptContext.recognized.value
  if (size < 6 || size > 20) {
    await promptContext.context.sendActivity(
      'Sorry, we can only take reservations for parties of 6 to 20.')
    return false
  }

  return true
}

module.exports = {
  prompt,
  validator
}

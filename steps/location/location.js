const LOCATION_PROMPT = 'locationPrompt'

async function prompt (stepContext) {
  // Prompt for location
  return stepContext.prompt(
    LOCATION_PROMPT, 'Select a location.', ['Redmond', 'Bellevue', 'Seattle']
  )
}

module.exports = {
  prompt
}

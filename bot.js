// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityTypes } = require('botbuilder')
const { DialogSet, WaterfallDialog, NumberPrompt, DateTimePrompt, ChoicePrompt, DialogTurnStatus } = require('botbuilder-dialogs')

const partySize = require('./steps/party-size')
const location = require('./steps/location')
const date = require('./steps/date')

// Define identifiers for state property accessors.
const DIALOG_STATE_ACCESSOR = 'dialogStateAccessor'
const RESERVATION_ACCESSOR = 'reservationAccessor'

// Define identifiers for dialogs and prompts.
const RESERVATION_DIALOG = 'reservationDialog'
const PARTY_SIZE_PROMPT = 'partySizePrompt'
const LOCATION_PROMPT = 'locationPrompt'
const RESERVATION_DATE_PROMPT = 'reservationDatePrompt'

class MyBot {
  constructor (conversationState) {
    this.dialogStateAccessor = conversationState.createProperty(DIALOG_STATE_ACCESSOR)
    this.reservationAccessor = conversationState.createProperty(RESERVATION_ACCESSOR)
    this.conversationState = conversationState
    this.dialogSet = new DialogSet(this.dialogStateAccessor)
    this.dialogSet.add(new NumberPrompt(PARTY_SIZE_PROMPT, partySize.validator))
    this.dialogSet.add(new ChoicePrompt(LOCATION_PROMPT))
    this.dialogSet.add(new DateTimePrompt(RESERVATION_DATE_PROMPT, date.validator))
    this.dialogSet.add(new WaterfallDialog(RESERVATION_DIALOG, [
      partySize.prompt.bind(this),
      location.prompt.bind(this)
    ]))
  }

  /**
     *
     * @param {TurnContext} on turn context object.
     */
  async onTurn (turnContext) {
    switch (turnContext.activity.type) {
      case ActivityTypes.Message:
        // Get the current reservation info from state.
        const reservation = await this.reservationAccessor.get(turnContext, null)

        // Generate a dialog context for our dialog set.
        const dc = await this.dialogSet.createContext(turnContext)

        if (!dc.activeDialog) {
          // If there is no active dialog, check whether we have a reservation yet.
          if (!reservation) {
            // If not, start the dialog.
            await dc.beginDialog(RESERVATION_DIALOG)
          } else {
            // Otherwise, send a status message.
            await turnContext.sendActivity(
              `We'll see you ${reservation.date}.`)
          }
        } else {
          // Continue the dialog.
          const dialogTurnResult = await dc.continueDialog()

          // If the dialog completed this turn, record the reservation info.
          if (dialogTurnResult.status === DialogTurnStatus.complete) {
            await this.reservationAccessor.set(
              turnContext,
              dialogTurnResult.result)

            // Send a confirmation message to the user.
            await turnContext.sendActivity(
              `Your party of ${dialogTurnResult.result.size} is ` +
                            `confirmed for ${dialogTurnResult.result.date}.`)
          }
        }

        // Save the updated dialog state into the conversation state.
        await this.conversationState.saveChanges(turnContext, false)
        break
      case ActivityTypes.EndOfConversation:
      case ActivityTypes.DeleteUserData:
        break
      default:
        break
    }
  }
}

module.exports.MyBot = MyBot

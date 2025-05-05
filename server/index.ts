import http from 'node:http'

import express from 'express'
import { Server, type DefaultEventsMap } from 'socket.io'

import database from './database.js'
import { serveFrontend } from './frontend.js'
import type { UserAnswer } from '../types/database.ts'
import type { ClientToServerEvents, ServerToClientEvents, SocketData } from '../types/server.ts'

const app = express()
serveFrontend(app)

const server = http.createServer(app)
const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  DefaultEventsMap,
  SocketData
>(server)

io.on('connection', (socket) => {
  socket.data = {
    userId: null,
    userGroup: null
  }

  socket.emit('questions', database.getQuestions())
  socket.emit('activeQuestion', database.getActiveQuestion())

  socket.on('setUser', (userId, userGroup) => {
    socket.data.userId = userId
    socket.data.userGroup = userGroup

    console.log(`User ${userId} group ${userGroup} connected`)

    // set user's previous answers to new group
    database.updateUserGroup(userId, userGroup).then(() => {
      const question = database.getActiveQuestion()

      // send all user's previous answers
      socket.emit('userAnswers', database.getAnswersByUser(userId))

      // send current question
      if (question) {
        socket.emit('activeQuestion', question)
        socket.emit('userAnswerByQuestion', question, database.getAnswerByUserAndQuestion(userId, question))

        // sync teammates' answers for everyone
        io.fetchSockets().then((sockets) => {
          sockets.forEach((s) => {
            if (s.data.userGroup) {
              s.emit('groupAnswersByQuestion', question, database.getAnswersByQuestionAndGroup(question, s.data.userGroup))
            }
          })
        })
      }
    })
  })

  socket.on('setPresentation', (isPresentation) => {
    if (isPresentation) {
      socket.data.userId = null
      socket.data.userGroup = null
      socket.join('presentation')

      console.log('Presentation client connected')
    } else if (socket.rooms.has('presentation')) {
      socket.leave('presentation')

      console.log('Presentation client disconnected')
    }
  })

  socket.on('getQuestions', () => {
    io.emit('questions', database.getQuestions())
  })

  socket.on('getQuestion', (id) => {
    const question = database.getQuestion(id)
    if (question) {
      socket.emit('question', question)
    }
  })

  socket.on('getActiveQuestion', () => {
    const question = database.getActiveQuestion()
    if (question) {
      socket.emit('activeQuestion', database.getActiveQuestion())

      if (socket.data.userId) {
        socket.emit('userAnswerByQuestion', question, database.getAnswerByUserAndQuestion(socket.data.userId, question))
      }

      if (socket.data.userGroup) {
        socket.emit('groupAnswersByQuestion', question, database.getAnswersByQuestionAndGroup(question, socket.data.userGroup))
      }
    }
  })

  socket.on('setActiveQuestion', (id) => {
    console.log(`Switching active question to #${id}`)

    database.setActiveQuestion(id).then(() => {
      const question = database.getActiveQuestion()

      // send back new value to all clients
      io.emit('activeQuestion', question)
      if (question) {
        io.fetchSockets().then((sockets) => {
          sockets.forEach((s) => {
            // send user their previous answer
            if (s.data.userId) {
              s.emit('userAnswerByQuestion', question, database.getAnswerByUserAndQuestion(s.data.userId, question))
            }

            // send group their teammates' answers
            if (s.data.userGroup) {
              s.emit('groupAnswersByQuestion', question, database.getAnswersByQuestionAndGroup(question, s.data.userGroup))
            }
          })
        })
      }
    })
  })

  socket.on('getUserAnswers', () => {
    if (socket.data.userId) {
      socket.emit('userAnswers', database.getAnswersByUser(socket.data.userId))
    }
  })

  socket.on('getAnswersByQuestion', (questionId) => {
    if (socket.rooms.has('presentation')) {
      socket.emit('answersByQuestion', questionId, database.getAnswersByQuestion(questionId))
    }
  })

  socket.on('getUserAnswerByQuestion', (questionId) => {
    if (socket.data.userId) {
      socket.emit('userAnswerByQuestion', questionId, database.getAnswerByUserAndQuestion(socket.data.userId, questionId))
    }
  })

  socket.on('getGroupAnswersByQuestion', (questionId) => {
    if (socket.data.userGroup) {
      socket.emit('groupAnswersByQuestion', questionId, database.getAnswersByQuestionAndGroup(questionId, socket.data.userGroup))
    }
  })

  socket.on('getValuesByGroup', () => {
    if (socket.rooms.has('presentation')) {
      socket.emit('valuesByGroup', database.getValuesByGroup())
    }
  })

  socket.on('submitAnswer', (questionId, answerKey) => {
    if (socket.data.userId && socket.data.userGroup) {
      const answer: UserAnswer = {
        userId: socket.data.userId,
        userGroup: socket.data.userGroup,
        questionId,
        answerKey,
      }

      console.log(`Submitting new answer: ${JSON.stringify(answer)}`)

      database.submitAnswer(answer).then(() => {
        // send user their answer for feedback
        socket.emit('userAnswerByQuestion', questionId, database.getAnswerByUserAndQuestion(socket.data.userId ?? '', questionId))
        socket.emit('userAnswers', database.getAnswersByUser(socket.data.userId ?? ''))

        io.emit('answersCount', database.getAnswersCount())
        io.fetchSockets().then((sockets) => {
          sockets.forEach((s) => {
            // send group their teammates' answers
            if (s.data.userGroup && s.data.userGroup === socket.data.userGroup) {
              s.emit('groupAnswersByQuestion', questionId, database.getAnswersByQuestionAndGroup(questionId, s.data.userGroup))
            }

            // send presentation statistics
            if (s.rooms.has('presentation')) {
              s.emit('answersByQuestion', questionId, database.getAnswersByQuestion(questionId))
              s.emit('valuesByGroup', database.getValuesByGroup())
            }
          })
        })
      })
    }
  })

  socket.on('getAnswersCount', () => {
    socket.emit('answersCount', database.getAnswersCount())
  })

  socket.on('clearData', () => {
    console.log('Clearing all data')

    database.clearData().then(() => {
      io.emit('activeQuestion', database.getActiveQuestion())
      io.emit('userAnswers', {})
      io.emit('valuesByGroup', {})
      io.emit('answersCount', database.getAnswersCount())

      database.getQuestions().forEach((question) => {
        io.emit('userAnswerByQuestion', question.id, null)
        io.emit('answersByQuestion', question.id, {})
        io.emit('groupAnswersByQuestion', question.id, {})
      })
    })
  })
})

server.listen(5174, () => {
  console.log('Socket.IO server running on http://localhost:5174')
})
